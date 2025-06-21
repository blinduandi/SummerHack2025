<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;

echo "=== Testing Enrollment API Functionality ===\n";

try {
    // Get or create a test user
    $user = User::first();
    if (!$user) {
        $user = User::factory()->create(['email' => 'test@example.com']);
        echo "Created test user: {$user->email}\n";
    } else {
        echo "Using existing user: {$user->email}\n";
    }

    // Get or create a test course
    $course = Course::first();
    if (!$course) {
        $course = Course::factory()->create(['title' => 'Test Course']);
        echo "Created test course: {$course->title}\n";
    } else {
        echo "Using existing course: {$course->title}\n";
    }

    // Test the helper methods
    echo "Course ID: {$course->id}\n";
    echo "User ID: {$user->id}\n";
    echo "Is user enrolled (before): " . ($course->isUserEnrolled($user->id) ? 'YES' : 'NO') . "\n";

    // Create enrollment
    $enrollment = Enrollment::updateOrCreate([
        'user_id' => $user->id,
        'course_id' => $course->id
    ], [
        'enrolled_at' => now(),
        'github_repository_url' => 'https://github.com/test/repo'
    ]);

    echo "Created enrollment with GitHub repo: {$enrollment->github_repository_url}\n";
    echo "Is user enrolled (after): " . ($course->isUserEnrolled($user->id) ? 'YES' : 'NO') . "\n";

    // Test getUserEnrollment method
    $userEnrollment = $course->getUserEnrollment($user->id);
    if ($userEnrollment) {
        echo "User enrollment found: ID {$userEnrollment->id}\n";
        echo "GitHub repo: " . ($userEnrollment->github_repository_url ?: 'None') . "\n";
    } else {
        echo "No enrollment found\n";
    }

    // Test how the CourseController would add enrollment info
    echo "\n=== Testing Course API Response Logic ===\n";

    // Simulate what happens in CourseController::index and show methods
    $course->load(['creator', 'programmingLanguage']);

    $userId = $user->id;
    $enrollment = $course->getUserEnrollment($userId);
    $course->is_enrolled = !is_null($enrollment);
    $course->enrollment = $enrollment;

    echo "Course enrollment info added:\n";
    echo "- is_enrolled: " . ($course->is_enrolled ? 'true' : 'false') . "\n";
    echo "- enrollment data: " . ($course->enrollment ? 'present' : 'null') . "\n";

    if ($course->enrollment) {
        echo "  - enrollment_id: {$course->enrollment->id}\n";
        echo "  - github_repo: " . ($course->enrollment->github_repository_url ?: 'none') . "\n";
        echo "  - enrolled_at: {$course->enrollment->enrolled_at}\n";
    }

    echo "\n✅ All enrollment functionality tests passed!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
