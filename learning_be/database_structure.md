# Learning Platform Database Structure

## Overview
This document describes the database structure for the learning platform that supports both students and teachers with comprehensive course management and tracking features.

## Database Tables

### 1. Users Table (Extended)
**Purpose**: Store user information with role-based access
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `email_verified_at` - Email verification timestamp
- `password` - Encrypted password
- `role` - ENUM('student', 'teacher') - User role
- `language_preference` - User's preferred language (default: 'en')
- `remember_token` - Authentication token
- `created_at`, `updated_at` - Timestamps

### 2. Programming Languages Table
**Purpose**: Store available programming languages for courses
- `id` - Primary key
- `name` - Language name (e.g., 'JavaScript', 'Python')
- `slug` - URL-friendly version (e.g., 'javascript', 'python')
- `file_extension` - File extension (e.g., 'js', 'py')
- `color_hex` - Color for UI display
- `is_active` - Whether language is available
- `created_at`, `updated_at` - Timestamps

### 3. Programs Table
**Purpose**: Store learning programs that contain multiple courses
- `id` - Primary key
- `title` - Program title
- `description` - Program description
- `difficulty_level` - Difficulty level (beginner, intermediate, advanced)
- `estimated_duration_weeks` - Estimated completion time
- `is_active` - Whether program is available
- `created_by` - Foreign key to users (teacher who created it)
- `created_at`, `updated_at` - Timestamps

### 4. Courses Table
**Purpose**: Store individual courses within programs
- `id` - Primary key
- `title` - Course title
- `description` - Course description
- `content` - Course content/lessons
- `difficulty_level` - Difficulty level
- `estimated_duration_hours` - Estimated completion time
- `order_in_program` - Order within the program
- `is_active` - Whether course is available
- `program_id` - Foreign key to programs (optional)
- `programming_language_id` - Foreign key to programming_languages (optional)
- `created_by` - Foreign key to users (teacher who created it)
- `created_at`, `updated_at` - Timestamps

### 5. Enrollments Table
**Purpose**: Track student enrollments in programs
- `id` - Primary key
- `user_id` - Foreign key to users (student)
- `program_id` - Foreign key to programs
- `enrolled_at` - Enrollment timestamp
- `completed_at` - Completion timestamp (nullable)
- `status` - ENUM('active', 'completed', 'dropped', 'paused')
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (`user_id`, `program_id`) - Prevent duplicate enrollments

### 6. Course Progress Table
**Purpose**: Track student progress in individual courses
- `id` - Primary key
- `user_id` - Foreign key to users (student)
- `course_id` - Foreign key to courses
- `status` - ENUM('not_started', 'in_progress', 'completed', 'reset')
- `progress_percentage` - Progress percentage (0-100)
- `started_at` - When course was started
- `completed_at` - When course was completed
- `last_accessed_at` - Last access timestamp
- `checkpoint_data` - JSON field for specific progress data
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (`user_id`, `course_id`) - One progress record per user per course

### 9. Course Steps Table
**Purpose**: Store individual steps within each course
- `id` - Primary key
- `course_id` - Foreign key to courses
- `title` - Step title
- `description` - Step description
- `content` - HTML content including videos, images, commands, information
- `step_order` - Order within the course
- `step_type` - ENUM('lesson', 'exercise', 'quiz', 'project')
- `is_required` - Whether step is mandatory for course completion
- `metadata` - JSON field for additional data (video duration, difficulty, etc.)
- `is_active` - Whether step is available
- `created_at`, `updated_at` - Timestamps
- **Index**: (`course_id`, `step_order`)

### 10. Step Progress Table
**Purpose**: Track student progress in individual course steps
- `id` - Primary key
- `user_id` - Foreign key to users (student)
- `course_step_id` - Foreign key to course_steps
- `status` - ENUM('hidden', 'in_progress', 'solved')
- `started_at` - When step was started
- `completed_at` - When step was completed
- `last_accessed_at` - Last access timestamp
- `progress_data` - JSON field for specific progress (answers, code, etc.)
- `attempts_count` - Number of attempts for exercises/quizzes
- `score` - Score for quizzes/exercises (0.00 to 100.00)
- `notes` - User's personal notes for this step
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (`user_id`, `course_step_id`) - One progress record per user per step
- **Index**: (`user_id`, `status`)

