<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Equipment;
use App\Models\EquipmentLog;
use App\Models\Subscriber;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EquipmentController extends Controller
{
    public function index()
    {
        try {
            $equipment = Equipment::with(['equipmentType'])->select('id', 'model', 'equipment_type_id', 'subscriber_id', 'status')->get();
            return response()->json($equipment);
        } catch (\Exception $e) {
            Log::error('Ошибка в index (EquipmentController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка загрузки оборудования'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::debug('Полученные данные:', $request->all());
            $request->validate([
                'model' => 'required|string|max:255|unique:equipment,model',
                'equipment_type_id' => 'required|exists:equipment_types,id',
            ]);

            $equipment = Equipment::create([
                'model' => $request->model,
                'equipment_type_id' => $request->equipment_type_id,
                'status' => 'free',
            ]);

            if (Auth::id()) {
                EquipmentLog::create([
                    'equipment_id' => $equipment->id,
                    'user_id' => Auth::id(),
                    'action' => 'created',
                    'logged_at' => now(),
                ]);
            } else {
                Log::warning('Не удалось создать запись в equipment_logs: пользователь не авторизован');
            }

            return response()->json($equipment, 201);
        } catch (\Exception $e) {
            Log::error('Ошибка в store (EquipmentController): ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Ошибка при добавлении оборудования', 'details' => $e->getMessage()], 500);
        }
    }

    public function issue(Request $request)
    {
        try {
            $request->validate([
                'subscriber_id' => 'required|exists:subscribers,id',
                'equipment_id' => 'required|exists:equipment,id',
                'issue_date' => 'required|date',
            ]);

            $equipment = Equipment::findOrFail($request->equipment_id);
            if ($equipment->status !== 'free') {
                return response()->json(['error' => 'Оборудование не доступно'], 400);
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

            return response()->json(['message' => 'Оборудование успешно выдано'], 201);
        } catch (\Exception $e) {
            Log::error('Ошибка в issue (EquipmentController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при выдаче оборудования', 'details' => $e->getMessage()], 500);
        }
    }

    public function replace(Request $request)
    {
        try {
            $request->validate([
                'subscriber_id' => 'required|exists:subscribers,id',
                'old_equipment_id' => 'required|exists:equipment,id',
                'new_equipment_id' => 'required|exists:equipment,id',
                'issue_date' => 'required|date',
            ]);

            $oldEquipment = Equipment::findOrFail($request->old_equipment_id);
            if ($oldEquipment->status !== 'issued' || $oldEquipment->subscriber_id != $request->subscriber_id) {
                return response()->json(['error' => 'Старое оборудование не выдано этому абоненту'], 400);
            }

            $newEquipment = Equipment::findOrFail($request->new_equipment_id);
            if ($newEquipment->status !== 'free') {
                return response()->json(['error' => 'Новое оборудование не доступно'], 400);
            }

            if ($oldEquipment->equipment_type_id !== $newEquipment->equipment_type_id) {
                return response()->json(['error' => 'Новое оборудование должно быть того же типа'], 400);
            }

            $oldEquipment->update([
                'subscriber_id' => null,
                'status' => 'returned',
            ]);

            EquipmentLog::create([
                'equipment_id' => $oldEquipment->id,
                'subscriber_id' => $request->subscriber_id,
                'user_id' => Auth::id(),
                'action' => 'returned',
                'logged_at' => $request->issue_date,
            ]);

            $newEquipment->update([
                'subscriber_id' => $request->subscriber_id,
                'status' => 'issued',
            ]);

            EquipmentLog::create([
                'equipment_id' => $newEquipment->id,
                'subscriber_id' => $request->subscriber_id,
                'user_id' => Auth::id(),
                'action' => 'replaced',
                'logged_at' => $request->issue_date,
            ]);

            return response()->json(['message' => 'Оборудование успешно заменено']);
        } catch (\Exception $e) {
            Log::error('Ошибка в replace (EquipmentController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при замене оборудования', 'details' => $e->getMessage()], 500);
        }
    }
}