<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;



    protected $fillable = ['model', 'equipment_type_id', 'subscriber_id', 'status'];

    public function type()
    {
        return $this->belongsTo(EquipmentType::class, 'equipment_type_id');
    }
    public function equipmentType()
    {
        return $this->belongsTo(EquipmentType::class, 'equipment_type_id');
    }

    public function subscriber()
    {
        return $this->belongsTo(Subscriber::class, 'subscriber_id');
    }

    public function logs()
    {
        return $this->hasMany(EquipmentLog::class, 'equipment_id');
    }
}
