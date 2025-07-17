<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Service;
use App\Models\Subscriber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Equipment;
use App\Models\EquipmentLog;

class ServiceController extends Controller
{
    public function index()
    {
        try {
            $services = Service::select('id', 'name', 'type')->get();
            return response()->json($services);
        } catch (\Exception $e) {
            Log::error('Ошибка в index (ServiceController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка загрузки услуг'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:internet,tv,phone,extra',
            ]);

            $service = Service::create([
                'name' => $request->name,
                'type' => $request->type,
            ]);

            return response()->json($service, 201);
        } catch (\Exception $e) {
            Log::error('Ошибка в store (ServiceController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при добавлении услуги', 'details' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $service = Service::findOrFail($id);

            // Проверяем, не привязана ли услуга к абонентам
            $hasSubscribers = DB::table('subscriber_service')
                ->where('service_id', $id)
                ->exists();
            if ($hasSubscribers) {
                return response()->json(['error' => 'Нельзя удалить услугу, которая назначена абонентам'], 400);
            }

            $service->delete();
            return response()->json(['message' => 'Услуга успешно удалена']);
        } catch (\Exception $e) {
            Log::error('Ошибка в destroy (ServiceController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при удалении услуги', 'details' => $e->getMessage()], 500);
        }
    }

    public function getSubscriberServices($id)
    {
        try {
            $services = DB::table('services')
                ->join('subscriber_service', 'services.id', '=', 'subscriber_service.service_id')
                ->where('subscriber_service.subscriber_id', $id)
                ->select('services.id', 'services.name', 'services.type', 'subscriber_service.created_at', 'subscriber_service.updated_at')
                ->get();
            return response()->json($services);
        } catch (\Exception $e) {
            Log::error('Ошибка в getSubscriberServices (ServiceController): ' . $e->getMessage());
            return response()->json([]);
        }
    }

    public function getSubscriberEquipment($id)
    {
        try {
            $equipment = Equipment::with(['equipmentType'])
                ->where('subscriber_id', $id)
                ->select('id', 'model', 'equipment_type_id', 'status')
                ->get();
            return response()->json($equipment);
        } catch (\Exception $e) {
            Log::error('Ошибка в getSubscriberEquipment (ServiceController): ' . $e->getMessage());
            return response()->json([]);
        }
    }

    public function assignService(Request $request)
    {
        try {
            $request->validate([
                'subscriber_id' => 'required|exists:subscribers,id',
                'service_id' => 'required|exists:services,id',
                'equipment_ids' => 'sometimes|array',
                'equipment_ids.*' => 'exists:equipment,id',
                'issue_date' => 'sometimes|date',
            ]);

            Log::info('Получены данные: ', [
                'subscriber_id' => $request->subscriber_id,
                'service_id' => $request->service_id,
                'equipment_ids' => $request->equipment_ids,
                'issue_date' => $request->issue_date,
            ]);

            $exists = DB::table('subscriber_service')
                ->where('subscriber_id', $request->subscriber_id)
                ->where('service_id', $request->service_id)
                ->exists();
            if ($exists) {
                return response()->json(['error' => 'Эта услуга уже назначена абоненту'], 400);
            }

            $service = Service::findOrFail($request->service_id);
            if (in_array($service->type, ['internet', 'tv'])) {
                $existingService = DB::table('subscriber_service')
                    ->join('services', 'services.id', '=', 'subscriber_service.service_id')
                    ->where('subscriber_service.subscriber_id', $request->subscriber_id)
                    ->where('services.type', $service->type)
                    ->exists();
                if ($existingService) {
                    return response()->json(['error' => "У абонента уже есть тариф {$service->type}"], 400);
                }
            }

            if ($service->type !== 'phone') {
                $hasTelephony = DB::table('subscriber_service')
                    ->join('services', 'services.id', '=', 'subscriber_service.service_id')
                    ->where('subscriber_service.subscriber_id', $request->subscriber_id)
                    ->where('services.type', 'phone')
                    ->exists();
                if (!$hasTelephony) {
                    return response()->json(['error' => 'Услуга телефонии обязательна'], 400);
                }
            }

            $subscriber = Subscriber::findOrFail($request->subscriber_id);
            $subscriber->services()->attach($request->service_id);

            if ($request->has('equipment_ids') && $request->has('issue_date')) {
                foreach ($request->equipment_ids as $equipment_id) {
                    $equipment = Equipment::findOrFail($equipment_id);
                    if ($equipment->status !== 'free') {
                        return response()->json(['error' => "Оборудование {$equipment->model} не доступно"], 400);
                    }
                    $equipment->update([
                        'subscriber_id' => $request->subscriber_id,
                        'status' => 'issued',
                    ]);
                    EquipmentLog::create([
                        'equipment_id' => $equipment->id,
                        'subscriber_id' => $request->subscriber_id,
                        'user_id' => Auth::id(),
                        'action' => 'issued',
                        'logged_at' => $request->issue_date,
                    ]);
                }
            }

            return response()->json(['message' => 'Услуга и оборудование успешно назначены'], 201);
        } catch (\Exception $e) {
            Log::error('Ошибка в assignService (ServiceController): ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Ошибка при назначении услуги', 'details' => $e->getMessage()], 500);
        }
    }

    public function removeService($id)
    {
        try {
            $pivot = DB::table('subscriber_service')->where('id', $id)->first();
            if (!$pivot) {
                return response()->json(['error' => 'Запись не найдена'], 404);
            }

            // Проверяем, не является ли услуга телефонией (обязательная)
            $service = Service::findOrFail($pivot->service_id);
            if ($service->type === 'phone') {
                return response()->json(['error' => 'Услуга телефонии не может быть удалена'], 400);
            }

            DB::table('subscriber_service')->where('id', $id)->delete();
            return response()->json(['message' => 'Услуга успешно удалена']);
        } catch (\Exception $e) {
            Log::error('Ошибка в removeService (ServiceController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при удалении услуги'], 500);
        }
    }
}