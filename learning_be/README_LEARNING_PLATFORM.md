# Learning Platform Backend

A comprehensive Laravel API backend for a learning platform supporting students and teachers with courses, progress tracking, AI chat assistance, and recommendations.

## Features

- **Authentication System**: Student/Teacher registration and login with Laravel Sanctum
- **Program & Course Management**: Hierarchical learning with Programs → Courses → Steps
- **Enrollment System**: Course enrollment with status tracking
- **Progress Tracking**: Granular progress tracking at course and step levels
- **AI Chat Assistant**: OpenAI-powered chat bot for learning assistance
- **Course Recommendations**: AI-powered course suggestions
- **Rich Content Support**: HTML content support for course materials

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Configure your database in `.env`
6. Set up your OpenAI API key in `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   ```
7. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
8. Start the development server:
   ```bash
   php artisan serve
   ```

## OpenAI Integration

The chat system uses OpenAI's GPT-3.5-turbo model (cheapest option) to provide intelligent tutoring assistance.

### Setting up OpenAI

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

### Testing OpenAI Integration

Test the OpenAI integration with:
```bash
php artisan test:openai "How do I learn JavaScript variables?"
```

### Cost Optimization

The integration is configured for cost efficiency:
- Uses `gpt-3.5-turbo` (cheapest model)
- Limited to 500 max tokens per response
- Includes fallback to rule-based responses if OpenAI fails
- Context-aware prompts for better responses with fewer tokens

### Chat Features

- **General Chat**: `POST /api/chat` - General programming help
- **Course-Specific Chat**: `POST /api/chat/course/{id}` - Context-aware help for specific courses
- **Error Debugging**: Understands code snippets and error messages
- **Step-Specific Help**: Provides guidance based on current course step
- **Fallback System**: Graceful degradation to rule-based responses

## API Documentation

Complete API documentation is available in `API_DOCUMENTATION.md`.

## Testing

Use the provided Postman collection (`postman_collection.json`) with the environment file (`postman_environment.json`). See `TESTING_GUIDE.md` for detailed testing instructions.

Run the test suite:
```bash
php artisan test
```

## Database Schema

The platform uses a comprehensive schema supporting:
- Users (students/teachers)
- Programming languages
- Programs and courses
- Course steps with rich content
- Enrollments and progress tracking
- Chat messages with AI responses
- Course recommendations

## Security

- API authentication with Laravel Sanctum
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file uploads and content handling

## Performance

- Database query optimization with eager loading
- Caching for frequently accessed data
- Pagination for large datasets
- Background job processing for heavy operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
