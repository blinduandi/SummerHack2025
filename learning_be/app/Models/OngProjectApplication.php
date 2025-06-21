<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OngProjectApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'status', // applied, accepted, rejected, completed
        'github_repo',
        'images', // JSON array
        'feedback',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(OngProject::class, 'project_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
