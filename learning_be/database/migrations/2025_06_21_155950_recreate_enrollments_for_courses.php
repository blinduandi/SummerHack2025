<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all existing enrollment data before recreating the table
        $enrollments = DB::table('enrollments')->get();

        // Drop the table and recreate it with the new structure
        Schema::dropIfExists('enrollments');

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->enum('status', ['active', 'completed', 'dropped', 'paused'])->default('active');
            $table->string('github_repository_url')->nullable();
            $table->string('github_repository_name')->nullable();
            $table->json('code_analysis_data')->nullable();
            $table->decimal('code_quality_score', 5, 2)->nullable();
            $table->timestamp('last_analysis_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']); // Prevent duplicate enrollments
        });

        // Note: Data migration would need to be handled separately
        // as we're changing from program_id to course_id relationship
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the original table structure
        Schema::dropIfExists('enrollments');

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->enum('status', ['active', 'completed', 'dropped', 'paused'])->default('active');
            $table->timestamps();

            $table->unique(['user_id', 'program_id']); // Prevent duplicate enrollments
        });
    }
};
