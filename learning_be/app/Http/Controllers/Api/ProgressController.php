<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseStep;
use App\Models\CourseProgress;
use App\Models\StepProgress;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProgressController extends Controller
{
    public function getCourseProgress(Request $request, Course $course): JsonResponse
    {
        $progress = CourseProgress::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_id' => $course->id
            ],
            [
                'status' => 'not_started',
                'progress_percentage' => 0
            ]
        );

        $progress->load('course');

        return response()->json([
            'success' => true,
            'data' => $progress
        ]);
    }

    public function updateCourseProgress(Request $request, Course $course): JsonResponse
    {
        $request->validate([
            'progress_percentage' => 'sometimes|integer|min:0|max:100',
            'status' => 'sometimes|in:not_started,in_progress,completed,reset',
            'checkpoint_data' => 'sometimes|array'
        ]);

        $progress = CourseProgress::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_id' => $course->id
            ],
            [
                'status' => 'not_started',
                'progress_percentage' => 0
            ]
        );

        // Update progress
        if ($request->has('progress_percentage')) {
            $progress->updateProgress($request->progress_percentage);
        }

        if ($request->has('status')) {
            if ($request->status === 'reset') {
                $progress->resetProgress();
            } else {
                $progress->update(['status' => $request->status]);
                if ($request->status === 'in_progress' && $progress->started_at === null) {
                    $progress->markAsStarted();
                }
            }
        }

        if ($request->has('checkpoint_data')) {
            $progress->update([
                'checkpoint_data' => array_merge($progress->checkpoint_data ?? [], $request->checkpoint_data),
                'last_accessed_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Course progress updated successfully',
            'data' => $progress->fresh()
        ]);
    }

    public function getStepProgress(Request $request, CourseStep $step): JsonResponse
    {
        $progress = StepProgress::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_step_id' => $step->id
            ],
            [
                'status' => 'hidden'
            ]
        );

        $progress->load('courseStep');

        return response()->json([
            'success' => true,
            'data' => $progress
        ]);
    }

    public function updateStepProgress(Request $request, CourseStep $step): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|in:hidden,in_progress,solved',
            'progress_data' => 'sometimes|array',
            'score' => 'sometimes|numeric|min:0|max:100',
            'notes' => 'sometimes|string'
        ]);

        $progress = StepProgress::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_step_id' => $step->id
            ],
            [
                'status' => 'hidden'
            ]
        );

        // Update status
        if ($request->has('status')) {
            if ($request->status === 'in_progress' && $progress->status === 'hidden') {
                $progress->markAsStarted();
            } elseif ($request->status === 'solved') {
                $progress->markAsSolved($request->get('score'));
            } else {
                $progress->update(['status' => $request->status]);
            }
        }

        // Update progress data
        if ($request->has('progress_data')) {
            $progress->updateProgressData($request->progress_data);
        }

        // Update notes
        if ($request->has('notes')) {
            $progress->addNote($request->notes);
        }

        // Update score
        if ($request->has('score')) {
            $progress->update(['score' => $request->score]);
        }

        // Increment attempts for exercises/quizzes
        if ($request->has('increment_attempts') && $request->increment_attempts) {
            $progress->incrementAttempts();
        }

        return response()->json([
            'success' => true,
            'message' => 'Step progress updated successfully',
            'data' => $progress->fresh()
        ]);
    }

    public function getCourseStepsProgress(Request $request, Course $course): JsonResponse
    {
        $steps = $course->steps()->with(['progress' => function($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $steps
        ]);
    }

    public function getUserProgress(Request $request): JsonResponse
    {
        $user = $request->user();

        $courseProgress = $user->courseProgress()
            ->with('course.program')
            ->latest()
            ->get();

        $stepProgress = $user->stepProgress()
            ->with('courseStep.course')
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'course_progress' => $courseProgress,
                'recent_step_progress' => $stepProgress,
                'statistics' => [
                    'total_courses_started' => $courseProgress->where('status', '!=', 'not_started')->count(),
                    'courses_completed' => $courseProgress->where('status', 'completed')->count(),
                    'steps_solved' => $stepProgress->where('status', 'solved')->count(),
                    'average_course_progress' => $courseProgress->avg('progress_percentage') ?? 0,
                ]
            ]
        ]);
    }
}
