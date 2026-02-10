<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'slug', 'color'];

    public function inscriptions()
    {
        return $this->belongsToMany(Inscription::class);
    }

    public function tasks()
    {
        return $this->hasmany(Task::class);
    }
}
