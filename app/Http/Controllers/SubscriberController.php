<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use App\Models\SubscriberService;
use App\Models\Equipment;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\EquipmentLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SubscriberController extends Controller
{
    /**
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Валидация входных данных
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'registration_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Создание абонента
        $subscriber = Subscriber::create([
            'full_name' => $request->full_name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'registration_date' => $request->registration_date ?? now()->toDateString(),
        ]);

        // Логирование действия
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'Добавление абонента',
            'details' => "Добавлен абонент: {$subscriber->full_name} (ID: {$subscriber->id})",
            'logged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Абонент успешно добавлен',
            'subscriber' => $subscriber,
        ], 201);
    }

    public function index()
    {
        return response()->json(Subscriber::all());
    }

    public function destroy($id)
    {
        \Log::info('SubscriberController: Попытка удаления абонента', ['id' => $id]);
        try {
            // Найти абонента
            $subscriber = Subscriber::findOrFail($id);

            // Получить все equipment_id, связанные с абонентом
            $equipmentIds = Equipment::where('subscriber_id', $id)->pluck('id');

            // Удалить записи в equipment_logs, связанные с equipment_id
            if (Schema::hasTable('equipment_logs') && $equipmentIds->isNotEmpty()) {
                Log::info('SubscriberController: Удаление записей из equipment_logs для equipment_ids', ['equipment_ids' => $equipmentIds]);
                EquipmentLog::whereIn('equipment_id', $equipmentIds)->delete();
            }

            // Удалить связанные записи в equipment
            if (Schema::hasTable('equipment')) {
                Log::info('SubscriberController: Удаление записей из equipment', ['subscriber_id' => $id]);
                Equipment::where('subscriber_id', $id)->delete();
            }

            // Удалить связанные записи в equipment_logs для subscriber_id
            if (Schema::hasTable('equipment_logs')) {
                Log::info('SubscriberController: Удаление записей из equipment_logs', ['subscriber_id' => $id]);
                EquipmentLog::where('subscriber_id', $id)->delete();
            }

            // Удалить связанные записи в subscriber_service
            if (Schema::hasTable('subscriber_service')) {
                Log::info('SubscriberController: Удаление записей из subscriber_service', ['subscriber_id' => $id]);
                SubscriberService::where('subscriber_id', $id)->delete();
            }

            // Логирование удаления абонента
            \App\Models\ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'deleted_subscriber',
                'details' => "Удален абонент: {$subscriber->full_name}",
                'logged_at' => now(),
            ]);

            // Удалить абонента
            $subscriber->delete();

            \Log::info('SubscriberController: Абонент успешно удален', ['id' => $id]);
            return response()->json(['message' => 'Абонент успешно удален']);
        } catch (\Exception $e) {
            \Log::error('SubscriberController: Ошибка при удалении абонента', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Ошибка при удалении абонента'], 500);
        }
    }
}