### 11. Git Repositories Table
**Purpose**: Track Git repositories assigned to students for courses
- `id` - Primary key
- `user_id` - Foreign key to users (student)
- `course_id` - Foreign key to courses
- `repository_name` - Repository name
- `repository_url` - Repository URL
- `github_repo_id` - GitHub API repository ID
- `is_private` - Whether repository is private
- `status` - ENUM('pending', 'active', 'archived')
- `created_at_github` - When repository was created on GitHub
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (`user_id`, `course_id`) - One repo per user per course

### 11. Git Repositories Table
**Purpose**: Track Git repositories assigned to students for courses
- `id` - Primary key
- `user_id` - Foreign key to users (student)
- `course_id` - Foreign key to courses
- `repository_name` - Repository name
- `repository_url` - Repository URL
- `github_repo_id` - GitHub API repository ID
- `is_private` - Whether repository is private
- `status` - ENUM('pending', 'active', 'archived')
- `created_at_github` - When repository was created on GitHub
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (`user_id`, `course_id`) - One repo per user per course

### 12. Chat Messages Table
**Purpose**: Store chat messages between students and AI bot
- `id` - Primary key
- `user_id` - Foreign key to users
- `course_id` - Foreign key to courses (nullable)
- `sender_type` - ENUM('user', 'bot')
- `message` - Message content
- `context_data` - JSON field for conversation context, code snippets, etc.
- `is_helpful` - User feedback on bot responses (nullable)
- `read_at` - When message was read
- `created_at`, `updated_at` - Timestamps
- **Index**: (`user_id`, `course_id`, `created_at`)

### 13. Course Recommendations Table
**Purpose**: Store AI-generated course recommendations for students
- `id` - Primary key
- `user_id` - Foreign key to users (student)
- `course_id` - Foreign key to courses
- `recommendation_score` - Score (0.00 to 100.00)
- `recommendation_type` - ENUM('skill_based', 'completion_based', 'interest_based', 'collaborative')
- `recommendation_factors` - JSON field storing factors that led to recommendation
- `is_dismissed` - Whether user dismissed the recommendation
- `recommended_at` - When recommendation was generated
- `created_at`, `updated_at` - Timestamps
- **Unique constraint**: (`user_id`, `course_id`) - One recommendation per user per course
- **Index**: (`user_id`, `recommendation_score`)

## Key Features Supported

### Student Features:
- ✅ Login/Register with role-based access
- ✅ Enroll in programs
- ✅ Get recommended courses based on progress and preferences
- ✅ Follow courses with progress tracking
- ✅ **Follow individual course steps with detailed progress tracking**
- ✅ **Track step-by-step learning status (hidden, in_progress, solved)**
- ✅ **Store progress data, scores, and personal notes for each step**
- ✅ Track learning status and progress percentage
- ✅ Choose programming language for courses
- ✅ Chat with AI bot for course assistance
- ✅ Review detailed progress with checkpoint data
- ✅ Reset course status when needed
- ✅ Git repository assignment per course
- ✅ Profile management with language preferences

### Teacher Features:
- ✅ Create and manage courses
- ✅ **Create and manage course steps with rich HTML content**
- ✅ **Set step types (lesson, exercise, quiz, project)**
- ✅ **Configure step requirements and ordering**
- ✅ Create and manage learning programs
- ✅ Profile management
- ✅ Track student enrollments and progress
- ✅ **Monitor detailed step-by-step student progress**

### System Features:
- ✅ Course recommendations engine
- ✅ Progress tracking and analytics
- ✅ **Detailed step-by-step progress tracking**
- ✅ **Rich HTML content support for course steps**
- ✅ **Flexible step states (hidden, in_progress, solved)**
- ✅ Git repository integration
- ✅ AI chat bot support
- ✅ Multi-language support

