<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Submission extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'access_code',
        'email',
        'full_name',
        'birth_date',
        'phone',
        'guardian_name',
        'guardian_phone',
        'attending_dinner',
        'dinner_notes',
        'form_answers',
        'qr_token',
        'qr_sent_at',
        'magic_link_sent_at',
        'status',
    ];

    protected $casts = [
        'birth_date'          => 'date',
        'attending_dinner'    => 'boolean',
        'dinner_notes'        => 'encrypted', // 🔒 Encrypted at rest
        'form_answers'        => 'array',                  // jsonb ↔ PHP array
        'qr_sent_at'          => 'datetime',
        'magic_link_sent_at'  => 'datetime',
    ];

    protected $hidden = [
        'dinner_notes', // Never leak in JSON responses unless explicitly needed
    ];

    // Boot

    protected static function booted(): void
    {
        static::creating(function (Submission $submission) {
            // Auto-generate a human-friendly access code if not set
            if (empty($submission->access_code)) {
                $submission->access_code = static::generateAccessCode();
            }
        });
    }

    // Helpers

    /**
     * Generates a readable 8-char code: e.g. "CABRA-4F2"
     */
    public static function generateAccessCode(): string
    {
        do {
            $code = 'CABRA-' . strtoupper(Str::random(4));
        } while (static::where('access_code', $code)->exists());

        return $code;
    }

    /**
     * Returns age in years (used for Banda/Contrabanda filtering).
     */
    public function getAgeAttribute(): int
    {
        return $this->birth_date->age;
    }

    /**
     * Returns true if under 16 (requires guardian fields).
     */
    public function isMinor(): bool
    {
        return $this->age < 16;
    }

    /**
     * Safely reads a nested key from form_answers jsonb.
     * e.g. $submission->answer('banda_auria.instrument')
     */
    public function answer(string $dotPath): mixed
    {
        return data_get($this->form_answers, $dotPath);
    }

    // Relacions
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)
            ->withTimestamps();
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class)
            ->withTimestamps();
    }

    // Scopes

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeAttendingDinner($query)
    {
        return $query->where('attending_dinner', true);
    }

    public function scopeWithRole($query, string $roleSlug)
    {
        return $query->whereHas('roles', fn ($q) => $q->where('slug', $roleSlug));
    }
}
