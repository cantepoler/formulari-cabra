<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Inscription extends Model
{
    use softDeletes, Notifiable;

    protected $fillable = [
        'name', 'surname', 'birth_date', 'email', 'phone', 'responsible_name',
        'dinner_attending', 'dinner_notes', 'dinner_qr_token',
        'form_answers'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'dinner_attending' => 'boolean',
        'form_answers' => 'array',      // JSON a Array PHP
        'dinner_notes' => 'encrypted',  // <--- Xifratge de salut
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class)
            ->withTimestamps();
    }
}
