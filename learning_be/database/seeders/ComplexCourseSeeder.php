<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseStep;
use App\Models\User;
use App\Services\CourseContentService;
use Faker\Factory as Faker;

class ComplexCourseSeeder extends Seeder
{
    private $courseContentService;

    public function __construct(CourseContentService $courseContentService)
    {
        $this->courseContentService = $courseContentService;
    }

    public function run(): void
    {
        $faker = Faker::create();

        // Ensure at least one user exists
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'email' => 'teacher@example.com',
                'role' => 'teacher',
            ]);
        }

        $courseTopics = [
            ['title' => 'Build a YouTube Clone with Laravel and Vue.js', 'category' => 'Web Development', 'difficulty' => 'Intermediate', 'poster' => 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'],
            ['title' => 'Create a Real-time Chat Application with Node.js', 'category' => 'Web Development', 'difficulty' => 'Advanced', 'poster' => 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300&fit=crop'],
            ['title' => 'Python for Data Science and Machine Learning', 'category' => 'Data Science', 'difficulty' => 'Beginner', 'poster' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'],
            ['title' => 'Docker and Kubernetes: The Complete Guide', 'category' => 'DevOps', 'difficulty' => 'Intermediate', 'poster' => 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop'],
            ['title' => 'Game Development with Unity 2025', 'category' => 'Game Development', 'difficulty' => 'Intermediate', 'poster' => 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop'],
            ['title' => 'Flutter & Dart - The Complete Guide [2025]', 'category' => 'Mobile Development', 'difficulty' => 'Intermediate', 'poster' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'],
            ['title' => 'Ethical Hacking from Scratch', 'category' => 'Cybersecurity', 'difficulty' => 'Beginner', 'poster' => 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'],
            ['title' => 'Next.js Full-Stack Development', 'category' => 'Web Development', 'difficulty' => 'Intermediate', 'poster' => 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=400&h=300&fit=crop'],
            ['title' => 'AWS Cloud Architecture', 'category' => 'Cloud Computing', 'difficulty' => 'Advanced', 'poster' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop'],
            ['title' => 'Blockchain Development with Solidity', 'category' => 'Blockchain', 'difficulty' => 'Advanced', 'poster' => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop', 'thumbnail' => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop'],
        ];

        // Generate 5 courses for testing (change to 50 for full seed)
        for ($i = 0; $i < 5; $i++) {
            $topic = $courseTopics[$i % count($courseTopics)];
            $courseTitle = $topic['title'];
            if ($i >= count($courseTopics)) {
                $courseTitle .= " - Part " . (floor($i / count($courseTopics)) + 1);
            }

            $course = Course::create([
                'title' => $courseTitle,
                'description' => $faker->paragraph(4),
                'poster' => $topic['poster'],
                'thumbnail' => $topic['thumbnail'],
                'category' => $topic['category'],
                'difficulty' => $topic['difficulty'],
                'is_active' => true,
                'created_by' => $user->id,
            ]);

            // Create 20+ steps for each course
            $this->createCourseSteps($course, $faker);
        }
    }

    private function createCourseSteps(Course $course, $faker)
    {
        $stepTypes = ['setup', 'theory', 'code', 'testing', 'deployment', 'review'];
        $stepCount = rand(20, 25); // Ensure at least 20 steps

        // Create a logical progression of step types
        $stepProgression = $this->createStepProgression($stepCount, $stepTypes);

        foreach ($stepProgression as $i => $stepType) {
            $stepNumber = $i + 1;
            
            // Generate enhanced content using OpenAI
            $aiContent = $this->courseContentService->generateCourseSteps(
                $course->title,
                $course->category,
                $course->difficulty,
                $stepNumber,
                $stepType
            );

            CourseStep::create([
                'course_id' => $course->id,
                'title' => $aiContent['title'] ?? "Step $stepNumber: " . $this->getStepTitle($stepType, $stepNumber),
                'description' => $aiContent['description'] ?? $faker->paragraph(2),
                'content' => $aiContent['content'] ?? $this->getStepContent($stepType, $course->title, $stepNumber),
                'step_order' => $stepNumber,
                'step_type' => $stepType,
                'is_required' => $faker->boolean(80),
                'metadata' => json_encode([
                    'difficulty' => $aiContent['difficulty'] ?? $faker->randomElement(['easy', 'medium', 'hard']),
                    'estimated_time' => (is_numeric($aiContent['estimated_time'] ?? 0) ? $aiContent['estimated_time'] : rand(15, 120)) . ' minutes'
                ]),
                'youtube_recommendations' => $aiContent['youtube_recommendations'] ?? $this->getDefaultYouTubeRecommendations($stepType),
                'prerequisites' => $aiContent['prerequisites'] ?? $this->getDefaultPrerequisites($stepType, $stepNumber),
                'learning_objectives' => $aiContent['learning_objectives'] ?? $this->getDefaultLearningObjectives($stepType),
                'estimated_time' => is_numeric($aiContent['estimated_time'] ?? 0) ? (int)$aiContent['estimated_time'] : rand(30, 90),
                'difficulty' => $aiContent['difficulty'] ?? 'medium',
                'is_active' => true,
            ]);

            // Add a small delay to avoid hitting OpenAI rate limits
            if ($stepNumber % 5 === 0) {
                sleep(1);
            }
        }
    }

    /**
     * Create a logical progression of step types for a course
     */
    private function createStepProgression(int $stepCount, array $stepTypes): array
    {
        $progression = [];
        
        // Start with setup steps
        $progression[] = 'setup';
        $progression[] = 'setup';
        
        // Add theory and code steps alternately with some randomness
        for ($i = 2; $i < $stepCount - 4; $i++) {
            if ($i % 4 === 0) {
                $progression[] = 'theory';
            } elseif ($i % 4 === 1) {
                $progression[] = 'code';
            } elseif ($i % 4 === 2) {
                $progression[] = 'code';
            } else {
                $progression[] = rand(0, 1) ? 'testing' : 'review';
            }
        }
        
        // End with testing, deployment, and review
        $progression[] = 'testing';
        $progression[] = 'deployment';
        $progression[] = 'review';
        $progression[] = 'review';
        
        return $progression;
    }

    /**
     * Get default YouTube recommendations for each step type
     */
    private function getDefaultYouTubeRecommendations(string $stepType): array
    {
        $recommendations = [
            'setup' => [
                [
                    'title' => 'Development Environment Setup Tutorial',
                    'channel' => 'Programming with Mosh',
                    'search_query' => 'development environment setup ' . $stepType,
                    'description' => 'Learn how to set up your development environment properly'
                ],
                [
                    'title' => 'Essential Tools for Developers',
                    'channel' => 'Traversy Media',
                    'search_query' => 'developer tools setup guide',
                    'description' => 'Overview of essential development tools and configuration'
                ]
            ],
            'theory' => [
                [
                    'title' => 'Programming Concepts Explained',
                    'channel' => 'freeCodeCamp',
                    'search_query' => 'programming theory fundamentals',
                    'description' => 'Deep dive into core programming concepts and principles'
                ],
                [
                    'title' => 'Software Design Principles',
                    'channel' => 'Derek Banas',
                    'search_query' => 'software design patterns tutorial',
                    'description' => 'Understanding software architecture and design patterns'
                ]
            ],
            'code' => [
                [
                    'title' => 'Hands-on Coding Session',
                    'channel' => 'The Net Ninja',
                    'search_query' => 'coding tutorial practical examples',
                    'description' => 'Follow along coding session with real examples'
                ],
                [
                    'title' => 'Best Coding Practices',
                    'channel' => 'Academind',
                    'search_query' => 'clean code practices tutorial',
                    'description' => 'Learn how to write clean, maintainable code'
                ]
            ],
            'testing' => [
                [
                    'title' => 'Testing Fundamentals',
                    'channel' => 'Tech With Tim',
                    'search_query' => 'software testing tutorial',
                    'description' => 'Learn testing strategies and best practices'
                ],
                [
                    'title' => 'Unit Testing Guide',
                    'channel' => 'Corey Schafer',
                    'search_query' => 'unit testing tutorial',
                    'description' => 'Complete guide to writing effective unit tests'
                ]
            ],
            'deployment' => [
                [
                    'title' => 'Deployment Strategies',
                    'channel' => 'TechWorld with Nana',
                    'search_query' => 'deployment tutorial production',
                    'description' => 'Learn how to deploy applications to production'
                ],
                [
                    'title' => 'Cloud Deployment Guide',
                    'channel' => 'AWS',
                    'search_query' => 'cloud deployment best practices',
                    'description' => 'Deploy applications to cloud platforms effectively'
                ]
            ],
            'review' => [
                [
                    'title' => 'Code Review Best Practices',
                    'channel' => 'Coding Tech',
                    'search_query' => 'code review techniques',
                    'description' => 'Learn effective code review and optimization techniques'
                ],
                [
                    'title' => 'Performance Optimization',
                    'channel' => 'Web Dev Simplified',
                    'search_query' => 'performance optimization tutorial',
                    'description' => 'Optimize your code for better performance'
                ]
            ]
        ];

        return $recommendations[$stepType] ?? $recommendations['theory'];
    }

    /**
     * Get default prerequisites for each step type
     */
    private function getDefaultPrerequisites(string $stepType, int $stepNumber): string
    {
        if ($stepNumber <= 2) {
            return 'Basic understanding of programming concepts';
        }

        $prerequisites = [
            'setup' => 'Access to a computer with internet connection',
            'theory' => 'Complete previous steps and basic programming knowledge',
            'code' => 'Understanding of theoretical concepts from previous steps',
            'testing' => 'Completed implementation from coding steps',
            'deployment' => 'Tested and working application from previous steps',
            'review' => 'Completed implementation and testing phases'
        ];

        return $prerequisites[$stepType] ?? 'Complete all previous steps in order';
    }

    /**
     * Get default learning objectives for each step type
     */
    private function getDefaultLearningObjectives(string $stepType): array
    {
        $objectives = [
            'setup' => [
                'Configure development environment',
                'Install required tools and dependencies',
                'Verify setup functionality'
            ],
            'theory' => [
                'Understand core concepts and principles',
                'Learn best practices and patterns',
                'Grasp theoretical foundations'
            ],
            'code' => [
                'Implement practical solutions',
                'Apply learned concepts in code',
                'Build functional components'
            ],
            'testing' => [
                'Write comprehensive tests',
                'Validate functionality and edge cases',
                'Ensure code quality and reliability'
            ],
            'deployment' => [
                'Deploy to production environment',
                'Configure production settings',
                'Monitor application performance'
            ],
            'review' => [
                'Analyze code quality and performance',
                'Identify optimization opportunities',
                'Document lessons learned'
            ]
        ];

        return $objectives[$stepType] ?? $objectives['theory'];
    }

    private function getStepTitle($type, $stepNumber)
    {
        $titles = [
            'setup' => ['Environment Setup', 'Project Initialization', 'Tool Configuration', 'Dependencies Installation'],
            'theory' => ['Understanding Concepts', 'Core Principles', 'Architecture Overview', 'Best Practices'],
            'code' => ['Implementation', 'Building Components', 'Creating Features', 'Writing Logic'],
            'testing' => ['Unit Testing', 'Integration Testing', 'Test Coverage', 'Quality Assurance'],
            'deployment' => ['Production Setup', 'Deployment Configuration', 'Live Environment', 'Release Management'],
            'review' => ['Code Review', 'Performance Analysis', 'Security Audit', 'Final Optimization']
        ];

        $typeTitle = $titles[$type][array_rand($titles[$type])];
        return "$typeTitle - Module $stepNumber";
    }

    private function getStepContent($type, $courseTitle, $stepNumber)
    {
        $content = "In this step, you will learn about ";

        switch ($type) {
            case 'setup':
                $content .= "setting up your development environment and configuring the necessary tools for the project.";
                break;
            case 'theory':
                $content .= "the theoretical foundations and core concepts that underpin this technology.";
                break;
            case 'code':
                $content .= "hands-on implementation and practical coding exercises to build real functionality.";
                break;
            case 'testing':
                $content .= "testing strategies and best practices to ensure code quality and reliability.";
                break;
            case 'deployment':
                $content .= "deployment processes and production environment configuration.";
                break;
            case 'review':
                $content .= "code review practices and optimization techniques for better performance.";
                break;
        }

        if (str_contains($courseTitle, 'YouTube')) {
            $content .= " This step focuses on building video streaming capabilities.";
        } elseif (str_contains($courseTitle, 'Chat')) {
            $content .= " This step covers real-time messaging functionality.";
        } elseif (str_contains($courseTitle, 'Data Science')) {
            $content .= " This step involves data analysis and machine learning techniques.";
        } elseif (str_contains($courseTitle, 'Docker')) {
            $content .= " This step covers containerization and orchestration concepts.";
        } elseif (str_contains($courseTitle, 'Unity')) {
            $content .= " This step focuses on game development and Unity engine features.";
        } elseif (str_contains($courseTitle, 'Flutter')) {
            $content .= " This step covers mobile app development with Flutter framework.";
        }

        return $content . " You will complete practical exercises and gain hands-on experience with industry-standard tools and practices.";
    }
}
