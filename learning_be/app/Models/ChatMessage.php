<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'sender_type',
        'message',
        'context_data',
        'is_helpful',
        'read_at',
    ];

    protected $casts = [
        'context_data' => 'array',
        'is_helpful' => 'boolean',
        'read_at' => 'datetime',
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
    public function scopeUserMessages($query)
    {
        return $query->where('sender_type', 'user');
    }

    public function scopeBotMessages($query)
    {
        return $query->where('sender_type', 'bot');
    }

    public function scopeBySender($query, $senderType)
    {
        return $query->where('sender_type', $senderType);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    // Helper methods
    public function isFromUser(): bool
    {
        return $this->sender_type === 'user';
    }

    public function isFromBot(): bool
    {
        return $this->sender_type === 'bot';
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public function markAsRead(): void
    {
        if (!$this->isRead()) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsHelpful(bool $helpful): void
    {
        $this->update(['is_helpful' => $helpful]);
    }
}
