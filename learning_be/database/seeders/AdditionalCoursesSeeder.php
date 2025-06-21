<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseStep;
use App\Models\User;

class AdditionalCoursesSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure at least one user exists
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'email' => 'teacher@example.com',
                'role' => 'teacher',
            ]);
        }        $additionalCourses = [
            [
                'title' => 'PHP Laravel Framework',
                'description' => 'Master Laravel PHP framework for web development',
                'category' => 'Web Development',
                'difficulty' => 'Intermediate',
                'duration' => 25,
                'poster' => 'https://images.unsplash.com/photo-1599507593362-96d43b3f4e3c?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1599507593362-96d43b3f4e3c?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Vue.js Frontend Development',
                'description' => 'Build modern frontend applications with Vue.js',
                'category' => 'Frontend Development',
                'difficulty' => 'Intermediate',
                'duration' => 18,
                'poster' => 'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'MongoDB Database Design',
                'description' => 'NoSQL database design and optimization',
                'category' => 'Database',
                'difficulty' => 'Intermediate',
                'duration' => 12,
                'poster' => 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'RESTful API Design',
                'description' => 'Design and build professional REST APIs',
                'category' => 'Backend Development',
                'difficulty' => 'Intermediate',
                'duration' => 15,
                'poster' => 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'TypeScript Complete Guide',
                'description' => 'Learn TypeScript for better JavaScript development',
                'category' => 'Programming',
                'difficulty' => 'Intermediate',
                'duration' => 14,
                'poster' => 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Angular Framework',
                'description' => 'Build enterprise applications with Angular',
                'category' => 'Frontend Development',
                'difficulty' => 'Advanced',
                'duration' => 30,
                'poster' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'PostgreSQL Advanced',
                'description' => 'Advanced PostgreSQL database administration',
                'category' => 'Database',
                'difficulty' => 'Advanced',
                'duration' => 20,
                'poster' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Redis Caching Solutions',
                'description' => 'Implement efficient caching with Redis',
                'category' => 'Backend Development',
                'difficulty' => 'Intermediate',
                'duration' => 10,
                'poster' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'GraphQL API Development',
                'description' => 'Modern API development with GraphQL',
                'category' => 'Backend Development',
                'difficulty' => 'Advanced',
                'duration' => 16,
                'poster' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Microservices Architecture',
                'description' => 'Design and implement microservices systems',
                'category' => 'System Architecture',
                'difficulty' => 'Advanced',
                'duration' => 35,
                'poster' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'C# .NET Core Development',
                'description' => 'Build applications with C# and .NET Core',
                'category' => 'Backend Development',
                'difficulty' => 'Intermediate',
                'duration' => 22,
                'poster' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Java Spring Boot',
                'description' => 'Enterprise Java development with Spring Boot',
                'category' => 'Backend Development',
                'difficulty' => 'Intermediate',
                'duration' => 28,
                'poster' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Go Programming Language',
                'description' => 'Modern systems programming with Go',
                'category' => 'Programming',
                'difficulty' => 'Intermediate',
                'duration' => 16,
                'poster' => 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Rust Programming',
                'description' => 'Systems programming with Rust language',
                'category' => 'Programming',
                'difficulty' => 'Advanced',
                'duration' => 24,
                'poster' => 'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'DevOps with Jenkins',
                'description' => 'Continuous integration and deployment',
                'category' => 'DevOps',
                'difficulty' => 'Intermediate',
                'duration' => 18,
                'poster' => 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400&h=300&fit=crop'
            ]
        ];

        foreach ($additionalCourses as $courseData) {            $course = Course::create([
                'title' => $courseData['title'],
                'description' => $courseData['description'],
                'poster' => $courseData['poster'],
                'thumbnail' => $courseData['thumbnail'],
                'category' => $courseData['category'],
                'difficulty' => $courseData['difficulty'],
                'estimated_duration_hours' => $courseData['duration'],
                'is_active' => true,
                'created_by' => $user->id,
            ]);

            $this->createStepsForCourse($course, $courseData);
        }

        $this->command->info('Created 15 additional courses with detailed content!');
    }

    private function createStepsForCourse(Course $course, array $courseData)
    {
        $stepCount = $this->getStepCount($courseData['difficulty']);
        $steps = $this->generateStepsForCourse($course->title, $courseData['category'], $stepCount);
        
        foreach ($steps as $index => $stepData) {
            CourseStep::create([
                'course_id' => $course->id,
                'title' => $stepData['title'],
                'description' => $stepData['description'],
                'content' => $stepData['content'],
                'step_order' => $index + 1,
                'step_type' => $stepData['type'],
                'is_required' => $stepData['required'] ?? true,
                'metadata' => json_encode([
                    'difficulty' => $stepData['difficulty'] ?? 'medium',
                    'estimated_time' => $stepData['time'] ?? '45 minutes'
                ]),
                'is_active' => true,
            ]);
        }
    }

    private function getStepCount($difficulty)
    {
        switch ($difficulty) {
            case 'Beginner':
                return rand(12, 15);
            case 'Intermediate':
                return rand(15, 20);
            case 'Advanced':
                return rand(20, 25);
            default:
                return 15;
        }
    }

    private function generateStepsForCourse($title, $category, $stepCount)
    {
        $steps = [];
        $stepTypes = ['setup', 'theory', 'code', 'testing', 'deployment', 'review'];
        
        // Always start with introduction and setup
        $steps[] = [
            'title' => 'Course Introduction and Overview',
            'description' => 'Introduction to ' . $title,
            'content' => 'In this course, you will learn everything about ' . $title . '. We will cover fundamental concepts, practical applications, and industry best practices.',
            'type' => 'theory',
            'time' => '30 minutes',
            'difficulty' => 'easy'
        ];

        $steps[] = [
            'title' => 'Environment Setup and Tools',
            'description' => 'Setting up development environment',
            'content' => 'Learn how to set up your development environment with all necessary tools and dependencies for ' . $title . '.',
            'type' => 'setup',
            'time' => '60 minutes',
            'difficulty' => 'easy'
        ];

        // Generate middle steps based on course content
        for ($i = 3; $i <= $stepCount - 2; $i++) {
            $stepType = $stepTypes[array_rand($stepTypes)];
            $steps[] = [
                'title' => "Step $i: " . $this->getStepTitleByType($stepType, $title),
                'description' => $this->getStepDescription($stepType, $category),
                'content' => $this->getStepContent($stepType, $title, $category),
                'type' => $stepType,
                'time' => $this->getEstimatedTime($stepType),
                'difficulty' => $this->getStepDifficulty($i, $stepCount)
            ];
        }

        // Always end with final project and review
        $steps[] = [
            'title' => 'Final Project Implementation',
            'description' => 'Build a complete project using ' . $title,
            'content' => 'Apply everything you have learned to build a comprehensive project that demonstrates your mastery of ' . $title . '.',
            'type' => 'code',
            'time' => '180 minutes',
            'difficulty' => 'hard'
        ];

        $steps[] = [
            'title' => 'Course Review and Next Steps',
            'description' => 'Review key concepts and plan future learning',
            'content' => 'Review all the key concepts covered in this course and get recommendations for further learning and career development.',
            'type' => 'review',
            'time' => '45 minutes',
            'difficulty' => 'easy'
        ];

        return $steps;
    }

    private function getStepTitleByType($type, $title)
    {
        $titles = [
            'setup' => ['Configuration', 'Installation', 'Tool Setup', 'Environment Preparation'],
            'theory' => ['Core Concepts', 'Fundamentals', 'Architecture', 'Design Patterns'],
            'code' => ['Implementation', 'Hands-on Practice', 'Building Features', 'Coding Exercise'],
            'testing' => ['Testing Strategies', 'Quality Assurance', 'Test Implementation', 'Debugging'],
            'deployment' => ['Production Deployment', 'Release Process', 'Infrastructure Setup', 'Go Live'],
            'review' => ['Code Review', 'Best Practices', 'Optimization', 'Performance Tuning']
        ];

        return $titles[$type][array_rand($titles[$type])];
    }

    private function getStepDescription($type, $category)
    {
        return "Learn essential $type concepts for $category development";
    }

    private function getStepContent($type, $title, $category)
    {
        $content = "In this step, you will focus on $type aspects of $title. ";
        
        switch ($type) {
            case 'setup':
                $content .= "We'll configure your development environment and install all necessary tools.";
                break;
            case 'theory':
                $content .= "You'll learn the theoretical foundations and core principles.";
                break;
            case 'code':
                $content .= "Get hands-on experience with practical coding exercises and real-world examples.";
                break;
            case 'testing':
                $content .= "Implement comprehensive testing strategies to ensure code quality.";
                break;
            case 'deployment':
                $content .= "Learn how to deploy your application to production environments.";
                break;
            case 'review':
                $content .= "Review your work and learn optimization techniques.";
                break;
        }

        return $content . " This step includes practical exercises and real-world examples relevant to $category.";
    }

    private function getEstimatedTime($type)
    {
        $times = [
            'setup' => ['45 minutes', '60 minutes', '90 minutes'],
            'theory' => ['30 minutes', '45 minutes', '60 minutes'],
            'code' => ['60 minutes', '90 minutes', '120 minutes'],
            'testing' => ['45 minutes', '60 minutes', '90 minutes'],
            'deployment' => ['60 minutes', '90 minutes', '120 minutes'],
            'review' => ['30 minutes', '45 minutes', '60 minutes']
        ];

        return $times[$type][array_rand($times[$type])];
    }

    private function getStepDifficulty($stepNumber, $totalSteps)
    {
        if ($stepNumber <= $totalSteps * 0.3) {
            return 'easy';
        } elseif ($stepNumber <= $totalSteps * 0.7) {
            return 'medium';
        } else {
            return 'hard';
        }
    }
}
