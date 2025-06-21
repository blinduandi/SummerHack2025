# Learning Platform API Testing Guide

## Postman Collection Overview

This Postman collection provides comprehensive testing for all API endpoints in the Learning Platform backend. It includes automated variable management and realistic test scenarios.

## Files Included

1. **`postman_collection.json`** - Main collection with all API endpoints
2. **`postman_environment.json`** - Environment variables for testing
3. **`TESTING_GUIDE.md`** - This instruction file

## Setup Instructions

### 1. Import into Postman

1. Open Postman
2. Click "Import" button
3. Upload both JSON files:
   - `postman_collection.json`
   - `postman_environment.json`
4. Select the "Learning Platform Environment" in the environment dropdown

### 2. Configure Base URL

The default base URL is set to `http://localhost:8000/api`. If your server runs on a different port, update the `base_url` variable in the environment.

### 3. Start Your Laravel Server

Make sure your Laravel development server is running:
```bash
php artisan serve
```

## Testing Workflow

### Recommended Test Order

The collection is organized to follow a logical testing flow:

#### 1. Authentication (Required First)
- **Register Student** - Creates a student account
- **Register Teacher** - Creates a teacher account  
- **Login Student** - Authenticates student and stores token
- **Login Teacher** - Authenticates teacher and stores token
- **Get Profile** - Tests profile retrieval
- **Update Profile** - Tests profile updates

#### 2. Programming Languages
- **List Programming Languages** - Gets available languages and stores first ID

#### 3. Programs (Teacher Creates)
- **Create Program** - Teacher creates a learning program
- **List Programs** - Browse available programs
- **Get Program** - View specific program details
- **Update Program** - Modify program information

#### 4. Courses (Teacher Creates)
- **Create Course** - Teacher creates a course in the program
- **List Courses** - Browse available courses
- **Get Course** - View specific course details
- **Update Course** - Modify course information

#### 5. Course Steps (Teacher Creates)
- **Create Course Step** - Add a lesson step
- **Create Exercise Step** - Add an exercise step
- **List Course Steps** - View all steps in course
- **Get Course Step** - View specific step
- **Update Course Step** - Modify step content

#### 6. Enrollments (Student Actions)
- **Enroll in Program** - Student enrolls in the program
- **List User Enrollments** - View student's enrollments
- **Get Enrollment** - View specific enrollment
- **Update Enrollment Status** - Change enrollment status
- **Get Program Enrollments** - Teacher views program enrollments

#### 7. Progress Tracking (Student Learning)
- **Get User Progress Overview** - Overall progress summary
- **Get Course Progress** - Progress in specific course
- **Update Course Progress** - Record course progress
- **Get Course Steps Progress** - Progress on all steps
- **Get Step Progress** - Progress on specific step
- **Update Step Progress - Lesson** - Complete a lesson
- **Update Step Progress - Exercise** - Complete an exercise

#### 8. Chat (AI Bot)
- **Get Chat History** - View chat messages
- **Send General Message** - Ask general questions
- **Send Course-Specific Message** - Ask about specific course
- **Send Error Message** - Get help with errors
- **Get Course Chat** - View course-specific chat
- **Mark Message as Helpful** - Rate bot responses

#### 9. Course Recommendations
- **Generate Recommendations** - Create AI recommendations
- **Get Recommendations** - View recommendations
- **Dismiss Recommendation** - Remove recommendation

#### 10. Error Testing
- **Test Unauthorized Access** - Verify auth protection
- **Test Invalid Resource** - Test 404 handling
- **Test Validation Errors** - Test input validation
- **Test Student Creating Program** - Test permission restrictions

#### 11. Cleanup (Optional)
- **Delete Course Step** - Remove test data
- **Delete Enrollment** - Remove test data
- **Delete Course** - Remove test data
- **Delete Program** - Remove test data

## Automated Features

### Variable Management
The collection automatically manages variables using test scripts:

- **Authentication tokens** are stored after login
- **Resource IDs** are captured after creation
- **Variables are reused** across requests

### Test Scripts
Many requests include test scripts that:
- Validate response status codes
- Store important data for subsequent requests
- Check response structure

## API Features Tested

### ✅ Authentication & Authorization
- User registration (student/teacher)
- Login/logout functionality
- Profile management
- Token-based authentication
- Role-based access control

### ✅ Program Management
- CRUD operations for programs
- Search and filtering
- Teacher-only creation restrictions

### ✅ Course Management
- CRUD operations for courses
- Course-program relationships
- Programming language assignment

### ✅ Course Steps
- Rich HTML content support
- Multiple step types (lesson, exercise, quiz)
- Sequential ordering
- Metadata support

### ✅ Enrollment System
- Program enrollment
- Status management
- Teacher oversight

### ✅ Progress Tracking
- Course-level progress
- Step-level progress
- Score tracking
- Attempt counting
- Status management

### ✅ AI Chat Bot
- General chat support
- Course-specific help
- Context-aware responses
- Error assistance
- Feedback system

### ✅ Recommendations
- AI-powered course suggestions
- Dismissible recommendations
- Personalized content

### ✅ Error Handling
- Validation errors
- Authorization checks
- Resource not found
- Proper HTTP status codes

## Expected Response Formats

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

### Pagination Response
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [...],
        "last_page": 5,
        "per_page": 15,
        "total": 67
    }
}
```

## Common HTTP Status Codes

- **200** - OK (successful GET, PUT, PATCH)
- **201** - Created (successful POST)
- **400** - Bad Request
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **422** - Validation Error
- **500** - Internal Server Error

## Tips for Testing

### 1. Run in Sequence
Execute requests in the recommended order for the first complete test run.

### 2. Check Variables
Monitor the environment variables panel to see captured values.

### 3. Inspect Responses
Review response bodies to understand data structures.

### 4. Test Error Cases
Use the "Error Testing" folder to verify proper error handling.

### 5. Reset Between Runs
If you want to start fresh, you may need to clear the database or use different email addresses for registration.

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Ensure you've logged in and tokens are stored
   - Check if token has expired

2. **404 Not Found**
   - Verify server is running on correct port
   - Check if base_url variable is correct

3. **422 Validation Error**
   - Review request body for required fields
   - Check data types and formats

4. **403 Forbidden**
   - Verify user role permissions
   - Ensure teacher token is used for teacher-only endpoints

## Advanced Testing

### Custom Scenarios
You can create custom test scenarios by:
1. Duplicating existing requests
2. Modifying request bodies
3. Adding custom test scripts
4. Creating new folders for specific workflows

### Automated Test Runs
Use Postman's Collection Runner to:
1. Run the entire collection automatically
2. Generate test reports
3. Integrate with CI/CD pipelines

## Database State

The collection creates test data that persists in your database. You may want to:
1. Use a separate test database
2. Run the cleanup requests after testing
3. Reset the database between test runs

## Support

If you encounter issues with the API endpoints, check:
1. Laravel logs in `storage/logs/laravel.log`
2. Server console output
3. Network tab in browser dev tools
4. Postman console for debugging

This comprehensive collection should test all major functionality of your Learning Platform API!
