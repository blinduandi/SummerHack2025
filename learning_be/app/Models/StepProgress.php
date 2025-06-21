<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StepProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_step_id',
        'status',
        'started_at',
        'completed_at',
        'last_accessed_at',
        'progress_data',
        'attempts_count',
        'score',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'progress_data' => 'array',
        'attempts_count' => 'integer',
        'score' => 'decimal:2',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function courseStep(): BelongsTo
    {
        return $this->belongsTo(CourseStep::class);
    }

    // Scopes
    public function scopeHidden($query)
    {
        return $query->where('status', 'hidden');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeSolved($query)
    {
        return $query->where('status', 'solved');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helper methods
    public function isHidden(): bool
    {
        return $this->status === 'hidden';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isSolved(): bool
    {
        return $this->status === 'solved';
    }

    public function markAsStarted(): void
    {
        if ($this->status === 'hidden') {
            $this->update([
                'status' => 'in_progress',
                'started_at' => now(),
                'last_accessed_at' => now(),
            ]);
        }
    }

    public function markAsSolved(float $score = null): void
    {
        $this->update([
            'status' => 'solved',
            'completed_at' => now(),
            'last_accessed_at' => now(),
            'score' => $score,
        ]);
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts_count');
        $this->update(['last_accessed_at' => now()]);
    }

    public function updateProgressData(array $data): void
    {
        $this->update([
            'progress_data' => array_merge($this->progress_data ?? [], $data),
            'last_accessed_at' => now(),
        ]);
    }

    public function addNote(string $note): void
    {
        $this->update([
            'notes' => $note,
            'last_accessed_at' => now(),
        ]);
    }
}
