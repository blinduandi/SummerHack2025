<?php

namespace App\Services;

use OpenAI;
use Exception;
use Illuminate\Support\Facades\Log;

class CourseContentService
{
    private $client;

    public function __construct()
    {
        $this->client = OpenAI::client(config('openai.api_key'));
    }

    /**
     * Generate course steps using OpenAI based on course details
     */
    public function generateCourseSteps(string $courseTitle, string $category, string $difficulty, int $stepNumber, string $stepType): array
    {
        try {
            $prompt = $this->buildCourseStepPrompt($courseTitle, $category, $difficulty, $stepNumber, $stepType);

            $response = $this->client->chat()->create([
                'model' => config('openai.model'),
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert course creator and programming instructor. Generate detailed, practical course step content.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => 800,
                'temperature' => 0.7,
            ]);

            $content = trim($response->choices[0]->message->content);
            return $this->parseAIResponse($content);

        } catch (Exception $e) {
            Log::error('OpenAI Course Content Generation Error: ' . $e->getMessage());
            return $this->getFallbackContent($stepType, $stepNumber);
        }
    }

    /**
     * Build the prompt for OpenAI to generate course step content
     */
    private function buildCourseStepPrompt(string $courseTitle, string $category, string $difficulty, int $stepNumber, string $stepType): string
    {
        return "Generate a detailed course step for:
Course: {$courseTitle}
Category: {$category}
Difficulty: {$difficulty}
Step Number: {$stepNumber}
Step Type: {$stepType}

Please provide a JSON response with the following structure:
{
    \"title\": \"Specific, actionable step title\",
    \"description\": \"Detailed description (3-4 sentences) explaining what the student will learn and accomplish\",
    \"content\": \"Comprehensive step content (200-300 words) with practical instructions, code examples if relevant, and learning objectives\",
    \"youtube_recommendations\": [
        {
            \"title\": \"Video title\",
            \"channel\": \"Channel name\",
            \"search_query\": \"YouTube search query\",
            \"description\": \"Why this video is helpful\"
        }
    ],
    \"estimated_time\": 45,
    \"difficulty\": \"easy/medium/hard\",
    \"prerequisites\": \"What students should know before this step\",
    \"learning_objectives\": [\"Objective 1\", \"Objective 2\", \"Objective 3\"]
}

Make the content specific to the course topic and ensure it's practical and actionable. Include relevant YouTube video recommendations that would help students with this specific step. Return estimated_time as a number (15-120).";
    }

    /**
     * Parse the AI response and extract structured data
     */
    private function parseAIResponse(string $content): array
    {
        // Try to extract JSON from the response
        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');

        if ($jsonStart !== false && $jsonEnd !== false) {
            $jsonContent = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
            $decoded = json_decode($jsonContent, true);

            if ($decoded) {
                return $decoded;
            }
        }

        // Fallback parsing if JSON is malformed
        return $this->parseTextResponse($content);
    }

    /**
     * Parse text response when JSON parsing fails
     */
    private function parseTextResponse(string $content): array
    {
        $lines = explode("\n", $content);
        $result = [
            'title' => 'Generated Course Step',
            'description' => '',
            'content' => $content,
            'youtube_recommendations' => [],
            'estimated_time' => rand(30, 90),
            'difficulty' => 'medium',
            'prerequisites' => 'Basic understanding of the topic',
            'learning_objectives' => []
        ];

        // Try to extract title from first line
        if (!empty($lines[0])) {
            $result['title'] = trim($lines[0], "# \t\n\r\0\x0B");
        }

        // Use first paragraph as description
        $paragraphs = explode("\n\n", $content);
        if (count($paragraphs) > 1) {
            $result['description'] = trim($paragraphs[0]);
            $result['content'] = trim(implode("\n\n", array_slice($paragraphs, 1)));
        }

        return $result;
    }

    /**
     * Get fallback content when AI generation fails
     */
    private function getFallbackContent(string $stepType, int $stepNumber): array
    {
        $fallbackContent = [
            'setup' => [
                'title' => "Environment Setup - Step {$stepNumber}",
                'description' => 'Configure your development environment and install necessary tools for this project.',
                'content' => 'In this step, you will set up your development environment. This includes installing required software, configuring your IDE, and preparing your workspace for the upcoming development tasks.',
            ],
            'theory' => [
                'title' => "Core Concepts - Step {$stepNumber}",
                'description' => 'Learn the fundamental concepts and principles that form the foundation of this topic.',
                'content' => 'This theoretical step covers the essential concepts you need to understand before diving into practical implementation. You will learn about key principles, best practices, and industry standards.',
            ],
            'code' => [
                'title' => "Implementation - Step {$stepNumber}",
                'description' => 'Write code to implement the features and functionality discussed in previous steps.',
                'content' => 'In this hands-on coding step, you will implement the features and functionality. Follow along with the code examples and complete the practical exercises to reinforce your learning.',
            ],
            'testing' => [
                'title' => "Testing & Quality Assurance - Step {$stepNumber}",
                'description' => 'Learn testing strategies and implement tests to ensure code quality and reliability.',
                'content' => 'This step focuses on testing your implementation. You will learn about different testing approaches, write test cases, and ensure your code meets quality standards.',
            ],
            'deployment' => [
                'title' => "Deployment & Production - Step {$stepNumber}",
                'description' => 'Deploy your application to a production environment and configure it for real-world use.',
                'content' => 'Learn how to deploy your application to a production environment. This includes configuration, optimization, and best practices for maintaining a live application.',
            ],
            'review' => [
                'title' => "Code Review & Optimization - Step {$stepNumber}",
                'description' => 'Review your implementation, optimize performance, and apply best practices.',
                'content' => 'In this review step, you will analyze your implementation, identify areas for improvement, and apply optimization techniques to enhance performance and maintainability.',
            ]
        ];

        $content = $fallbackContent[$stepType] ?? $fallbackContent['theory'];

        return [
            'title' => $content['title'],
            'description' => $content['description'],
            'content' => $content['content'],
            'youtube_recommendations' => $this->getDefaultYouTubeRecommendations($stepType),
            'estimated_time' => rand(30, 90),
            'difficulty' => 'medium',
            'prerequisites' => 'Complete previous steps',
            'learning_objectives' => [
                'Understand the core concepts',
                'Apply practical skills',
                'Complete hands-on exercises'
            ]
        ];
    }

    /**
     * Get default YouTube recommendations for each step type
     */
    private function getDefaultYouTubeRecommendations(string $stepType): array
    {
        $recommendations = [
            'setup' => [
                [
                    'title' => 'Development Environment Setup Guide',
                    'channel' => 'Programming with Mosh',
                    'search_query' => 'development environment setup tutorial',
                    'description' => 'Comprehensive guide for setting up development environments'
                ]
            ],
            'theory' => [
                [
                    'title' => 'Programming Fundamentals Explained',
                    'channel' => 'freeCodeCamp',
                    'search_query' => 'programming concepts tutorial',
                    'description' => 'Deep dive into core programming concepts and principles'
                ]
            ],
            'code' => [
                [
                    'title' => 'Hands-on Coding Tutorial',
                    'channel' => 'Traversy Media',
                    'search_query' => 'coding tutorial step by step',
                    'description' => 'Practical coding examples and implementation guide'
                ]
            ],
            'testing' => [
                [
                    'title' => 'Testing Best Practices',
                    'channel' => 'The Net Ninja',
                    'search_query' => 'testing tutorial programming',
                    'description' => 'Learn testing strategies and best practices'
                ]
            ],
            'deployment' => [
                [
                    'title' => 'Deployment and Production Guide',
                    'channel' => 'Tech With Tim',
                    'search_query' => 'deployment tutorial production',
                    'description' => 'Complete guide to deploying applications'
                ]
            ],
            'review' => [
                [
                    'title' => 'Code Review and Optimization',
                    'channel' => 'Coding Tech',
                    'search_query' => 'code review best practices',
                    'description' => 'Learn how to review and optimize your code'
                ]
            ]
        ];

        return $recommendations[$stepType] ?? $recommendations['theory'];
    }
}
