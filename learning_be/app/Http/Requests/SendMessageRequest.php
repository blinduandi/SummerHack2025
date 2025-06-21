<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
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
            'message' => 'required|string|min:1|max:1000',
            'context_data' => 'nullable|array',
            'context_data.step_id' => 'nullable|exists:course_steps,id',
            'context_data.code_snippet' => 'nullable|string|max:5000',
            'context_data.error_message' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'message.required' => 'Message content is required.',
            'message.min' => 'Message cannot be empty.',
            'message.max' => 'Message cannot exceed 1000 characters.',
            'context_data.step_id.exists' => 'Invalid course step reference.',
            'context_data.code_snippet.max' => 'Code snippet is too long (max 5000 characters).',
            'context_data.error_message.max' => 'Error message is too long (max 1000 characters).',
        ];
    }
}
