<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EquipmentType;
use Illuminate\Support\Facades\Log;

class EquipmentTypeController extends Controller
{
    public function index()
    {
        try {
            $types = EquipmentType::select('id', 'name')->get();
            return response()->json($types);
        } catch (\Exception $e) {
            Log::error('Ошибка в index (EquipmentTypeController): ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка загрузки типов оборудования'], 500);
        }
    }
}