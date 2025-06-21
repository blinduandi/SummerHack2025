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
            $table->string('github_repository_url')->nullable()->after('status');
            $table->string('github_repository_name')->nullable()->after('github_repository_url');
            $table->json('code_analysis_data')->nullable()->after('github_repository_name');
            $table->decimal('code_quality_score', 5, 2)->nullable()->after('code_analysis_data');
            $table->timestamp('last_analysis_at')->nullable()->after('code_quality_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn([
                'github_repository_url',
                'github_repository_name',
                'code_analysis_data',
                'code_quality_score',
                'last_analysis_at'
            ]);
        });
    }
};
