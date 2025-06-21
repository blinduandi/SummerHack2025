<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'difficulty_level' => $this->difficulty_level,
            'estimated_duration_hours' => $this->estimated_duration_hours,
            'prerequisites' => $this->prerequisites,
            'learning_objectives' => $this->learning_objectives,
            'tags' => $this->tags,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'programming_language' => $this->whenLoaded('programmingLanguage'),
            'program' => $this->whenLoaded('program'),
            'teacher' => $this->whenLoaded('teacher', fn() => new UserResource($this->teacher)),

            // Calculated fields
            'steps_count' => $this->when(
                $this->relationLoaded('steps'),
                fn() => $this->steps->count()
            ),
            'enrolled_students_count' => $this->when(
                $this->relationLoaded('enrollments'),
                fn() => $this->enrollments->count()
            ),
            'average_rating' => $this->when(
                isset($this->average_rating),
                $this->average_rating
            ),
        ];
    }
}
