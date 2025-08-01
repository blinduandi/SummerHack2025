<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseStepController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\OngProjectController;
use App\Http\Controllers\Api\CodeRabbitWebhookController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// CodeRabbit webhook (public, but signature-protected)
Route::post('coderabbit/webhook', [CodeRabbitWebhookController::class, 'handle'])->name('api.coderabbit.webhook');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('profile', [AuthController::class, 'profile']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
    });

    // Courses
    Route::get('courses/my-enrolled', [CourseController::class, 'myEnrolledCourses']);
    Route::get('courses/available', [CourseController::class, 'availableCourses']);
    Route::apiResource('courses', CourseController::class);
    Route::get('courses/{course}/steps', [CourseStepController::class, 'index']);

    // Course Steps
    Route::apiResource('courses.steps', CourseStepController::class)->except(['index']);

    // Enrollments
    Route::apiResource('enrollments', EnrollmentController::class)->except(['update']);
    Route::patch('enrollments/{enrollment}/status', [EnrollmentController::class, 'updateStatus']);
    Route::patch('enrollments/{enrollment}/github-repository', [EnrollmentController::class, 'updateGithubRepository']);
    Route::patch('enrollments/{enrollment}/code-analysis', [EnrollmentController::class, 'updateCodeAnalysis']);
    Route::post('enrollments/{enrollment}/trigger-analysis', [EnrollmentController::class, 'triggerCodeAnalysis']);

    // Progress tracking
    Route::prefix('progress')->group(function () {
        Route::get('user', [ProgressController::class, 'getUserProgress']);
        Route::get('user/steps', [ProgressController::class, 'getAllUserStepProgress']);
        Route::post('steps/bulk-update', [ProgressController::class, 'bulkUpdateStepProgress']);
        Route::get('course/{course}', [ProgressController::class, 'getCourseProgress']);
        Route::put('course/{course}', [ProgressController::class, 'updateCourseProgress']);
        Route::get('course/{course}/steps', [ProgressController::class, 'getCourseStepsProgress']);
        Route::get('course/{course}/steps/status', [ProgressController::class, 'getCourseStepsStatus']);
        Route::get('step/{step}', [ProgressController::class, 'getStepProgress']);
        Route::put('step/{step}', [ProgressController::class, 'updateStepProgress']);
    });

    // Chat with AI bot
    Route::prefix('chat')->group(function () {
        Route::get('/', [ChatController::class, 'index']);
        Route::post('/', [ChatController::class, 'sendMessage']);
        Route::get('course/{course}', [ChatController::class, 'getCourseChat']);
        Route::post('course/{course}', [ChatController::class, 'sendMessage']);
        Route::patch('messages/{message}/helpful', [ChatController::class, 'markAsHelpful']);
    });

    // Course recommendations
    Route::prefix('recommendations')->group(function () {
        Route::get('/', [RecommendationController::class, 'index']);
        Route::post('generate', [RecommendationController::class, 'generate']);
        Route::patch('{recommendation}/dismiss', [RecommendationController::class, 'dismiss']);
    });

    // Programming Languages (read-only for users)
    Route::get('programming-languages', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\ProgrammingLanguage::active()->get()
        ]);
    });

    // CodeRabbit analysis
    Route::post('coderabbit/analyze', [CodeRabbitWebhookController::class, 'triggerAnalysis']);

    // User route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ONG Project routes
    Route::get('ong-projects', [OngProjectController::class, 'index']);
    Route::get('ong-projects/my-projects', [OngProjectController::class, 'myProjects']);
    Route::get('ong-projects/my-applications', [OngProjectController::class, 'myApplications']);
    Route::get('ong-projects/{project}', [OngProjectController::class, 'show']);
    Route::post('ong-projects', [OngProjectController::class, 'store']);
    Route::post('ong-projects/{project}/apply', [OngProjectController::class, 'apply']);
    Route::get('ong-projects/{project}/applicants', [OngProjectController::class, 'applicants']);
    Route::post('ong-projects/{project}/submit', [OngProjectController::class, 'submit']);
    Route::post('ong-projects/{project}/applications/{application}/select-winner', [OngProjectController::class, 'selectWinner']);
});

// Add a test route for Telegram
Route::get('/test-telegram', function () {
    $chatId = '<YOUR_TELEGRAM_CHAT_ID>'; // Replace with your actual chat ID
    $result = app(\App\Services\TelegramBotService::class)->sendMessage($chatId, 'Test message from Laravel TelegramBotService!');
    return response()->json(['result' => $result->json()]);
});
