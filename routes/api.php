<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubscriberController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\EquipmentTypeController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    // Маршруты для абонентов
    Route::get('/subscribers', [SubscriberController::class, 'index']);
    Route::post('/subscribers', [SubscriberController::class, 'store']);
    Route::delete('/subscribers/{id}', [SubscriberController::class, 'destroy']);

    // Маршруты для услуг
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/subscribers/{id}/services', [ServiceController::class, 'getSubscriberServices']);
    Route::post('/subscriber_service', [ServiceController::class, 'assignService']);
    Route::delete('/subscriber_service/{id}', [ServiceController::class, 'removeService']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    // Маршруты для оборудования
    Route::get('/equipment', [EquipmentController::class, 'index']);
    Route::post('/equipment', [EquipmentController::class, 'store']);
    Route::post('/subscriber_equipment', [EquipmentController::class, 'issue']);
    Route::post('/replace_equipment', [EquipmentController::class, 'replace']);

    // Маршруты для типов оборудования
    Route::get('/equipment_types', [EquipmentTypeController::class, 'index']);
});