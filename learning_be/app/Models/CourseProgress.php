<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'status',
        'progress_percentage',
        'started_at',
        'completed_at',
        'last_accessed_at',
        'checkpoint_data',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'checkpoint_data' => 'array',
        'progress_percentage' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // Scopes
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function markAsStarted(): void
    {
        if ($this->status === 'not_started') {
            $this->update([
                'status' => 'in_progress',
                'started_at' => now(),
                'last_accessed_at' => now(),
            ]);
        }
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'progress_percentage' => 100,
            'completed_at' => now(),
            'last_accessed_at' => now(),
        ]);
    }

    public function updateProgress(int $percentage): void
    {
        $this->update([
            'progress_percentage' => min($percentage, 100),
            'last_accessed_at' => now(),
        ]);

        if ($percentage >= 100) {
            $this->markAsCompleted();
        }
    }

    public function resetProgress(): void
    {
        $this->update([
            'status' => 'reset',
            'progress_percentage' => 0,
            'started_at' => null,
            'completed_at' => null,
            'last_accessed_at' => now(),
        ]);
    }
}
