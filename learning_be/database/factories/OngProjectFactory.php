<?php

namespace Database\Factories;

use App\Models\OngProject;
use Illuminate\Database\Eloquent\Factories\Factory;

class OngProjectFactory extends Factory
{
    protected $model = OngProject::class;

    public function definition(): array
    {
        return [
            'ong_id' => 1,
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'requirements' => $this->faker->sentence,
            'skills_needed' => ['php', 'laravel'],
            'due_date' => now()->addMonth(),
            'status' => 'open',
        ];
    }
}
