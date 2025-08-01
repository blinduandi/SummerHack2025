<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ong_projects', function (Blueprint $table) {
            $table->dateTime('due_date')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ong_projects', function (Blueprint $table) {
            $table->dateTime('due_date')->nullable(false)->change();
        });
    }
};
