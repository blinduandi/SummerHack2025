<?php

namespace Tests\Feature;

use App\Models\OngProject;
use App\Models\OngProjectMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OngProjectMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_ong_project_message_relationships()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $project = OngProject::factory()->create(['ong_id' => $user1->id]);
        $message = OngProjectMessage::create([
            'project_id' => $project->id,
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Hello, developer!',
        ]);

        $this->assertEquals($project->id, $message->project->id);
        $this->assertEquals($user1->id, $message->sender->id);
        $this->assertEquals($user2->id, $message->receiver->id);
    }
}
