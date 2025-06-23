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
        return $this->belongsToMany(Service::class)->withTimestamps();
    }
}