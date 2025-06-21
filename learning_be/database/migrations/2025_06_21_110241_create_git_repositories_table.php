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
        Schema::create('git_repositories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('repository_name');
            $table->string('repository_url')->nullable();
            $table->string('github_repo_id')->nullable(); // GitHub API repository ID
            $table->boolean('is_private')->default(true);
            $table->enum('status', ['pending', 'active', 'archived'])->default('pending');
            $table->timestamp('created_at_github')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']); // One repo per user per course
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('git_repositories');
    }
};
