<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'start_time',
        'end_time',
        'capacity',
        'category',
        'role_id'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];
    public function inscriptions()
    {
        return $this->belongsToMany(Inscription::class)
            ->withTimestamps();
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // Retorna true si la tasca ja està plena
    // Ús: $task->is_full
    public function getIsFullAttribute()
    {
        if (is_null($this->capacity)) {
            return false;
        }

        return $this->inscriptions()->count() >= $this->capacity;
    }
}
