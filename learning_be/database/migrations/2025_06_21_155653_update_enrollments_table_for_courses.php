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
        Schema::table('enrollments', function (Blueprint $table) {
            // Drop unique constraint first
            $table->dropUnique(['user_id', 'program_id']);

            // Drop foreign key constraint (this was created by foreignId()->constrained())
            $table->dropForeign(['program_id']);

            // Drop program_id column

            // Add course_id column and foreign key
            $table->foreignId('course_id')->after('user_id')->constrained('courses')->onDelete('cascade');

            // Add new unique constraint with course_id
            $table->unique(['user_id', 'course_id']); // Prevent duplicate enrollments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            // Drop unique constraint and foreign key
            $table->dropUnique(['user_id', 'course_id']);
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');

            // Restore program_id with foreign key
            $table->unique(['user_id', 'program_id']); // Restore original unique constraint
        });
    }
};
