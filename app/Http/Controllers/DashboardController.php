<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        \Log::info('DashboardController: Запрос к /api/dashboard');
        try {
            $recentActivities = ActivityLog::with('user')
                ->orderBy('logged_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($activity) {
                    \Log::info('Processing activity: ' . json_encode($activity));
                    return [
                        'id' => $activity->id,
                        'user_name' => $activity->user ? $activity->user->name : 'Неизвестный пользователь',
                        'action' => $activity->action,
                        'details' => $activity->details,
                        'logged_at' => Carbon::parse($activity->logged_at)->format('d.m.Y H:i'),
                    ];
                });

            \Log::info('DashboardController: Успешно обработано', ['activities' => $recentActivities]);
            return response()->json([
                'recentActivities' => $recentActivities,
            ]);
        } catch (\Exception $e) {
            \Log::error('DashboardController: Ошибка', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Внутренняя ошибка сервера'], 500);
        }
    }
}