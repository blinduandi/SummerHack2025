<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseStep;
use App\Models\CourseProgress;
use App\Models\StepProgress;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

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
        try {
            $request->validate([
                'status' => 'sometimes|in:hidden,in_progress,solved,completed',
                'progress_data' => 'sometimes|array',
                'score' => 'sometimes|numeric|min:0|max:100',
                'notes' => 'sometimes|string',
                'increment_attempts' => 'sometimes|boolean'
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

            // Update status with proper handling for each status type
            if ($request->has('status')) {
                switch ($request->status) {
                    case 'in_progress':
                        if ($progress->status === 'hidden') {
                            $progress->markAsStarted();
                        } else {
                            $progress->update([
                                'status' => 'in_progress',
                                'last_accessed_at' => now()
                            ]);
                        }
                        break;

                    case 'solved':
                        $progress->markAsSolved($request->get('score'));
                        break;

                    case 'completed':
                        $progress->markAsCompleted($request->get('score'));
                        break;

                    default:
                        $progress->update([
                            'status' => $request->status,
                            'last_accessed_at' => now()
                        ]);
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
                $progress->update([
                    'score' => $request->score,
                    'last_accessed_at' => now()
                ]);
            }

            // Increment attempts for exercises/quizzes
            if ($request->has('increment_attempts') && $request->increment_attempts) {
                $progress->incrementAttempts();
            }

            // Always update last_accessed_at to track user activity
            $progress->update(['last_accessed_at' => now()]);

            // Refresh the model to get the latest data
            $progress = $progress->fresh(['user', 'courseStep']);

            return response()->json([
                'success' => true,
                'message' => 'Step progress updated successfully',
                'data' => $progress
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Course step not found'
            ], 404);

        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Failed to update step progress', [
                'user_id' => $request->user()->id ?? null,
                'step_id' => $step->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update step progress. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function getCourseStepsProgress(Request $request, Course $course): JsonResponse
    {
        try {
            $user = $request->user();

            // Get all steps for the course with their progress data
            $steps = $course->steps()
                ->with(['progress' => function($query) use ($user) {
                    $query->where('user_id', $user->id);
                }])
                ->orderBy('order')
                ->get();

            // Transform the data to include current status for each step
            $stepsWithStatus = $steps->map(function ($step) use ($user) {
                $progress = $step->progress->first(); // Get the user's progress for this step

                return [
                    'id' => $step->id,
                    'title' => $step->title,
                    'type' => $step->type,
                    'order' => $step->order,
                    'content' => $step->content,
                    'metadata' => $step->metadata,
                    'is_mandatory' => $step->is_mandatory,
                    'created_at' => $step->created_at,
                    'updated_at' => $step->updated_at,
                    'user_progress' => $progress ? [
                        'id' => $progress->id,
                        'status' => $progress->status,
                        'started_at' => $progress->started_at,
                        'completed_at' => $progress->completed_at,
                        'last_accessed_at' => $progress->last_accessed_at,
                        'progress_data' => $progress->progress_data,
                        'attempts_count' => $progress->attempts_count,
                        'score' => $progress->score,
                        'notes' => $progress->notes,
                    ] : [
                        'id' => null,
                        'status' => 'hidden', // Default status when no progress exists
                        'started_at' => null,
                        'completed_at' => null,
                        'last_accessed_at' => null,
                        'progress_data' => null,
                        'attempts_count' => 0,
                        'score' => null,
                        'notes' => null,
                    ]
                ];
            });

            // Calculate course statistics
            $statistics = [
                'total_steps' => $steps->count(),
                'steps_hidden' => $stepsWithStatus->where('user_progress.status', 'hidden')->count(),
                'steps_in_progress' => $stepsWithStatus->where('user_progress.status', 'in_progress')->count(),
                'steps_solved' => $stepsWithStatus->where('user_progress.status', 'solved')->count(),
                'steps_completed' => $stepsWithStatus->where('user_progress.status', 'completed')->count(),
                'completion_percentage' => $steps->count() > 0
                    ? round(($stepsWithStatus->whereIn('user_progress.status', ['solved', 'completed'])->count() / $steps->count()) * 100, 2)
                    : 0,
                'average_score' => $stepsWithStatus->where('user_progress.score', '!=', null)->avg('user_progress.score') ?: 0,
                'total_attempts' => $stepsWithStatus->sum('user_progress.attempts_count'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'course' => [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                    ],
                    'steps' => $stepsWithStatus,
                    'statistics' => $statistics
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get course steps progress', [
                'user_id' => $request->user()->id ?? null,
                'course_id' => $course->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve course steps progress'
            ], 500);
        }
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

    public function getAllUserStepProgress(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $stepProgress = $user->stepProgress()
                ->with(['courseStep.course', 'courseStep'])
                ->orderBy('last_accessed_at', 'desc')
                ->get();

            $groupedProgress = $stepProgress->groupBy('courseStep.course.id');

            return response()->json([
                'success' => true,
                'data' => [
                    'all_step_progress' => $stepProgress,
                    'grouped_by_course' => $groupedProgress,
                    'statistics' => [
                        'total_steps_started' => $stepProgress->whereIn('status', ['in_progress', 'solved', 'completed'])->count(),
                        'steps_in_progress' => $stepProgress->where('status', 'in_progress')->count(),
                        'steps_solved' => $stepProgress->where('status', 'solved')->count(),
                        'steps_completed' => $stepProgress->where('status', 'completed')->count(),
                        'average_score' => $stepProgress->whereNotNull('score')->avg('score') ?: 0,
                        'total_attempts' => $stepProgress->sum('attempts_count'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get user step progress', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve step progress'
            ], 500);
        }
    }

    public function bulkUpdateStepProgress(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'updates' => 'required|array',
                'updates.*.step_id' => 'required|exists:course_steps,id',
                'updates.*.status' => 'sometimes|in:hidden,in_progress,solved,completed',
                'updates.*.progress_data' => 'sometimes|array',
                'updates.*.score' => 'sometimes|numeric|min:0|max:100',
                'updates.*.notes' => 'sometimes|string',
            ]);

            $user = $request->user();
            $results = [];
            $errors = [];

            foreach ($request->updates as $index => $update) {
                try {
                    $step = CourseStep::findOrFail($update['step_id']);

                    $progress = StepProgress::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'course_step_id' => $step->id
                        ],
                        [
                            'status' => 'hidden'
                        ]
                    );

                    // Update fields if provided
                    if (isset($update['status'])) {
                        switch ($update['status']) {
                            case 'in_progress':
                                if ($progress->status === 'hidden') {
                                    $progress->markAsStarted();
                                }
                                break;
                            case 'solved':
                                $progress->markAsSolved($update['score'] ?? null);
                                break;
                            case 'completed':
                                $progress->markAsCompleted($update['score'] ?? null);
                                break;
                            default:
                                $progress->update(['status' => $update['status']]);
                        }
                    }

                    if (isset($update['progress_data'])) {
                        $progress->updateProgressData($update['progress_data']);
                    }

                    if (isset($update['notes'])) {
                        $progress->addNote($update['notes']);
                    }

                    if (isset($update['score'])) {
                        $progress->update(['score' => $update['score']]);
                    }

                    $progress->update(['last_accessed_at' => now()]);
                    $results[] = $progress->fresh();

                } catch (\Exception $e) {
                    $errors[] = [
                        'index' => $index,
                        'step_id' => $update['step_id'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors) ? 'All step progress updated successfully' : 'Some updates failed',
                'data' => $results,
                'errors' => $errors
            ], empty($errors) ? 200 : 207); // 207 Multi-Status for partial success

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to bulk update step progress', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update step progress'
            ], 500);
        }
    }

    public function getCourseStepsStatus(Request $request, Course $course): JsonResponse
    {
        try {
            $user = $request->user();

            // Get all steps with minimal data, focusing on status
            $steps = $course->steps()
                ->select('id', 'title', 'type', 'order', 'is_mandatory')
                ->with(['progress' => function($query) use ($user) {
                    $query->where('user_id', $user->id)
                          ->select('id', 'course_step_id', 'status', 'score', 'completed_at', 'attempts_count');
                }])
                ->orderBy('order')
                ->get();

            // Create a compact response with just the status information
            $stepStatuses = $steps->map(function ($step) use ($steps, $user) {
                $progress = $step->progress->first();

                return [
                    'step_id' => $step->id,
                    'title' => $step->title,
                    'type' => $step->type,
                    'order' => $step->order,
                    'is_mandatory' => $step->is_mandatory,
                    'status' => $progress ? $progress->status : 'hidden',
                    'score' => $progress ? $progress->score : null,
                    'completed_at' => $progress ? $progress->completed_at : null,
                    'attempts_count' => $progress ? $progress->attempts_count : 0,
                    'is_accessible' => $this->isStepAccessible($step, $steps, $user)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'steps_status' => $stepStatuses,
                    'summary' => [
                        'total_steps' => $steps->count(),
                        'completed_steps' => $stepStatuses->whereIn('status', ['solved', 'completed'])->count(),
                        'progress_percentage' => $steps->count() > 0
                            ? round(($stepStatuses->whereIn('status', ['solved', 'completed'])->count() / $steps->count()) * 100, 2)
                            : 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get course steps status', [
                'user_id' => $request->user()->id ?? null,
                'course_id' => $course->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve course steps status'
            ], 500);
        }
    }

    /**
     * Determine if a step is accessible based on prerequisites and course logic
     */
    private function isStepAccessible($currentStep, $allSteps, $user): bool
    {
        // For now, implement simple sequential logic - each step is accessible if the previous one is completed
        // You can enhance this with more complex prerequisite logic later

        $previousSteps = $allSteps->where('order', '<', $currentStep->order);

        // First step is always accessible
        if ($previousSteps->isEmpty()) {
            return true;
        }

        // Check if all previous mandatory steps are completed
        foreach ($previousSteps as $step) {
            if ($step->is_mandatory) {
                $progress = $step->progress->first();
                if (!$progress || !in_array($progress->status, ['solved', 'completed'])) {
                    return false;
                }
            }
        }

        return true;
    }
}
