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
        Schema::table('course_steps', function (Blueprint $table) {
            $table->json('youtube_recommendations')->nullable()->after('metadata');
            $table->text('prerequisites')->nullable()->after('youtube_recommendations');
            $table->json('learning_objectives')->nullable()->after('prerequisites');
            $table->integer('estimated_time')->nullable()->after('learning_objectives');
            $table->string('difficulty')->nullable()->after('estimated_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_steps', function (Blueprint $table) {
            $table->dropColumn([
                'youtube_recommendations',
                'prerequisites',
                'learning_objectives',
                'estimated_time',
                'difficulty'
            ]);
        });
    }
};
