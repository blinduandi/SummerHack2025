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
        Schema::create('course_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content'); // HTML content including videos, images, commands, information
            $table->integer('step_order')->default(0); // Order within the course
            $table->string('step_type')->default('lesson');
            $table->boolean('is_required')->default(true); // Whether step is mandatory for course completion
            $table->json('metadata')->nullable(); // Additional data like video duration, difficulty, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['course_id', 'step_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_steps');
    }
};
