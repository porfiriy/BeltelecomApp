<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type'];

    public function subscribers()
    {
        return $this->belongsToMany(Subscriber::class, 'subscriber_service', 'service_id', 'subscriber_id')->withTimestamps();
    }
}