<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EquipmentType;

class EquipmentTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $types = ['Роутер', 'Модем', 'ТВ-приставка', 'Камера'];
        foreach ($types as $type) {
            EquipmentType::create(['name' => $type]);
        }
    }
}
