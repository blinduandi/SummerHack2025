# Learning Platform API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
The API uses Laravel Sanctum for authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "student", // or "teacher"
    "language_preference": "en"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "John Updated",
    "language_preference": "es"
}
```

### Courses

#### List Courses
```http
GET /api/courses?language_id=1&difficulty=beginner&search=intro
Authorization: Bearer {token}
```

**Response includes enrollment information for authenticated users:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "title": "JavaScript Fundamentals",
                "description": "Learn the basics",
                "difficulty_level": "beginner",
                "is_enrolled": true,
                "enrollment": {
                    "id": 5,
                    "status": "active",
                    "github_repository_url": "https://github.com/student/js-project",
                    "code_quality_score": 87.5,
                    "enrolled_at": "2025-06-21T10:30:00.000000Z"
                },
                "programming_language": {
                    "id": 1,
                    "name": "JavaScript"
                }
            }
        ]
    }
}
```

#### My Enrolled Courses
```http
GET /api/courses/my-enrolled?language_id=1&difficulty=beginner&search=intro
Authorization: Bearer {token}
```

Returns only courses the authenticated user is enrolled in. All courses will have `is_enrolled: true` and include enrollment details.

**Response:**
```json
{
    "success": true,
    "message": "My enrolled courses retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "title": "JavaScript Fundamentals",
                "is_enrolled": true,
                "enrollment": {
                    "id": 5,
                    "status": "active",
                    "github_repository_url": "https://github.com/student/js-project",
                    "code_quality_score": 87.5
                }
            }
        ]
    }
}
```

#### Available Courses (Not Enrolled)
```http
GET /api/courses/available?language_id=1&difficulty=beginner&search=intro
Authorization: Bearer {token}
```

Returns only courses the authenticated user is NOT enrolled in. All courses will have `is_enrolled: false` and `enrollment: null`.

**Response:**
```json
{
    "success": true,
    "message": "Available courses retrieved successfully",
    "data": {
        "data": [
            {
                "id": 2,
                "title": "Advanced JavaScript",
                "is_enrolled": false,
                "enrollment": null
            }
        ]
    }
}
```

#### Get Course
```http
GET /api/courses/{id}
Authorization: Bearer {token}
```

**Response includes enrollment information for authenticated users:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "JavaScript Fundamentals",
        "description": "Learn JavaScript basics with automated code quality analysis",
        "is_enrolled": true,
        "enrollment": {
            "id": 5,
            "status": "active",
            "github_repository_url": "https://github.com/student/js-project",
            "github_repository_name": "student/js-project",
            "code_analysis_data": {...},
            "code_quality_score": 87.5,
            "last_analysis_at": "2025-06-21T15:45:00.000000Z"
        }
    }
}
```

#### Create Course (Teachers only)
```http
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Introduction to JavaScript",
    "description": "Learn the basics of JavaScript",
    "content": "Course overview content...",
    "difficulty_level": "beginner",
    "estimated_duration_hours": 40,
    "programming_language_id": 1,
    "is_active": true
}
```

#### Update Course
```http
PUT /api/courses/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Updated Course Title"
}
```

#### Delete Course
```http
DELETE /api/courses/{id}
Authorization: Bearer {token}
```

### Course Steps

#### List Course Steps
```http
GET /api/courses/{course_id}/steps
Authorization: Bearer {token}
```

#### Get Course Step
```http
GET /api/courses/{course_id}/steps/{step_id}
Authorization: Bearer {token}
```

#### Create Course Step (Teachers only)
```http
POST /api/courses/{course_id}/steps
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Variables in JavaScript",
    "description": "Learn about variables",
    "content": "<h2>Variables</h2><p>Variables are...</p>",
    "step_order": 1,
    "step_type": "lesson",
    "is_required": true,
    "metadata": {
        "estimated_duration": 15,
        "difficulty": "beginner"
    },
    "is_active": true
}
```

#### Update Course Step
```http
PUT /api/courses/{course_id}/steps/{step_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Updated Step Title"
}
```

#### Delete Course Step
```http
DELETE /api/courses/{course_id}/steps/{step_id}
Authorization: Bearer {token}
```

### Enrollments

#### List User Enrollments
```http
GET /api/enrollments
Authorization: Bearer {token}
```

#### Enroll in Course
```http
POST /api/enrollments
Authorization: Bearer {token}
Content-Type: application/json

{
    "course_id": 1
}
```

#### Get Enrollment
```http
GET /api/enrollments/{id}
Authorization: Bearer {token}
```

#### Update Enrollment Status
```http
PATCH /api/enrollments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": "completed" // or "active", "dropped", "paused"
}
```

#### Update GitHub Repository
```http
PATCH /api/enrollments/{id}/github-repository
Authorization: Bearer {token}
Content-Type: application/json

{
    "github_repository_url": "https://github.com/username/repo-name",
    "github_repository_name": "username/repo-name" // optional, will be extracted from URL if not provided
}
```

#### Update Code Analysis
```http
PATCH /api/enrollments/{id}/code-analysis
Authorization: Bearer {token}
Content-Type: application/json

