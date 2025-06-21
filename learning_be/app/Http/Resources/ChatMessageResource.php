<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
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
            'message' => $this->message,
            'sender_type' => $this->sender_type,
            'context_data' => $this->context_data,
            'is_helpful' => $this->is_helpful,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'course' => $this->whenLoaded('course', fn() => [
                'id' => $this->course->id,
                'title' => $this->course->title,
            ]),
            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),

            // Formatted timestamp for better UX
            'time_ago' => $this->created_at->diffForHumans(),
        ];
    }
}
