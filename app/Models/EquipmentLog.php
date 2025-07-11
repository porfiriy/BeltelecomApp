<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentLog extends Model
{
    use HasFactory;
    protected $fillable = ['equipment_id', 'subscriber_id', 'user_id', 'action', 'logged_at'];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class, 'equipment_id');
    }

    public function subscriber()
    {
        return $this->belongsTo(Subscriber::class, 'subscriber_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
