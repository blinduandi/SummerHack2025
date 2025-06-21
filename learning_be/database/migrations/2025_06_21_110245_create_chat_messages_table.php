<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('cascade');
            $table->enum('sender_type', ['user', 'bot'])->default('user');
            $table->text('message');
            $table->json('context_data')->nullable(); // Store conversation context, code snippets, etc.
            $table->boolean('is_helpful')->nullable(); // User feedback on bot responses
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'course_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
