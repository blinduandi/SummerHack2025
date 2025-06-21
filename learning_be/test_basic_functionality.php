<?php

// Quick test script to verify the basic functionality
// Run with: php artisan tinker < test_basic_functionality.php

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\ProgrammingLanguage;

echo "=== Testing Basic Functionality ===\n";

// Test 1: Check if tables exist and have correct structure
echo "1. Checking table structures...\n";

try {
    $userCount = User::count();
    echo "   ✅ Users table: {$userCount} records\n";
    
    $courseCount = Course::count();
    echo "   ✅ Courses table: {$courseCount} records\n";
    
    $enrollmentCount = Enrollment::count();
    echo "   ✅ Enrollments table: {$enrollmentCount} records\n";
    
    // Check if GitHub fields exist in enrollments
    $enrollment = new Enrollment();
    $fillable = $enrollment->getFillable();
    
    if (in_array('github_repository_url', $fillable)) {
        echo "   ✅ GitHub repository URL field exists\n";
    } else {
        echo "   ❌ GitHub repository URL field missing\n";
    }
    
    if (in_array('code_analysis_data', $fillable)) {
        echo "   ✅ Code analysis data field exists\n";
    } else {
        echo "   ❌ Code analysis data field missing\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Database error: " . $e->getMessage() . "\n";
}

// Test 2: Create test data if needed
echo "\n2. Creating test data...\n";

try {
    // Create programming language if none exists
    $jsLang = ProgrammingLanguage::firstOrCreate([
        'name' => 'JavaScript',
        'slug' => 'javascript',
        'is_active' => true
    ]);
    echo "   ✅ JavaScript programming language: ID {$jsLang->id}\n";
    
    // Create test user
    $testUser = User::firstOrCreate([
        'email' => 'test@example.com'
    ], [
        'name' => 'Test User',
        'password' => bcrypt('password123'),
        'role' => 'student',
        'language_preference' => 'en'
    ]);
    echo "   ✅ Test user: ID {$testUser->id}\n";
    
    // Create test course
    $testCourse = Course::firstOrCreate([
        'title' => 'Test JavaScript Course'
    ], [
        'description' => 'A test course for GitHub integration',
        'content' => 'Test content',
        'difficulty_level' => 'beginner',
        'estimated_duration_hours' => 10,
        'programming_language_id' => $jsLang->id,
        'created_by' => $testUser->id,
        'is_active' => true
    ]);
    echo "   ✅ Test course: ID {$testCourse->id}\n";
    
} catch (Exception $e) {
    echo "   ❌ Error creating test data: " . $e->getMessage() . "\n";
}

// Test 3: Test enrollment with GitHub fields
echo "\n3. Testing enrollment with GitHub integration...\n";

try {
    // Create enrollment
    $enrollment = Enrollment::firstOrCreate([
        'user_id' => $testUser->id,
        'course_id' => $testCourse->id
    ], [
        'status' => 'active',
        'enrolled_at' => now()
    ]);
    echo "   ✅ Test enrollment: ID {$enrollment->id}\n";
    
    // Update with GitHub repository
    $enrollment->update([
        'github_repository_url' => 'https://github.com/test/test-repo',
        'github_repository_name' => 'test/test-repo',
        'code_analysis_data' => [
            'status' => 'pending',
            'analysis_id' => 'test_123'
        ],
        'code_quality_score' => 85.5,
        'last_analysis_at' => now()
    ]);
    echo "   ✅ GitHub repository assigned\n";
    echo "   ✅ Code analysis data stored\n";
    echo "   ✅ Quality score: {$enrollment->code_quality_score}\n";
    
} catch (Exception $e) {
    echo "   ❌ Error testing enrollment: " . $e->getMessage() . "\n";
}

// Test 4: Verify relationships
echo "\n4. Testing model relationships...\n";

try {
    $enrollment = Enrollment::with(['user', 'course'])->first();
    
    if ($enrollment) {
        echo "   ✅ Enrollment->User: {$enrollment->user->name}\n";
        echo "   ✅ Enrollment->Course: {$enrollment->course->title}\n";
        
        $course = Course::with('enrollments')->first();
        if ($course && $course->enrollments->count() > 0) {
            echo "   ✅ Course->Enrollments: {$course->enrollments->count()} enrollments\n";
        }
    }
    
} catch (Exception $e) {
    echo "   ❌ Error testing relationships: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
echo "Ready for Postman testing!\n";
echo "\nTest credentials:\n";
echo "Email: test@example.com\n";
echo "Password: password123\n";
echo "\nUse these in your Postman login request.\n";
