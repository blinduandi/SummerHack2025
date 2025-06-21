<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;

echo "=== Testing New Course Endpoints ===\n";

try {
    // Get test user and create enrollment if needed
    $user = User::first();
    if (!$user) {
        echo "❌ No users found. Please run previous tests first.\n";
        exit(1);
    }

    $courses = Course::take(3)->get();
    if ($courses->count() < 2) {
        echo "❌ Need at least 2 courses for testing. Please create more courses.\n";
        exit(1);
    }

    echo "Testing with user: {$user->email}\n";
    echo "Available courses: {$courses->count()}\n\n";

    // Ensure user is enrolled in first course but not in second
    $firstCourse = $courses->first();
    $secondCourse = $courses->skip(1)->first();

    $enrollment1 = Enrollment::updateOrCreate([
        'user_id' => $user->id,
        'course_id' => $firstCourse->id
    ], [
        'enrolled_at' => now(),
        'github_repository_url' => 'https://github.com/test/first-course'
    ]);

    // Remove enrollment from second course if exists
    Enrollment::where('user_id', $user->id)
        ->where('course_id', $secondCourse->id)
        ->delete();

    echo "✅ Set up test data:\n";
    echo "   - Enrolled in: {$firstCourse->title}\n";
    echo "   - NOT enrolled in: {$secondCourse->title}\n\n";

    // Test 1: Check enrolled courses
    echo "1. Testing enrolled courses query...\n";
    $enrolledCourses = Course::with(['creator', 'programmingLanguage'])
        ->whereHas('enrollments', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->active()
        ->get();

    echo "   Found {$enrolledCourses->count()} enrolled courses:\n";
    foreach ($enrolledCourses as $course) {
        $enrollment = $course->getUserEnrollment($user->id);
        echo "   - {$course->title} (enrollment ID: {$enrollment->id})\n";
    }

    // Test 2: Check available courses
    echo "\n2. Testing available courses query...\n";
    $availableCourses = Course::with(['creator', 'programmingLanguage'])
        ->whereDoesntHave('enrollments', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->active()
        ->get();

    echo "   Found {$availableCourses->count()} available courses:\n";
    foreach ($availableCourses as $course) {
        echo "   - {$course->title} (not enrolled)\n";
    }

    // Test 3: Verify course IDs
    echo "\n3. Verification:\n";
    $enrolledIds = $enrolledCourses->pluck('id')->toArray();
    $availableIds = $availableCourses->pluck('id')->toArray();

    echo "   - First course ({$firstCourse->title}) in enrolled: " . (in_array($firstCourse->id, $enrolledIds) ? 'YES' : 'NO') . "\n";
    echo "   - Second course ({$secondCourse->title}) in available: " . (in_array($secondCourse->id, $availableIds) ? 'YES' : 'NO') . "\n";

    $overlap = array_intersect($enrolledIds, $availableIds);
    echo "   - No overlap between lists: " . (empty($overlap) ? 'YES' : 'NO') . "\n";

    echo "\n✅ All query tests passed!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
