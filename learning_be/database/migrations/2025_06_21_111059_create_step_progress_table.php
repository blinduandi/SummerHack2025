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
        Schema::create('step_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_step_id')->constrained('course_steps')->onDelete('cascade');
            $table->enum('status', ['hidden', 'in_progress', 'solved'])->default('hidden');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->json('progress_data')->nullable(); // Store specific progress like answers, code, etc.
            $table->integer('attempts_count')->default(0); // Number of attempts for exercises/quizzes
            $table->decimal('score', 5, 2)->nullable(); // Score for quizzes/exercises (0.00 to 100.00)
            $table->text('notes')->nullable(); // User's personal notes for this step
            $table->timestamps();

            $table->unique(['user_id', 'course_step_id']); // One progress record per user per step
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('step_progress');
    }
};
