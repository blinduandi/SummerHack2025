<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $enrollments = $request->user()->enrollments()
            ->with(['program.courses', 'program.creator'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id'
        ]);

        $program = Program::findOrFail($request->program_id);

        // Check if user is already enrolled
        $existingEnrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('program_id', $program->id)
            ->first();

        if ($existingEnrollment) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this program'
            ], 422);
        }

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'program_id' => $program->id,
            'enrolled_at' => now(),
            'status' => 'active',
        ]);

        $enrollment->load(['program', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Successfully enrolled in program',
            'data' => $enrollment
        ], 201);
    }

    public function show(Request $request, Enrollment $enrollment): JsonResponse
    {
        // Ensure user can only see their own enrollments
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $enrollment->load(['program.courses.steps', 'user']);

        return response()->json([
            'success' => true,
            'data' => $enrollment
        ]);
    }

    public function updateStatus(Request $request, Enrollment $enrollment): JsonResponse
    {
        // Ensure user can only update their own enrollments
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:active,completed,dropped,paused'
        ]);

        $enrollment->update([
            'status' => $request->status,
            'completed_at' => $request->status === 'completed' ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Enrollment status updated successfully',
            'data' => $enrollment
        ]);
    }

    public function destroy(Request $request, Enrollment $enrollment): JsonResponse
    {
        // Ensure user can only delete their own enrollments
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $enrollment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Enrollment removed successfully'
        ]);
    }
}
