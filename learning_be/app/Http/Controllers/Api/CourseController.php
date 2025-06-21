<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['creator', 'programmingLanguage', 'program'])
            ->active()
            ->latest();

        // Filter by program
        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        // Filter by programming language
        if ($request->has('language_id')) {
            $query->byLanguage($request->language_id);
        }

        // Filter by difficulty
        if ($request->has('difficulty')) {
            $query->byDifficulty($request->difficulty);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $courses = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load([
            'creator',
            'programmingLanguage',
            'program',
            'steps' => function($query) {
                $query->active()->ordered();
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => $course
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Only teachers can create courses
        if (!$request->user()->isTeacher()) {
            return response()->json([
                'success' => false,
                'message' => 'Only teachers can create courses'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration_hours' => 'nullable|integer|min:1',
            'order_in_program' => 'nullable|integer|min:0',
            'program_id' => 'nullable|exists:programs,id',
            'programming_language_id' => 'nullable|exists:programming_languages,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // If program_id is provided, check if user owns the program
        if ($request->program_id) {
            $program = Program::find($request->program_id);
            if ($program && $program->created_by !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only add courses to your own programs'
                ], 403);
            }
        }

        $course = Course::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        $course->load(['creator', 'programmingLanguage', 'program']);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $course
        ], 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        // Only the creator can update the course
        if ($course->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own courses'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'content' => 'sometimes|nullable|string',
            'difficulty_level' => 'sometimes|in:beginner,intermediate,advanced',
            'estimated_duration_hours' => 'sometimes|nullable|integer|min:1',
            'order_in_program' => 'sometimes|nullable|integer|min:0',
            'programming_language_id' => 'sometimes|nullable|exists:programming_languages,id',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $course->update($request->validated());
        $course->load(['creator', 'programmingLanguage', 'program']);

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully',
            'data' => $course
        ]);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        // Only the creator can delete the course
        if ($course->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own courses'
            ], 403);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }
}
