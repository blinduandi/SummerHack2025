<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'user_type' => $this->user_type,
            'bio' => $this->bio,
            'avatar' => $this->avatar,
            'skills' => $this->skills,
            'achievements' => $this->achievements,
            'preferences' => $this->preferences,
            'is_email_verified' => $this->email_verified_at !== null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Conditional relationships
            'enrollments_count' => $this->when(
                $this->relationLoaded('enrollments'),
                fn() => $this->enrollments->count()
            ),
            'completed_courses_count' => $this->when(
                $this->relationLoaded('courseProgress'),
                fn() => $this->courseProgress->where('completion_percentage', 100)->count()
            ),
        ];
    }
}
