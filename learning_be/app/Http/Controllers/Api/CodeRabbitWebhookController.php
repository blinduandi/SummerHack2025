<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CodeRabbitService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CodeRabbitWebhookController extends Controller
{
    public function __construct(
        private CodeRabbitService $codeRabbitService
    ) {}

    /**
     * Handle CodeRabbit webhook for analysis results
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Log the incoming webhook for debugging
            Log::info('CodeRabbit webhook received', $request->all());

            // Validate webhook signature (implement based on CodeRabbit's documentation)
            if (!$this->validateWebhookSignature($request)) {
                Log::warning('Invalid CodeRabbit webhook signature');
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            // Process the webhook data
            $this->codeRabbitService->handleWebhook($request->all());

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('CodeRabbit webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Trigger manual analysis for an enrollment
     */
    public function triggerAnalysis(Request $request): JsonResponse
    {
        $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id'
        ]);

        try {
            $enrollment = \App\Models\Enrollment::findOrFail($request->enrollment_id);

            // Check if user owns this enrollment
            if ($enrollment->user_id !== $request->user()->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $result = $this->codeRabbitService->analyzeRepository($enrollment);

            return response()->json([
                'status' => 'success',
                'message' => 'Analysis triggered successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Manual CodeRabbit analysis failed', [
                'enrollment_id' => $request->enrollment_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Analysis failed: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Validate webhook signature (implement based on CodeRabbit's specs)
     */
    private function validateWebhookSignature(Request $request): bool
    {
        // This is a placeholder implementation
        // In a real scenario, implement signature validation based on CodeRabbit's documentation

        $signature = $request->header('X-CodeRabbit-Signature');
        $payload = $request->getContent();

        if (!$signature) {
            return false;
        }

        // Example validation (replace with actual CodeRabbit signature validation)
        $secret = config('services.coderabbit.webhook_secret');
        if (!$secret) {
            Log::warning('CodeRabbit webhook secret not configured');
            return true; // Allow through if not configured (for development)
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expectedSignature, $signature);
    }
}
