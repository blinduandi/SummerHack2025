<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseStep;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CourseStepController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $steps = $course->steps()
            ->active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $steps
        ]);
    }

    public function show(Course $course, CourseStep $step): JsonResponse
    {
        // Verify the step belongs to the course
        if ($step->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Step not found in this course'
            ], 404);
        }

        $step->load('course');

        return response()->json([
            'success' => true,
            'data' => $step
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        // Only course creator can add steps
        if ($course->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only add steps to your own courses'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'step_order' => 'nullable|integer|min:0',
            'step_type' => 'required|in:lesson,exercise,quiz,project',
            'is_required' => 'boolean',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Auto-assign step order if not provided
        if (!$request->has('step_order')) {
            $maxOrder = $course->steps()->max('step_order') ?? 0;
            $request->merge(['step_order' => $maxOrder + 1]);
        }

        $step = CourseStep::create([
            ...$validator->validated(),
            'course_id' => $course->id,
        ]);

        $step->load('course');

        return response()->json([
            'success' => true,
            'message' => 'Course step created successfully',
            'data' => $step
        ], 201);
    }

    public function update(Request $request, Course $course, CourseStep $step): JsonResponse
    {
        // Verify the step belongs to the course
        if ($step->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Step not found in this course'
            ], 404);
        }

        // Only course creator can update steps
        if ($course->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update steps in your own courses'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'content' => 'sometimes|string',
            'step_order' => 'sometimes|integer|min:0',
            'step_type' => 'sometimes|in:lesson,exercise,quiz,project',
            'is_required' => 'sometimes|boolean',
            'metadata' => 'sometimes|nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $step->update($validator->validated());
        $step->load('course');

        return response()->json([
            'success' => true,
            'message' => 'Course step updated successfully',
            'data' => $step
        ]);
    }

    public function destroy(Request $request, Course $course, CourseStep $step): JsonResponse
    {
        // Verify the step belongs to the course
        if ($step->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Step not found in this course'
            ], 404);
        }

        // Only course creator can delete steps
        if ($course->created_by !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete steps from your own courses'
            ], 403);
        }

        $step->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course step deleted successfully'
        ]);
    }
}
