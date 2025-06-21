<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::with(['creator', 'courses'])
            ->active()
            ->latest();

        // Filter by difficulty if provided
        if ($request->has('difficulty')) {
            $query->byDifficulty($request->difficulty);
        }

        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $programs = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $programs
        ]);
    }

    public function show(Program $program): JsonResponse
    {
        $program->load(['creator', 'courses.programmingLanguage', 'enrollments']);

        return response()->json([
            'success' => true,
            'data' => $program
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Only teachers can create programs
        if (!$request->user()->isTeacher()) {
            return response()->json([
                'success' => false,
                'message' => 'Only teachers can create programs'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration_weeks' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $program = Program::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        $program->load('creator');

        return response()->json([
            'success' => true,
            'message' => 'Program created successfully',
            'data' => $program
        ], 201);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        // Only the creator can update the program
        if ($program->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own programs'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'difficulty_level' => 'sometimes|in:beginner,intermediate,advanced',
            'estimated_duration_weeks' => 'sometimes|nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $program->update($request->validated());
        $program->load('creator');

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully',
            'data' => $program
        ]);
    }

    public function destroy(Request $request, Program $program): JsonResponse
    {
        // Only the creator can delete the program
        if ($program->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own programs'
            ], 403);
        }

        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program deleted successfully'
        ]);
    }

    public function enrollments(Program $program): JsonResponse
    {
        $enrollments = $program->enrollments()
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }
}