{
    "code_analysis_data": {
        "issues": [
            {
                "type": "bug",
                "severity": "high",
                "file": "src/main.js",
                "line": 42,
                "message": "Potential null pointer dereference"
            }
        ],
        "metrics": {
            "lines_of_code": 500,
            "complexity": 15,
            "test_coverage": 85
        }
    },
    "code_quality_score": 87.5
}
```

#### Trigger Code Analysis
```http
POST /api/enrollments/{id}/trigger-analysis
Authorization: Bearer {token}
```

#### Delete Enrollment
```http
DELETE /api/enrollments/{id}
Authorization: Bearer {token}
```

### Progress Tracking

#### Get User Progress Overview
```http
GET /api/progress/user
Authorization: Bearer {token}
```

#### Get Course Progress
```http
GET /api/progress/course/{course_id}
Authorization: Bearer {token}
```

#### Update Course Progress
```http
PUT /api/progress/course/{course_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "progress_percentage": 75,
    "status": "in_progress",
    "checkpoint_data": {
        "last_lesson": 5,
        "quiz_scores": [85, 92]
    }
}
```

#### Get Course Steps Progress
```http
GET /api/progress/course/{course_id}/steps
Authorization: Bearer {token}
```

#### Get Step Progress
```http
GET /api/progress/step/{step_id}
Authorization: Bearer {token}
```

#### Update Step Progress
```http
PUT /api/progress/step/{step_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": "solved",
    "score": 95,
    "progress_data": {
        "answers": ["correct", "correct", "incorrect"],
        "code_submission": "console.log('Hello World');"
    },
    "notes": "This was challenging but I understood it",
    "increment_attempts": true
}
```

### Chat (AI Bot)

The chat system uses OpenAI's GPT-3.5-turbo model to provide intelligent programming tutoring assistance. The AI understands context, code snippets, error messages, and provides personalized help based on the user's current course and progress.

#### Get Chat History
```http
GET /api/chat
Authorization: Bearer {token}
```

#### Get Course Chat
```http
GET /api/chat/course/{course_id}
Authorization: Bearer {token}
```

#### Send Message (General Chat)
```http
POST /api/chat
Authorization: Bearer {token}
Content-Type: application/json

{
    "message": "I'm having trouble with JavaScript variables. Can you explain the difference between let and const?",
    "context_data": {
        "user_level": "beginner",
        "topic": "variables",
        "code_snippet": "let firstName = 'John'; const lastName = 'Doe';",
        "difficulty": "understanding syntax"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Message sent successfully",
    "data": {
        "user_message": {
            "id": 1,
            "message": "I'm having trouble with JavaScript variables...",
            "sender_type": "user",
            "created_at": "2025-06-21T12:00:00Z"
        },
        "bot_response": {
            "id": 2,
            "message": "Great question! The difference between `let` and `const` is important...",
            "sender_type": "bot",
            "context_data": {
                "ai_model": "gpt-3.5-turbo",
                "response_to": 1,
                "generated_at": "2025-06-21T12:00:01Z"
            },
            "created_at": "2025-06-21T12:00:01Z"
        }
    }
}
```

#### Send Course-Specific Message
```http
POST /api/chat/course/{course_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "message": "I'm getting an error in my code and I don't understand what's wrong",
    "context_data": {
        "step_id": 12,
        "code_snippet": "let firstName = 'John'; console.log(firstname);",
        "error_message": "ReferenceError: firstname is not defined"
    }
}
```

**AI Features:**
- **Context-Aware**: Understands current course, step, and user progress
- **Code Analysis**: Can analyze code snippets and explain errors
- **Error Debugging**: Helps identify and fix common programming mistakes
- **Personalized Learning**: Adapts responses based on user level and course content
- **Fallback System**: Gracefully falls back to rule-based responses if OpenAI is unavailable

#### Mark Message as Helpful
```http
PATCH /api/chat/messages/{message_id}/helpful
Authorization: Bearer {token}
Content-Type: application/json

{
    "is_helpful": true
}
```

### Course Recommendations

#### Get Recommendations
```http
GET /api/recommendations
Authorization: Bearer {token}
```

#### Generate New Recommendations
```http
POST /api/recommendations/generate
Authorization: Bearer {token}
```

#### Dismiss Recommendation
```http
PATCH /api/recommendations/{recommendation_id}/dismiss
Authorization: Bearer {token}
```

### Programming Languages

#### List Programming Languages
```http
GET /api/programming-languages
Authorization: Bearer {token}
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
    "success": true,
    "data": {...},
    "message": "Optional success message"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error message",
    "errors": {
        "field": ["Validation error message"]
    }
}
```

### Pagination
List endpoints return paginated data:
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [...],
        "first_page_url": "...",
        "from": 1,
        "last_page": 5,
        "last_page_url": "...",
        "links": [...],
        "next_page_url": "...",
        "path": "...",
        "per_page": 15,
        "prev_page_url": null,
        "to": 15,
        "total": 67
    }
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Getting Started

1. Register a new account or login
2. If you're a teacher, create programs and courses
3. If you're a student, browse and enroll in programs
4. Track your progress through courses and steps
5. Use the chat feature for help
6. Get personalized course recommendations

## Features Implemented

✅ **Authentication & Authorization**
- User registration and login
- Role-based access (student/teacher)
- Profile management

✅ **Program & Course Management**
- CRUD operations for programs and courses
- Course steps with rich HTML content
- Programming language assignment

✅ **Enrollment & Progress Tracking**
- Program enrollment
- Detailed course progress tracking
- Step-by-step progress with states (hidden, in_progress, solved)
- Score tracking and attempts counting

✅ **AI Chat Bot**
- Course-specific and general chat
- Context-aware responses
- Feedback system for bot responses

✅ **Course Recommendations**
- AI-powered course suggestions
- Multiple recommendation types
- Dismissible recommendations

✅ **Full API Coverage**
- RESTful API design
- Comprehensive validation
- Proper error handling
- Pagination support
