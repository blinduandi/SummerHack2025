<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ProgrammingLanguageSeeder::class,
            ComplexCourseSeeder::class,
            BasicCoursesSeeder::class,
            AdditionalCoursesSeeder::class,
            OngProjectSeeder::class,
        ]);

        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Test Teacher',
                'role' => 'teacher',
                'password' => bcrypt('password')
            ]
        );

        User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Test Student',
                'role' => 'student',
                'password' => bcrypt('password')
            ]
        );
    }
}
