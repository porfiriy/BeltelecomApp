<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class EquipmentType extends Model
{
    use HasFactory;

    public function equipments()
    {
        return $this->hasMany(Equipment::class);
    }
}
