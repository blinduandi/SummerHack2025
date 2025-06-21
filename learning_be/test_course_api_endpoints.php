<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

echo "=== Testing Course API Endpoints ===\n";

try {
    // Get test user and course
    $user = User::first();
    $course = Course::first();

    if (!$user || !$course) {
        echo "❌ Missing test data. Please run the previous test first.\n";
        exit(1);
    }

    echo "Testing with user: {$user->email}\n";
    echo "Testing with course: {$course->title}\n\n";

    // Test 1: Get all courses (as authenticated user)
    echo "1. Testing GET /api/courses (authenticated)\n";

    $request = Request::create('/api/courses', 'GET');
    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    $controller = new \App\Http\Controllers\Api\CourseController();
    $response = $controller->index($request);
    $responseData = json_decode($response->getContent(), true);

    if ($responseData['success']) {
        $firstCourse = $responseData['data']['data'][0] ?? null;
        if ($firstCourse) {
            echo "   ✅ Success! First course data:\n";
            echo "   - title: {$firstCourse['title']}\n";
            echo "   - is_enrolled: " . (isset($firstCourse['is_enrolled']) ? ($firstCourse['is_enrolled'] ? 'true' : 'false') : 'NOT SET') . "\n";
            echo "   - enrollment: " . (isset($firstCourse['enrollment']) ? ($firstCourse['enrollment'] ? 'present' : 'null') : 'NOT SET') . "\n";

            if (isset($firstCourse['enrollment']) && $firstCourse['enrollment']) {
                echo "   - enrollment_id: {$firstCourse['enrollment']['id']}\n";
                echo "   - github_repo: " . ($firstCourse['enrollment']['github_repository_url'] ?? 'none') . "\n";
            }
        } else {
            echo "   ❌ No courses found in response\n";
        }
    } else {
        echo "   ❌ API request failed: {$responseData['message']}\n";
    }

    echo "\n";

    // Test 2: Get single course (as authenticated user)
    echo "2. Testing GET /api/courses/{$course->id} (authenticated)\n";

    $request = Request::create("/api/courses/{$course->id}", 'GET');
    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    $response = $controller->show($request, $course);
    $responseData = json_decode($response->getContent(), true);

    if ($responseData['success']) {
        $courseData = $responseData['data'];
        echo "   ✅ Success! Course data:\n";
        echo "   - title: {$courseData['title']}\n";
        echo "   - is_enrolled: " . (isset($courseData['is_enrolled']) ? ($courseData['is_enrolled'] ? 'true' : 'false') : 'NOT SET') . "\n";
        echo "   - enrollment: " . (isset($courseData['enrollment']) ? ($courseData['enrollment'] ? 'present' : 'null') : 'NOT SET') . "\n";

        if (isset($courseData['enrollment']) && $courseData['enrollment']) {
            echo "   - enrollment_id: {$courseData['enrollment']['id']}\n";
            echo "   - github_repo: " . ($courseData['enrollment']['github_repository_url'] ?? 'none') . "\n";
        }
    } else {
        echo "   ❌ API request failed: {$responseData['message']}\n";
    }

    echo "\n";

    // Test 3: Get courses as unauthenticated user
    echo "3. Testing GET /api/courses (unauthenticated)\n";

    $request = Request::create('/api/courses', 'GET');
    // No user resolver set = unauthenticated

    $response = $controller->index($request);
    $responseData = json_decode($response->getContent(), true);

    if ($responseData['success']) {
        $firstCourse = $responseData['data']['data'][0] ?? null;
        if ($firstCourse) {
            echo "   ✅ Success! First course data (should not have enrollment info):\n";
            echo "   - title: {$firstCourse['title']}\n";
            echo "   - is_enrolled: " . (isset($firstCourse['is_enrolled']) ? ($firstCourse['is_enrolled'] ? 'true' : 'false') : 'NOT SET (correct)') . "\n";
            echo "   - enrollment: " . (isset($firstCourse['enrollment']) ? ($firstCourse['enrollment'] ? 'present' : 'null') : 'NOT SET (correct)') . "\n";
        } else {
            echo "   ❌ No courses found in response\n";
        }
    } else {
        echo "   ❌ API request failed: {$responseData['message']}\n";
    }

    echo "\n✅ All API endpoint tests completed!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
