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
        Schema::table('courses', function (Blueprint $table) {
            // Remove program-related columns
            $table->dropForeign(['program_id']);
            $table->dropColumn(['program_id', 'order_in_program']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Add back program-related columns
            $table->unsignedBigInteger('program_id')->nullable();
            $table->integer('order_in_program')->default(0);

            $table->foreign('program_id')->references('id')->on('programs')->onDelete('set null');
        });
    }
};
