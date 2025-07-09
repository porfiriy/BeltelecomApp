<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\SubscriberService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

    public function assignService(Request $request)
    {
        $request->validate([
            'subscriber_id' => 'required|exists:subscribers,id',
            'service_id' => 'required|exists:services,id',
        ]);

        try {
            // Проверяем ограничения: не более одного тарифа интернета и ТВ
            $service = Service::findOrFail($request->service_id);
            if (in_array($service->type, ['internet', 'tv'])) {
                $existingService = SubscriberService::where('subscriber_id', $request->subscriber_id)
                    ->whereHas('service', function ($query) use ($service) {
                        $query->where('type', $service->type);
                    })
                    ->first();
                if ($existingService) {
                    return response()->json(['error' => "У абонента уже есть тариф {$service->type}"], 400);
                }
            }

            // Проверяем обязательность телефонии
            if ($service->type !== 'telephony') {
                $hasTelephony = SubscriberService::where('subscriber_id', $request->subscriber_id)
                    ->whereHas('service', function ($query) {
                        $query->where('type', 'telephony');
                    })
                    ->exists();
                if (!$hasTelephony) {
                    return response()->json(['error' => 'Услуга телефонии обязательна'], 400);
                }
            }

            $subscriberService = SubscriberService::create([
                'subscriber_id' => $request->subscriber_id,
                'service_id' => $request->service_id,
            ]);

            return response()->json(['message' => 'Услуга успешно назначена', 'data' => $subscriberService], 201);
        } catch (\Exception $e) {
            Log::error('Ошибка в assignService (ServiceController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при назначении услуги'], 500);
        }
    }

    public function removeService($id)
    {
        try {
            $subscriberService = SubscriberService::findOrFail($id);

            // Проверяем, не является ли услуга телефонией (обязательная)
            $service = Service::findOrFail($subscriberService->service_id);
            if ($service->type === 'telephony') {
                return response()->json(['error' => 'Услуга телефонии не может быть удалена'], 400);
            }

            $subscriberService->delete();
            return response()->json(['message' => 'Услуга успешно удалена']);
        } catch (\Exception $e) {
            Log::error('Ошибка в removeService (ServiceController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при удалении услуги'], 500);
        }
    }
}