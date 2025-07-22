<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriberService extends Model
{
    protected $table = 'subscriber_service';

    protected $fillable = [
        'subscriber_id',
        'service_id',
    ];

    // Связь с моделью Subscriber
    public function subscriber()
    {
        return $this->belongsTo(Subscriber::class);
    }

    // Связь с моделью Service
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}