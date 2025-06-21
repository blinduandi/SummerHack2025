<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'content',
        'difficulty_level',
        'estimated_duration_hours',
        'order_in_program',
        'is_active',
        'program_id',
        'programming_language_id',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'estimated_duration_hours' => 'integer',
        'order_in_program' => 'integer',
    ];

    // Relationships
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function programmingLanguage(): BelongsTo
    {
        return $this->belongsTo(ProgrammingLanguage::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(CourseStep::class)->orderBy('step_order');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(CourseProgress::class);
    }

    public function gitRepositories(): HasMany
    {
        return $this->hasMany(GitRepository::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(CourseRecommendation::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeByLanguage($query, $languageId)
    {
        return $query->where('programming_language_id', $languageId);
    }
}
