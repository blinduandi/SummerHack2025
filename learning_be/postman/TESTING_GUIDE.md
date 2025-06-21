# Postman Testing Guide - Laravel Learning Platform with CodeRabbit

## Setup Instructions

### 1. Import Collections and Environment

1. **Import the Postman Collection:**
   - Open Postman
   - Click "Import" 
   - Select `postman/Laravel_Learning_Platform_CodeRabbit.postman_collection.json`

2. **Import the Environment:**
   - Click "Import" again
   - Select `postman/Laravel_Learning_Platform_Local.postman_environment.json`
   - Set this as your active environment

### 2. Server Setup

Make sure your Laravel server is running:
```bash
cd "d:\Proiect invatare\learning_be"
php artisan serve
```

Your API will be available at: `http://localhost:8000`

## Complete Testing Workflow

### Phase 1: Authentication & User Setup

1. **Register User** 
   - Creates a new student account
   - Use provided JSON payload or customize as needed
   - **Auto-saves:** Nothing (manual test)

2. **Login User**
   - Authenticates and gets access token
   - **Auto-saves:** `AUTH_TOKEN` and `USER_ID` to environment
   - ✅ **Critical:** This must work for all other tests

3. **Get Profile**
   - Verifies authentication is working
   - Should return user details including avatar field

### Phase 2: Course Management

4. **List Courses**
   - Shows all courses with enrollment information
   - **Tests:** Verifies `is_enrolled` and `enrollment` fields are present
   - Shows mixed enrolled/not enrolled status

5. **My Enrolled Courses**
   - Shows only courses the user is enrolled in
   - **Tests:** All courses should have `is_enrolled: true`
   - **Tests:** All courses should have enrollment details

6. **Available Courses (Not Enrolled)**
   - Shows only courses the user is NOT enrolled in
   - **Tests:** All courses should have `is_enrolled: false`
   - **Tests:** All courses should have `enrollment: null`

7. **Create Course**
   - Creates a test course for enrollment
   - **Auto-saves:** `COURSE_ID` to environment
   - Note: User must have "teacher" role or modify validation

8. **Get Course**
   - Retrieves single course details
   - **Tests:** Verifies enrollment information is included

### Phase 3: Enrollment & GitHub Integration

9. **Enroll in Course**
   - Enrolls authenticated user in the course
   - **Auto-saves:** `ENROLLMENT_ID` to environment
   - ✅ **Critical:** This ID is used for all GitHub/CodeRabbit tests

10. **List My Enrollments**
    - Shows user's enrollments
    - Verify the new enrollment appears

11. **Get Enrollment Details**
    - Shows detailed enrollment info
    - Should show GitHub fields as null initially

12. **Assign GitHub Repository**
    - **⭐ KEY FEATURE:** Links GitHub repo to enrollment
    - Updates `github_repository_url` and `github_repository_name`
    - Verify response shows updated GitHub fields

13. **Update Enrollment Status**
    - Changes status to "active", "completed", etc.
    - Test different status values

### Phase 4: CodeRabbit Integration Testing

14. **Trigger Code Analysis** (Method 1)
    - **⭐ KEY FEATURE:** Triggers CodeRabbit analysis for the enrollment
    - Requires GitHub repository to be assigned first
    - Tests the main CodeRabbit integration endpoint

15. **Manual Trigger Analysis** (Method 2)
    - Alternative endpoint for triggering analysis
    - Uses different route structure
    - Good for testing different approaches

16. **Update Code Analysis Results (Manual)**
    - **⭐ TESTING FEATURE:** Manually sets analysis results
    - Uses comprehensive test data with issues, metrics, and scores
    - Simulates what CodeRabbit webhook would do
    - Verify quality score calculation

17. **CodeRabbit Webhook (Simulate)**
    - **⭐ KEY FEATURE:** Simulates CodeRabbit sending analysis results
    - Tests webhook endpoint security and processing
    - Includes realistic analysis data structure
    - Note: Signature validation may be disabled for testing

### Phase 5: Verification

18. **Get Updated Enrollment (After Analysis)**
    - **⭐ VERIFICATION:** Check that analysis data was stored
    - Should show:
      - `code_analysis_data` with issues and metrics
      - `code_quality_score` calculated value
      - `last_analysis_at` timestamp
      - GitHub repository information

19. **List Programming Languages**
    - Utility endpoint for reference data
    - Useful for creating courses

20. **Complete Enrollment**
    - Sets enrollment status to "completed"
    - Final workflow step

## Key Testing Scenarios

### 🎯 Happy Path Test
1. Register → Login → Create Course → Enroll → Assign GitHub → Trigger Analysis → Verify Results

### 🔍 Error Scenarios to Test

**Authentication Errors:**
- Try accessing protected endpoints without token
- Use invalid/expired token

**GitHub Assignment Errors:**
- Try to assign repository to someone else's enrollment
- Use invalid GitHub URL format
- Missing required fields

**CodeRabbit Analysis Errors:**
- Trigger analysis without GitHub repository assigned
- Invalid enrollment ID
- Malformed webhook data

**Authorization Errors:**
- Try to access other users' enrollments
- Cross-user data access attempts

## Expected Data Flow

```
1. User enrolls in course
   ↓
2. User assigns GitHub repository URL
   ↓  
3. System triggers CodeRabbit analysis
   ↓
4. CodeRabbit analyzes repository
   ↓
5. CodeRabbit sends results via webhook
   ↓
6. System stores analysis data and calculates quality score
   ↓
7. Student/Teacher can view code quality metrics
```

## Important Test Data

### Sample GitHub URLs (for testing)
- `https://github.com/student/javascript-fundamentals-project`
- `https://github.com/username/react-todo-app`
- `https://github.com/developer/node-api-project`

### Expected Quality Scores
- High quality (few issues): 85-100
- Medium quality (some issues): 60-85  
- Low quality (many issues): 0-60

### Analysis Data Structure
The system stores comprehensive analysis data including:
- **Issues:** bugs, security vulnerabilities, code smells
- **Metrics:** lines of code, complexity, test coverage
- **Scores:** maintainability index, technical debt ratio
- **Summary:** issue counts by severity

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check AUTH_TOKEN is set in environment
   - Re-run login request if token expired

2. **422 Validation Error** 
   - Check required fields in request body
   - Verify data types match API expectations

3. **403 Forbidden**
   - User trying to access resources they don't own
   - Check user permissions/roles

4. **404 Not Found**
   - Invalid ID in URL path
   - Check environment variables are set correctly

5. **500 Server Error**
   - Check Laravel logs: `tail -f storage/logs/laravel.log`
   - Database connection issues
   - Missing configuration

### Debug Steps

1. **Check Environment Variables:**
   - Verify all auto-saved IDs (USER_ID, COURSE_ID, ENROLLMENT_ID)
   - Confirm BASE_URL points to running server

2. **Verify Database:**
   - Check enrollments table has GitHub fields
   - Confirm migrations ran successfully
   - Verify foreign key relationships

3. **Test Individual Components:**
   - Start with authentication
   - Test each feature incrementally
   - Don't skip to advanced features without basics working

## Success Criteria

✅ **Complete Success:** All requests return expected status codes and data
✅ **GitHub Integration:** Repository successfully assigned and stored
✅ **CodeRabbit Simulation:** Analysis data properly processed and quality score calculated
✅ **Data Persistence:** All data retrievable in subsequent requests

This comprehensive test suite validates the entire GitHub + CodeRabbit integration workflow!
