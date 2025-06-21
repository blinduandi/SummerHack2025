<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgrammingLanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['name' => 'JavaScript', 'slug' => 'javascript', 'file_extension' => 'js', 'color_hex' => '#F7DF1E'],
            ['name' => 'Python', 'slug' => 'python', 'file_extension' => 'py', 'color_hex' => '#3776AB'],
            ['name' => 'Java', 'slug' => 'java', 'file_extension' => 'java', 'color_hex' => '#ED8B00'],
            ['name' => 'PHP', 'slug' => 'php', 'file_extension' => 'php', 'color_hex' => '#777BB4'],
            ['name' => 'C++', 'slug' => 'cpp', 'file_extension' => 'cpp', 'color_hex' => '#00599C'],
            ['name' => 'C#', 'slug' => 'csharp', 'file_extension' => 'cs', 'color_hex' => '#239120'],
            ['name' => 'Go', 'slug' => 'go', 'file_extension' => 'go', 'color_hex' => '#00ADD8'],
            ['name' => 'Rust', 'slug' => 'rust', 'file_extension' => 'rs', 'color_hex' => '#000000'],
            ['name' => 'TypeScript', 'slug' => 'typescript', 'file_extension' => 'ts', 'color_hex' => '#3178C6'],
            ['name' => 'Ruby', 'slug' => 'ruby', 'file_extension' => 'rb', 'color_hex' => '#CC342D'],
        ];

        foreach ($languages as $language) {
            DB::table('programming_languages')->updateOrInsert(
                ['slug' => $language['slug']],
                array_merge($language, [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