## Database Relationships

```
Users (1) ──→ (Many) Enrollments ←── (Many) Programs (1) ──→ (Many) Courses (1) ──→ (Many) Course_Steps
Users (1) ──→ (Many) Course_Progress ←── (Many) Courses
Users (1) ──→ (Many) Step_Progress ←── (Many) Course_Steps
Users (1) ──→ (Many) Git_Repositories ←── (Many) Courses
Users (1) ──→ (Many) Chat_Messages ←── (Many) Courses
Users (1) ──→ (Many) Course_Recommendations ←── (Many) Courses
Programming_Languages (1) ──→ (Many) Courses
Users (Teachers) (1) ──→ (Many) Programs (created_by)
Users (Teachers) (1) ──→ (Many) Courses (created_by)
Courses (1) ──→ (Many) Course_Steps
Course_Steps (1) ──→ (Many) Step_Progress
```

## Migration Order
1. `create_users_table` (Laravel default)
2. `update_users_table_add_role_and_preferences`
3. `create_programs_table`
4. `create_programming_languages_table`
5. `create_courses_table`
6. `create_course_steps_table`
7. `create_enrollments_table`
8. `create_course_progress_table`
9. `create_step_progress_table`
10. `create_git_repositories_table`
11. `create_chat_messages_table`
12. `create_course_recommendations_table`

## Initial Data
- Programming languages seeder includes popular languages: JavaScript, Python, Java, PHP, C++, C#, Go, Rust, TypeScript, Ruby
- Each language includes appropriate file extensions and brand colors for UI

## Course Steps Functionality

### Step Content Storage
- **HTML Content**: Each step stores rich HTML content in the `content` field
- **Multimedia Support**: Content can include videos, images, code blocks, interactive elements
- **Command Instructions**: Steps can contain terminal commands, code examples, and exercises
- **Flexible Structure**: HTML format allows for any type of educational content

### Step Types
- **lesson**: Instructional content (videos, text, images)
- **exercise**: Practical coding exercises
- **quiz**: Knowledge assessment questions
- **project**: Larger assignments or projects

### Step States per User
- **hidden**: Step is not yet available to the student (prerequisites not met)
- **in_progress**: Student has started but not completed the step
- **solved**: Student has successfully completed the step

### Progress Tracking Features
- **Detailed Progress Data**: JSON field stores specific progress like code submissions, quiz answers
- **Scoring System**: Support for scoring exercises and quizzes (0-100 scale)
- **Attempt Tracking**: Count number of attempts for exercises/quizzes
- **Personal Notes**: Students can add personal notes to each step
- **Time Tracking**: Track when steps are started, completed, and last accessed

### Step Ordering and Requirements
- **Sequential Learning**: Steps are ordered within courses via `step_order`
- **Required vs Optional**: Steps can be marked as required for course completion
- **Metadata Storage**: Additional information like difficulty, estimated time, prerequisites

## Summary

The database structure now fully supports a comprehensive learning platform with:

### ✅ **Hierarchical Learning Structure**
```
Programs → Courses → Course Steps → Step Progress (per user)
```

### ✅ **Rich Content Management**
- HTML-based step content supporting videos, images, code, and interactive elements
- Multiple step types: lessons, exercises, quizzes, projects
- Flexible metadata for additional step configuration

### ✅ **Granular Progress Tracking**
- Step-level progress with three states: hidden, in_progress, solved
- Score tracking for exercises and quizzes
- Attempt counting and time tracking
- Personal notes and custom progress data

### ✅ **Complete Learning Features**
- User roles (student/teacher) with appropriate permissions
- Course recommendations and enrollment management
- Git repository integration per course
- AI chat bot support with context
- Multi-language support and preferences

The structure is designed to be scalable and flexible, supporting various types of educational content and tracking detailed learning analytics for both students and teachers.
