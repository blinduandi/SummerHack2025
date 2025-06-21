<?php

namespace Database\Factories;

use App\Models\OngProjectMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

class OngProjectMessageFactory extends Factory
{
    protected $model = OngProjectMessage::class;

    public function definition(): array
    {
        return [
            'project_id' => 1,
            'sender_id' => 1,
            'receiver_id' => 2,
            'message' => $this->faker->sentence,
        ];
    }
}
