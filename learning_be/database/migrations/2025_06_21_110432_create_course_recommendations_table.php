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
        Schema::create('course_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->decimal('recommendation_score', 5, 2)->default(0.00); // 0.00 to 100.00
            $table->enum('recommendation_type', ['skill_based', 'completion_based', 'interest_based', 'collaborative'])->default('skill_based');
            $table->json('recommendation_factors')->nullable(); // Store factors that led to recommendation
            $table->boolean('is_dismissed')->default(false);
            $table->timestamp('recommended_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']); // One recommendation per user per course
            $table->index(['user_id', 'recommendation_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_recommendations');
    }
};
