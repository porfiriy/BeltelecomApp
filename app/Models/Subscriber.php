<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    use HasFactory;

    protected $fillable = ['full_name', 'address', 'phone', 'email', 'registration_date'];

    public function services()
    {
        return $this->belongsToMany(Service::class, 'subscriber_service', 'subscriber_id', 'service_id')->withTimestamps();
    }

    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'subscriber_id');
    }
}