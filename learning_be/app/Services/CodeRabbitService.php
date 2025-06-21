<?php

namespace App\Services;

use App\Models\Enrollment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CodeRabbitService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.coderabbit.api_key');
        $this->baseUrl = config('services.coderabbit.base_url', 'https://api.coderabbit.ai');
    }

    /**
     * Trigger code analysis for a GitHub repository
     */
    public function analyzeRepository(Enrollment $enrollment): array
    {
        if (!$enrollment->github_repository_url) {
            throw new \InvalidArgumentException('GitHub repository URL is required');
        }

        try {
            // Extract repository information from URL
            $repoInfo = $this->extractRepositoryInfo($enrollment->github_repository_url);

            // Call CodeRabbit API to start analysis
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/analysis", [
                'repository' => $repoInfo,
                'webhook_url' => route('api.coderabbit.webhook'), // For receiving results
                'enrollment_id' => $enrollment->id,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Update enrollment with analysis ID for tracking
                $enrollment->update([
                    'code_analysis_data' => [
                        'analysis_id' => $data['analysis_id'] ?? null,
                        'status' => 'pending',
                        'started_at' => now()->toISOString(),
                    ],
                    'last_analysis_at' => now(),
                ]);

                return $data;
            }

            throw new \Exception("CodeRabbit API error: " . $response->body());

        } catch (\Exception $e) {
            Log::error('CodeRabbit analysis failed', [
                'enrollment_id' => $enrollment->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle webhook from CodeRabbit with analysis results
     */
    public function handleWebhook(array $data): void
    {
        $enrollmentId = $data['enrollment_id'] ?? null;

        if (!$enrollmentId) {
            Log::warning('CodeRabbit webhook missing enrollment_id', $data);
            return;
        }

        $enrollment = Enrollment::find($enrollmentId);
        if (!$enrollment) {
            Log::warning('CodeRabbit webhook: enrollment not found', ['id' => $enrollmentId]);
            return;
        }

        // Process the analysis results
        $analysisData = [
            'analysis_id' => $data['analysis_id'] ?? null,
            'status' => $data['status'] ?? 'completed',
            'completed_at' => now()->toISOString(),
            'issues' => $data['issues'] ?? [],
            'metrics' => $data['metrics'] ?? [],
            'summary' => $data['summary'] ?? null,
        ];

        // Calculate a simple quality score based on issues
        $qualityScore = $this->calculateQualityScore($analysisData);

        // Update enrollment with results
        $enrollment->update([
            'code_analysis_data' => $analysisData,
            'code_quality_score' => $qualityScore,
            'last_analysis_at' => now(),
        ]);

        Log::info('CodeRabbit analysis completed', [
            'enrollment_id' => $enrollment->id,
            'quality_score' => $qualityScore,
        ]);
    }

    /**
     * Extract repository owner and name from GitHub URL
     */
    private function extractRepositoryInfo(string $url): array
    {
        $pattern = '/github\.com\/([^\/]+)\/([^\/]+)/';

        if (preg_match($pattern, $url, $matches)) {
            return [
                'owner' => $matches[1],
                'name' => $matches[2],
                'url' => $url,
            ];
        }

        throw new \InvalidArgumentException('Invalid GitHub repository URL');
    }

    /**
     * Calculate quality score based on analysis data
     */
    private function calculateQualityScore(array $analysisData): float
    {
        $baseScore = 100.0;
        $issues = $analysisData['issues'] ?? [];

        // Deduct points based on issue severity
        foreach ($issues as $issue) {
            $severity = $issue['severity'] ?? 'low';

            switch ($severity) {
                case 'critical':
                    $baseScore -= 15;
                    break;
                case 'high':
                    $baseScore -= 10;
                    break;
                case 'medium':
                    $baseScore -= 5;
                    break;
                case 'low':
                    $baseScore -= 2;
                    break;
            }
        }

        // Consider test coverage if available
        $metrics = $analysisData['metrics'] ?? [];
        if (isset($metrics['test_coverage'])) {
            $coverage = $metrics['test_coverage'];
            if ($coverage < 80) {
                $baseScore -= (80 - $coverage) * 0.5; // Deduct 0.5 points per % below 80%
            }
        }

        return max(0, min(100, round($baseScore, 2)));
    }

    /**
     * Get analysis history for an enrollment
     */
    public function getAnalysisHistory(Enrollment $enrollment): array
    {
        // In a real implementation, this would fetch from CodeRabbit API
        // For now, return the stored analysis data
        return [
            'current' => $enrollment->code_analysis_data,
            'score' => $enrollment->code_quality_score,
            'last_analysis' => $enrollment->last_analysis_at,
        ];
    }

    /**
     * Check if CodeRabbit service is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }
}
