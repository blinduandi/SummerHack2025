<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OngProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'ong_id',
        'title',
        'description',
        'requirements',
        'skills_needed', // JSON array
        'due_date',
        'status',
        'winner_user_id',
    ];

    protected $casts = [
        'skills_needed' => 'array',
        'due_date' => 'datetime',
    ];

    public function applications()
    {
        return $this->hasMany(OngProjectApplication::class, 'project_id');
    }

    public function messages()
    {
        return $this->hasMany(OngProjectMessage::class, 'project_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function ong()
    {
        return $this->belongsTo(User::class, 'ong_id');
    }
}
