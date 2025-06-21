<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'recommendation_score',
        'recommendation_type',
        'recommendation_factors',
        'is_dismissed',
        'recommended_at',
    ];

    protected $casts = [
        'recommendation_score' => 'decimal:2',
        'recommendation_factors' => 'array',
        'is_dismissed' => 'boolean',
        'recommended_at' => 'datetime',
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
    public function scopeActive($query)
    {
        return $query->where('is_dismissed', false);
    }

    public function scopeDismissed($query)
    {
        return $query->where('is_dismissed', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('recommendation_type', $type);
    }

    public function scopeHighScore($query, $minScore = 70)
    {
        return $query->where('recommendation_score', '>=', $minScore);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('recommended_at', '>=', now()->subDays($days));
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('recommendation_score', 'desc')
                    ->orderBy('recommended_at', 'desc');
    }

    // Helper methods
    public function isDismissed(): bool
    {
        return $this->is_dismissed;
    }

    public function dismiss(): void
    {
        $this->update(['is_dismissed' => true]);
    }

    public function isHighPriority(): bool
    {
        return $this->recommendation_score >= 80;
    }

    public function getScoreLevel(): string
    {
        if ($this->recommendation_score >= 90) {
            return 'excellent';
        } elseif ($this->recommendation_score >= 80) {
            return 'high';
        } elseif ($this->recommendation_score >= 60) {
            return 'medium';
        } else {
            return 'low';
        }
    }
}
