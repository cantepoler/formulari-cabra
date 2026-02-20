<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'capacity',
        'location',
        'color',
        'visible_to_roles',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'start_time'       => 'datetime',
        'end_time'         => 'datetime',
        'visible_to_roles' => 'array', // jsonb ↔ PHP array
        'is_active'        => 'boolean',
    ];

    // Relacions

    public function submissions(): BelongsToMany
    {
        return $this->belongsToMany(Submission::class)
            ->withTimestamps();
    }

    // Helpers

    /**
     * Number of confirmed signups for this task.
     */
    public function getCurrentSignupsAttribute(): int
    {
        return $this->submissions()->count();
    }

    /**
     * Remaining spots. Returns 0 if at capacity.
     */
    public function getRemainingCapacityAttribute(): int
    {
        return max(0, $this->capacity - $this->current_signups);
    }

    /**
     * Whether the task has space for one more person.
     */
    public function hasCapacity(): bool
    {
        return $this->remaining_capacity > 0;
    }

    /**
     * Whether a given set of role slugs can see/sign up for this task.
     * If visible_to_roles is null/empty → visible to everyone.
     */
    public function isVisibleToRoles(array $roleSlugs): bool
    {
        if (empty($this->visible_to_roles)) {
            return true;
        }

        return count(array_intersect($this->visible_to_roles, $roleSlugs)) > 0;
    }

// Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('start_time');
    }

    public function scopeWithCapacity($query)
    {
        return $query->withCount('submissions')
            ->having('submissions_count', '<', \DB::raw('capacity'));
    }

    /**
     * Scope: only tasks visible to a given list of role slugs.
     * Tasks with null visible_to_roles are always included.
     */
    public function scopeVisibleToRoles($query, array $roleSlugs)
    {
        return $query->where(function ($q) use ($roleSlugs) {
            $q->whereNull('visible_to_roles')
                ->orWhereRaw(
                    'visible_to_roles ?| array[' . implode(',', array_fill(0, count($roleSlugs), '?')) . ']',
                    $roleSlugs
                );
        });
    }
}
