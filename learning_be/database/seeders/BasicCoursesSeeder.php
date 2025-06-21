<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseStep;
use App\Models\User;

class BasicCoursesSeeder extends Seeder
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
        }        $basicCourses = [
            [
                'title' => 'HTML & CSS Fundamentals',
                'description' => 'Learn the building blocks of web development with HTML and CSS. Perfect for absolute beginners.',
                'category' => 'Web Development',
                'difficulty' => 'Beginner',
                'duration' => 8,
                'poster' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'JavaScript Basics',
                'description' => 'Master the fundamentals of JavaScript programming language from scratch.',
                'category' => 'Programming',
                'difficulty' => 'Beginner',
                'duration' => 12,
                'poster' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Python Programming 101',
                'description' => 'Introduction to Python programming for complete beginners.',
                'category' => 'Programming',
                'difficulty' => 'Beginner',
                'duration' => 10,
                'poster' => 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Git Version Control',
                'description' => 'Learn Git basics for code versioning and collaboration.',
                'category' => 'Development Tools',
                'difficulty' => 'Beginner',
                'duration' => 6,
                'poster' => 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'SQL Database Basics',
                'description' => 'Understanding databases and SQL query fundamentals.',
                'category' => 'Database',
                'difficulty' => 'Beginner',
                'duration' => 8,
                'poster' => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'React.js Introduction',
                'description' => 'Get started with React.js for building modern web applications.',
                'category' => 'Web Development',
                'difficulty' => 'Intermediate',
                'duration' => 15,
                'poster' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Node.js Backend Development',
                'description' => 'Build backend applications with Node.js and Express.',
                'category' => 'Backend Development',
                'difficulty' => 'Intermediate',
                'duration' => 18,
                'poster' => 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Linux Command Line',
                'description' => 'Master essential Linux commands and terminal usage.',
                'category' => 'System Administration',
                'difficulty' => 'Beginner',
                'duration' => 7,
                'poster' => 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'API Development with Laravel',
                'description' => 'Build RESTful APIs using the Laravel PHP framework.',
                'category' => 'Backend Development',
                'difficulty' => 'Intermediate',
                'duration' => 20,
                'poster' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Responsive Web Design',
                'description' => 'Create websites that work perfectly on all devices.',
                'category' => 'Web Development',
                'difficulty' => 'Beginner',
                'duration' => 12,
                'poster' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                'thumbnail' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
            ]
        ];

        foreach ($basicCourses as $courseData) {            $course = Course::create([
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

            $this->createBasicSteps($course, $courseData);
        }

        $this->command->info('Created 10 basic courses with comprehensive content!');
    }

    private function createBasicSteps(Course $course, array $courseData)
    {
        $steps = $this->getStepsForCourse($courseData['title']);
        
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
                    'estimated_time' => $stepData['time'] ?? '30 minutes'
                ]),
                'is_active' => true,
            ]);
        }
    }

    private function getStepsForCourse(string $courseTitle): array
    {
        switch ($courseTitle) {
            case 'HTML & CSS Fundamentals':
                return [
                    ['title' => 'Introduction to HTML', 'description' => 'Understanding HTML structure', 'content' => 'Learn about HTML tags, elements, and document structure.', 'type' => 'theory', 'time' => '45 minutes'],
                    ['title' => 'HTML Elements and Tags', 'description' => 'Working with HTML elements', 'content' => 'Practice using headings, paragraphs, links, and images.', 'type' => 'code', 'time' => '60 minutes'],
                    ['title' => 'HTML Forms', 'description' => 'Creating interactive forms', 'content' => 'Build forms with input fields, buttons, and validation.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'Introduction to CSS', 'description' => 'CSS basics and syntax', 'content' => 'Learn CSS selectors, properties, and values.', 'type' => 'theory', 'time' => '45 minutes'],
                    ['title' => 'CSS Styling', 'description' => 'Styling HTML elements', 'content' => 'Apply colors, fonts, spacing, and layout properties.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'CSS Layout - Flexbox', 'description' => 'Modern layout with Flexbox', 'content' => 'Master flexible layouts using CSS Flexbox.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'CSS Layout - Grid', 'description' => 'Advanced layouts with CSS Grid', 'content' => 'Create complex layouts using CSS Grid system.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'Responsive Design', 'description' => 'Mobile-first design approach', 'content' => 'Use media queries and responsive units.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'CSS Animations', 'description' => 'Adding motion to your pages', 'content' => 'Create smooth transitions and keyframe animations.', 'type' => 'code', 'time' => '60 minutes'],
                    ['title' => 'Final Project', 'description' => 'Build a complete webpage', 'content' => 'Create a responsive webpage using all learned concepts.', 'type' => 'code', 'time' => '120 minutes'],
                ];

            case 'JavaScript Basics':
                return [
                    ['title' => 'JavaScript Introduction', 'description' => 'What is JavaScript?', 'content' => 'Understanding JavaScript and its role in web development.', 'type' => 'theory', 'time' => '30 minutes'],
                    ['title' => 'Variables and Data Types', 'description' => 'Storing and working with data', 'content' => 'Learn about var, let, const, strings, numbers, and booleans.', 'type' => 'code', 'time' => '60 minutes'],
                    ['title' => 'Operators and Expressions', 'description' => 'Performing operations', 'content' => 'Arithmetic, comparison, and logical operators.', 'type' => 'code', 'time' => '45 minutes'],
                    ['title' => 'Control Structures', 'description' => 'If statements and loops', 'content' => 'Control program flow with conditionals and loops.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'Functions', 'description' => 'Reusable code blocks', 'content' => 'Create and use functions with parameters and return values.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'Arrays', 'description' => 'Working with collections', 'content' => 'Store and manipulate lists of data.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'Objects', 'description' => 'Grouping related data', 'content' => 'Create and use objects to organize code.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'DOM Manipulation', 'description' => 'Interacting with web pages', 'content' => 'Select and modify HTML elements dynamically.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'Events', 'description' => 'Responding to user actions', 'content' => 'Handle clicks, form submissions, and other events.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'Final Project', 'description' => 'Interactive web application', 'content' => 'Build a complete interactive application.', 'type' => 'code', 'time' => '150 minutes'],
                ];

            case 'Python Programming 101':
                return [
                    ['title' => 'Python Setup', 'description' => 'Installing Python and IDE', 'content' => 'Set up Python environment and choose an IDE.', 'type' => 'setup', 'time' => '30 minutes'],
                    ['title' => 'Python Syntax Basics', 'description' => 'Understanding Python syntax', 'content' => 'Learn about indentation, comments, and basic syntax rules.', 'type' => 'theory', 'time' => '45 minutes'],
                    ['title' => 'Variables and Data Types', 'description' => 'Working with data in Python', 'content' => 'Strings, integers, floats, and booleans in Python.', 'type' => 'code', 'time' => '60 minutes'],
                    ['title' => 'Lists and Tuples', 'description' => 'Python collections', 'content' => 'Store and manipulate sequences of data.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'Dictionaries', 'description' => 'Key-value data structures', 'content' => 'Work with Python dictionaries for data organization.', 'type' => 'code', 'time' => '60 minutes'],
                    ['title' => 'Control Flow', 'description' => 'If statements and loops', 'content' => 'Control program execution with conditionals and loops.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'Functions', 'description' => 'Creating reusable code', 'content' => 'Define and use functions with parameters and return values.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'File Handling', 'description' => 'Reading and writing files', 'content' => 'Work with text files and data persistence.', 'type' => 'code', 'time' => '75 minutes'],
                    ['title' => 'Error Handling', 'description' => 'Dealing with exceptions', 'content' => 'Handle errors gracefully with try-except blocks.', 'type' => 'code', 'time' => '60 minutes'],
                    ['title' => 'Final Project', 'description' => 'Python application', 'content' => 'Build a complete Python program using all concepts.', 'type' => 'code', 'time' => '120 minutes'],
                ];

            default:
                // Generic steps for other courses
                return [
                    ['title' => 'Course Introduction', 'description' => 'Overview of the course', 'content' => 'What you will learn in this course.', 'type' => 'theory', 'time' => '30 minutes'],
                    ['title' => 'Environment Setup', 'description' => 'Setting up development environment', 'content' => 'Install and configure necessary tools.', 'type' => 'setup', 'time' => '45 minutes'],
                    ['title' => 'Basic Concepts', 'description' => 'Fundamental concepts', 'content' => 'Understanding the core principles.', 'type' => 'theory', 'time' => '60 minutes'],
                    ['title' => 'First Practical Exercise', 'description' => 'Hands-on practice', 'content' => 'Apply what you have learned so far.', 'type' => 'code', 'time' => '90 minutes'],
                    ['title' => 'Intermediate Concepts', 'description' => 'Building on the basics', 'content' => 'More advanced topics and techniques.', 'type' => 'theory', 'time' => '75 minutes'],
                    ['title' => 'Advanced Practice', 'description' => 'Complex exercises', 'content' => 'Work on more challenging problems.', 'type' => 'code', 'time' => '120 minutes'],
                    ['title' => 'Best Practices', 'description' => 'Industry standards', 'content' => 'Learn professional development practices.', 'type' => 'theory', 'time' => '60 minutes'],
                    ['title' => 'Testing and Debugging', 'description' => 'Quality assurance', 'content' => 'Test your code and fix issues.', 'type' => 'testing', 'time' => '90 minutes'],
                    ['title' => 'Project Work', 'description' => 'Capstone project', 'content' => 'Build a complete project from scratch.', 'type' => 'code', 'time' => '180 minutes'],
                    ['title' => 'Course Wrap-up', 'description' => 'Review and next steps', 'content' => 'Review what you learned and plan next steps.', 'type' => 'review', 'time' => '45 minutes'],
                ];
        }
    }
}
