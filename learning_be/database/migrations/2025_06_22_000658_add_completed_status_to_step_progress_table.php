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
        // First drop the existing enum constraint
        DB::statement("ALTER TABLE step_progress MODIFY COLUMN status ENUM('hidden', 'in_progress', 'solved', 'completed') DEFAULT 'hidden'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE step_progress MODIFY COLUMN status ENUM('hidden', 'in_progress', 'solved') DEFAULT 'hidden'");
    }
};
