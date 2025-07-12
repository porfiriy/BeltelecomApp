<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Equipment;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $equipment = [
            ['model' => 'ZTE FTEG 560', 'equipment_type_id' => 1, 'status' => 'free'],
            ['model' => 'Huawei MA670V', 'equipment_type_id' => 2, 'status' => 'free'],
            ['model' => 'Nokia G-140W', 'equipment_type_id' => 1, 'status' => 'free'],
            ['model' => 'TP-Link Archer C6', 'equipment_type_id' => 1, 'status' => 'free'],
            ['model' => 'Amino Amigo 7X', 'equipment_type_id' => 3, 'status' => 'free'],
            ['model' => 'Sagemcom STB 500', 'equipment_type_id' => 3, 'status' => 'free'],
            ['model' => 'Hikvision DS-2CD2023', 'equipment_type_id' => 4, 'status' => 'free'],
            ['model' => 'Dahua IPC-HDW1431', 'equipment_type_id' => 4, 'status' => 'free'],
        ];

        foreach ($equipment as $item) {
            Equipment::create($item);
        }
    }
}