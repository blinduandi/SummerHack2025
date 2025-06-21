<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $enrollments = $request->user()->enrollments()
            ->with(['course.programmingLanguage', 'course.creator'])
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
            'course_id' => 'required|exists:courses,id'
        ]);

        $course = Course::findOrFail($request->course_id);

        // Check if user is already enrolled
        $existingEnrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this course'
            ], 422);
        }

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
            'status' => 'active',
        ]);

        $enrollment->load(['course', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Successfully enrolled in course',
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

        $enrollment->load(['course.steps', 'user']);

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

    public function updateGithubRepository(Request $request, Enrollment $enrollment): JsonResponse
    {
        // Ensure user can only update their own enrollments
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'github_repository_url' => 'required|url',
            'github_repository_name' => 'nullable|string|max:255'
        ]);

        // Extract repository name from URL if not provided
        $repoName = $request->github_repository_name;
        if (!$repoName && $request->github_repository_url) {
            $parsedUrl = parse_url($request->github_repository_url);
            if ($parsedUrl && isset($parsedUrl['path'])) {
                $pathParts = explode('/', trim($parsedUrl['path'], '/'));
                if (count($pathParts) >= 2) {
                    $repoName = $pathParts[0] . '/' . $pathParts[1];
                }
            }
        }

        $enrollment->update([
            'github_repository_url' => $request->github_repository_url,
            'github_repository_name' => $repoName,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'GitHub repository updated successfully',
            'data' => $enrollment->fresh()
        ]);
    }

    public function updateCodeAnalysis(Request $request, Enrollment $enrollment): JsonResponse
    {
        // This would typically be called by a webhook or background job
        // For now, allowing manual updates for testing

        $request->validate([
            'code_analysis_data' => 'nullable|array',
            'code_quality_score' => 'nullable|numeric|min:0|max:100'
        ]);

        $enrollment->update([
            'code_analysis_data' => $request->code_analysis_data,
            'code_quality_score' => $request->code_quality_score,
            'last_analysis_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Code analysis updated successfully',
            'data' => $enrollment->fresh()
        ]);
    }

    public function triggerCodeAnalysis(Request $request, Enrollment $enrollment): JsonResponse
    {
        // Ensure user can only trigger analysis for their own enrollments
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$enrollment->github_repository_url) {
            return response()->json([
                'success' => false,
                'message' => 'GitHub repository URL is required for code analysis'
            ], 422);
        }

        try {
            $codeRabbitService = app(\App\Services\CodeRabbitService::class);

            if (!$codeRabbitService->isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Code analysis service is not configured'
                ], 503);
            }

            $result = $codeRabbitService->analyzeRepository($enrollment);

            return response()->json([
                'success' => true,
                'message' => 'Code analysis triggered successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to trigger code analysis: ' . $e->getMessage()
            ], 422);
        }
    }
}
