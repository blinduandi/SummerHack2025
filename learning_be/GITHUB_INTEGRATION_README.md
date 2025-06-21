# Laravel Learning Platform - Course-Student GitHub Integration

## Overview
This implementation provides a complete refactoring of the Laravel learning platform, removing the "program" concept and making courses independent. It also adds comprehensive GitHub repository integration and code analysis capabilities for each student-course enrollment.

## What's Been Implemented

### 1. Database Schema Changes
- **Removed Program Logic**: All `program_id` references removed from courses and enrollments
- **Avatar Support**: Added `avatar` field to users table
- **GitHub Integration**: Added GitHub repository fields to enrollments:
  - `github_repository_url` - The student's GitHub repo URL for the course
  - `github_repository_name` - Repository name (auto-extracted from URL)
  - `code_analysis_data` - JSON field for storing analysis results
  - `code_quality_score` - Decimal score (0-100) from code analysis
  - `last_analysis_at` - Timestamp of last analysis

### 2. Model Updates
- **Course Model**: Removed program relationships, added enrollments relationship
- **Enrollment Model**: Now uses `course_id` instead of `program_id`, includes GitHub fields
- **User Model**: Added avatar support

### 3. API Endpoints

#### Core Enrollment Endpoints
- `GET /api/enrollments` - List user enrollments
- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments/{id}` - Get enrollment details
- `PATCH /api/enrollments/{id}/status` - Update enrollment status
- `DELETE /api/enrollments/{id}` - Remove enrollment

#### GitHub Integration Endpoints
- `PATCH /api/enrollments/{id}/github-repository` - Assign GitHub repo to enrollment
- `PATCH /api/enrollments/{id}/code-analysis` - Update code analysis results
- `POST /api/enrollments/{id}/trigger-analysis` - Trigger code analysis

#### CodeRabbit Integration
- `POST /api/coderabbit/webhook` - Webhook for receiving analysis results
- `POST /api/coderabbit/analyze` - Manual analysis trigger

### 4. CodeRabbit Service Integration
- **CodeRabbitService**: Complete service class for API integration
- **Webhook Handling**: Secure webhook processing with signature validation
- **Quality Score Calculation**: Automatic scoring based on analysis results
- **Error Handling**: Comprehensive logging and error management

## How Students Assign GitHub Repositories

### Step 1: Enroll in Course
```http
POST /api/enrollments
{
    "course_id": 1
}
```

### Step 2: Assign GitHub Repository
```http
PATCH /api/enrollments/{enrollment_id}/github-repository
{
    "github_repository_url": "https://github.com/student/awesome-project",
    "github_repository_name": "student/awesome-project"  // optional
}
```

### Step 3: Trigger Code Analysis (Optional)
```http
POST /api/enrollments/{enrollment_id}/trigger-analysis
```

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# CodeRabbit Integration
CODERABBIT_API_KEY=your_api_key_here
CODERABBIT_BASE_URL=https://api.coderabbit.ai
CODERABBIT_WEBHOOK_SECRET=your_webhook_secret
```

## CodeRabbit Integration Details

### Pricing & Usage for Hackathons
- **Free for Open Source**: Perfect for hackathon public repositories
- **$12/month for Private Repos**: Affordable for small teams
- **Pay-per-use Options**: Available for occasional analysis

### Features Available
- **Automated Code Review**: AI-powered analysis of pull requests
- **Security Scanning**: Vulnerability detection
- **Quality Metrics**: Code complexity, maintainability scores
- **Webhook Integration**: Real-time result delivery

## File Structure

### Database Migrations
- `2025_06_21_154525_add_avatar_to_users_table.php`
- `2025_06_21_155423_add_github_repo_to_enrollments_table.php`
- `2025_06_21_155950_recreate_enrollments_for_courses.php`

### Models
- `app/Models/User.php` - Added avatar support
- `app/Models/Course.php` - Removed program logic, added enrollments
- `app/Models/Enrollment.php` - Updated for course relationship + GitHub fields

### Controllers
- `app/Http/Controllers/Api/EnrollmentController.php` - GitHub repo management
- `app/Http/Controllers/Api/CodeRabbitWebhookController.php` - Webhook handling

### Services
- `app/Services/CodeRabbitService.php` - Complete CodeRabbit integration

### Routes
- Updated `routes/api.php` with all new endpoints

## Next Steps

1. **Frontend Integration**: Update frontend to allow students to input GitHub URLs
2. **Real CodeRabbit Setup**: Configure actual CodeRabbit API credentials
3. **Testing**: Create comprehensive tests for the new functionality
4. **UI Enhancements**: Add visual indicators for code quality scores
5. **Notifications**: Alert students when analysis is complete

## Example Usage Flow

1. Student enrolls in "JavaScript Fundamentals" course
2. Student creates a GitHub repository for their course project
3. Student assigns the repository to their enrollment via API
4. System automatically triggers CodeRabbit analysis (if configured)
5. Analysis results are stored and student can view quality score
6. Teacher can review student's code quality across all enrollments

This implementation provides a solid foundation for a modern coding education platform with automated code quality assessment.
