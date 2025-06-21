<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GitRepository extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'repository_name',
        'repository_url',
        'github_repo_id',
        'is_private',
        'status',
        'created_at_github',
    ];

    protected $casts = [
        'is_private' => 'boolean',
        'created_at_github' => 'datetime',
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
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    public function markAsActive(): void
    {
        $this->update(['status' => 'active']);
    }

    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }
}
