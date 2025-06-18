<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $services = [
            ['name' => 'Домашний интернет Рекорд 10', 'type' => 'internet'],
            ['name' => 'Домашний интернет Рекорд 20', 'type' => 'internet'],
            ['name' => 'Домашний интернет Рекорд 50', 'type' => 'internet'],
            ['name' => 'Домашний интернет Рекорд 100 Промо', 'type' => 'internet'],

            ['name' => 'Ясна 100 Лайт', 'type' => 'tv'],
            ['name' => 'Ясна 200 Промо', 'type' => 'tv'],
            ['name' => 'Ясна SMART', 'type' => 'tv'],
            ['name' => 'Телевидение Zala', 'type' => 'tv'],

            ['name' => 'VOIP Телефония', 'type' => 'phone'],

            ['name' => 'Умный дом', 'type' => 'extra'],
            ['name' => 'Видеоконтроль', 'type' => 'extra'],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
