<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
}