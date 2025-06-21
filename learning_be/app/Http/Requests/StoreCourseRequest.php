<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'programming_language_id' => 'required|exists:programming_languages,id',
            'program_id' => 'nullable|exists:programs,id',
            'estimated_duration_hours' => 'nullable|integer|min:1|max:1000',
            'prerequisites' => 'nullable|array',
            'learning_objectives' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Course title is required.',
            'description.required' => 'Course description is required.',
            'difficulty_level.required' => 'Difficulty level is required.',
            'difficulty_level.in' => 'Difficulty level must be beginner, intermediate, or advanced.',
            'programming_language_id.required' => 'Programming language is required.',
            'programming_language_id.exists' => 'Selected programming language is invalid.',
            'program_id.exists' => 'Selected program is invalid.',
            'estimated_duration_hours.integer' => 'Duration must be a number.',
            'estimated_duration_hours.min' => 'Duration must be at least 1 hour.',
            'estimated_duration_hours.max' => 'Duration cannot exceed 1000 hours.',
        ];
    }
}
