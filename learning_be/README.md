<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

# Learning Platform - Backend

## For Mentors: Project Description

This project is the backend for a learning platform designed to connect students with courses and NGOs with volunteers. The frontend is a separate React application which you can find in the `learning_fe` folder. The platform has the following key features:

- **User Roles**: Students, NGOs, and Admins.
- **Course Management**: Students can enroll in courses, view course materials, and track their progress.
- **ONG Projects**: NGOs can create and manage projects, and students can apply to volunteer for these projects.
- **API**: A comprehensive RESTful API for all platform functionalities.

This README provides instructions for setting up and running the backend. For more specific documentation, please refer to the following files:

- [Frontend Documentation](../learning_fe/README.md)
- [GITHUB_INTEGRATION_README.md](GITHUB_INTEGRATION_README.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [DATABASE_STRUCTURE.md](database_structure.md)

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/learning_be.git
    cd learning_be
    ```

2.  **Install dependencies:**
    ```bash
    composer install
    ```

3.  **Create the environment file:**
    ```bash
    cp .env.example .env
    ```

4.  **Generate the application key:**
    ```bash
    php artisan key:generate
    ```

5.  **Configure your `.env` file** with your database credentials and other settings.

6.  **Run database migrations:**
    ```bash
    php artisan migrate
    ```

7.  **Seed the database (optional):**
    ```bash
    php artisan db:seed
    ```

8.  **Start the development server:**
    ```bash
    php artisan serve
    ```

## API Testing with Postman

A Postman collection is included to facilitate API testing. You can find it at `postman/Laravel_Learning_Platform_CodeRabbit.postman_collection.json`.

To use it, import the collection into Postman and set up the environment using `postman/Laravel_Learning_Platform_Local.postman_environment.json`.

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
