# Learning Platform

## For Mentors: Project Overview

This is a comprehensive learning platform that connects students with courses and NGOs with volunteers. The project consists of two main components: a Laravel backend API and a React frontend application.

### Key Features:
- **User Roles**: Students, NGOs, and Admins with role-based access control
- **Course Management**: Students can browse, enroll in courses, and track their progress
- **NGO Projects**: NGOs can create and manage volunteer projects; students can apply
- **Authentication**: Secure JWT-based authentication system
- **Modern Tech Stack**: Laravel 10 backend with React 18 TypeScript frontend

## Project Structure

This repository contains two main directories:

### Backend (Laravel API)
📁 **[learning_be/](learning_be/README.md)** - Laravel backend with RESTful API
- Complete setup and deployment instructions
- API documentation and testing with Postman
- Database structure and migrations

### Frontend (React App)
📁 **[learning_fe/](learning_fe/README.md)** - React TypeScript frontend
- Modern React application with Material-UI
- User dashboards for different roles
- Responsive design and professional UI

## Documentation

For detailed information about specific aspects of the project:

- **[Backend Documentation](learning_be/README.md)** - Laravel setup, API endpoints, database
- **[Frontend Documentation](learning_fe/README.md)** - React setup, components, architecture
- **[GitHub Integration](learning_be/GITHUB_INTEGRATION_README.md)** - Advanced GitHub repository integration
- **[API Documentation](learning_be/API_DOCUMENTATION.md)** - Complete API reference
- **[Database Structure](learning_be/database_structure.md)** - Database schema and relationships

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Proiect invatare"
   ```

2. **Set up the backend:**
   ```bash
   cd learning_be
   # Follow instructions in learning_be/README.md
   ```

3. **Set up the frontend:**
   ```bash
   cd learning_fe
   # Follow instructions in learning_fe/README.md
   ```

## API Testing

The backend includes a comprehensive Postman collection for API testing. You can find it at:
- **Collection**: `learning_be/postman/Laravel_Learning_Platform_CodeRabbit.postman_collection.json`
- **Environment**: `learning_be/postman/Laravel_Learning_Platform_Local.postman_environment.json`

## Technology Stack

### Backend
- **Laravel 10** - PHP framework for robust API development
- **MySQL** - Database for data persistence
- **JWT Authentication** - Secure token-based authentication
- **Laravel Sanctum** - API token authentication

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Professional component library
- **Vite** - Fast build tool and development server
- **Zustand** - Lightweight state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
