<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseStep;
use App\Models\User;
use Faker\Factory as Faker;

class ComplexCourseSeeder extends Seeder
{
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

        // Generate 50 courses
        for ($i = 0; $i < 50; $i++) {
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

        for ($i = 1; $i <= $stepCount; $i++) {
            $stepType = $stepTypes[array_rand($stepTypes)];

            CourseStep::create([
                'course_id' => $course->id,
                'title' => "Step $i: " . $this->getStepTitle($stepType, $i),
                'description' => $faker->paragraph(2),
                'content' => $this->getStepContent($stepType, $course->title, $i),
                'step_order' => $i,
                'step_type' => $stepType,
                'is_required' => $faker->boolean(80),
                'metadata' => json_encode([
                    'difficulty' => $faker->randomElement(['easy', 'medium', 'hard']),
                    'estimated_time' => rand(15, 120) . ' minutes'
                ]),
                'is_active' => true,
            ]);
        }
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
