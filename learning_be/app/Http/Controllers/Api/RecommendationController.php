<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseRecommendation;
use App\Models\Course;
use App\Models\CourseProgress;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RecommendationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $recommendations = CourseRecommendation::where('user_id', $request->user()->id)
            ->active()
            ->with('course.programmingLanguage')
            ->ordered()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get user's progress and preferences
        $completedCourses = CourseProgress::where('user_id', $user->id)
            ->where('status', 'completed')
            ->pluck('course_id')
            ->toArray();

        $inProgressCourses = CourseProgress::where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->pluck('course_id')
            ->toArray();

        // Get courses user hasn't started
        $availableCourses = Course::active()
            ->whereNotIn('id', array_merge($completedCourses, $inProgressCourses))
            ->with('programmingLanguage')
            ->get();

        $recommendations = [];

        foreach ($availableCourses as $course) {
            $score = $this->calculateRecommendationScore($user, $course, $completedCourses);

            if ($score >= 50) { // Only recommend if score is above threshold
                $factors = $this->getRecommendationFactors($user, $course, $completedCourses);

                // Create or update recommendation
                CourseRecommendation::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'course_id' => $course->id
                    ],
                    [
                        'recommendation_score' => $score,
                        'recommendation_type' => $this->getRecommendationType($factors),
                        'recommendation_factors' => $factors,
                        'is_dismissed' => false,
                        'recommended_at' => now()
                    ]
                );

                $recommendations[] = [
                    'course' => $course,
                    'score' => $score,
                    'factors' => $factors
                ];
            }
        }

        // Sort by score
        usort($recommendations, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return response()->json([
            'success' => true,
            'message' => 'Recommendations generated successfully',
            'data' => [
                'recommendations' => array_slice($recommendations, 0, 10), // Top 10
                'total_generated' => count($recommendations)
            ]
        ]);
    }

    public function dismiss(Request $request, CourseRecommendation $recommendation): JsonResponse
    {
        // Ensure user can only dismiss their own recommendations
        if ($recommendation->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $recommendation->dismiss();

        return response()->json([
            'success' => true,
            'message' => 'Recommendation dismissed successfully'
        ]);
    }

    private function calculateRecommendationScore($user, $course, $completedCourses): float
    {
        $score = 50; // Base score

        // Skill-based scoring
        if (count($completedCourses) > 0) {
            $completedCoursesData = Course::whereIn('id', $completedCourses)->get();

            // Same programming language bonus
            if ($course->programming_language_id) {
                $sameLanguageCount = $completedCoursesData
                    ->where('programming_language_id', $course->programming_language_id)
                    ->count();
                $score += $sameLanguageCount * 10;
            }

            // Same program bonus
            if ($course->program_id) {
                $sameProgramCount = $completedCoursesData
                    ->where('program_id', $course->program_id)
                    ->count();
                $score += $sameProgramCount * 15;
            }

            // Difficulty progression
            $avgCompletedDifficulty = $this->getAverageDifficulty($completedCoursesData);
            $courseDifficulty = $this->getDifficultyScore($course->difficulty_level);

            if ($courseDifficulty >= $avgCompletedDifficulty && $courseDifficulty <= $avgCompletedDifficulty + 1) {
                $score += 20; // Good progression
            }
        }

        // Popularity bonus (simplified)
        $enrollmentCount = $course->progress()->count();
        $score += min($enrollmentCount / 10, 10); // Max 10 points for popularity

        return min($score, 100); // Cap at 100
    }

    private function getRecommendationFactors($user, $course, $completedCourses): array
    {
        $factors = [];

        if ($course->programming_language_id) {
            $factors['programming_language'] = $course->programmingLanguage->name;
        }

        if ($course->program_id) {
            $factors['program'] = $course->program->title ?? 'Unknown Program';
        }

        $factors['difficulty_level'] = $course->difficulty_level;
        $factors['completed_courses_count'] = count($completedCourses);

        return $factors;
    }

    private function getRecommendationType($factors): string
    {
        if (isset($factors['programming_language'])) {
            return 'skill_based';
        }

        if (isset($factors['program'])) {
            return 'completion_based';
        }

        return 'interest_based';
    }

    private function getAverageDifficulty($courses): float
    {
        $total = 0;
        foreach ($courses as $course) {
            $total += $this->getDifficultyScore($course->difficulty_level);
        }
        return $courses->count() > 0 ? $total / $courses->count() : 1;
    }

    private function getDifficultyScore($difficulty): int
    {
        return match($difficulty) {
            'beginner' => 1,
            'intermediate' => 2,
            'advanced' => 3,
            default => 1
        };
    }
}
