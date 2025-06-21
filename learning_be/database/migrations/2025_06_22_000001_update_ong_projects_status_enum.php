<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ong_projects', function (Blueprint $table) {
            $table->enum('status', ['open', 'closed'])->default('open')->change();
        });
    }

    public function down(): void
    {
        Schema::table('ong_projects', function (Blueprint $table) {
            $table->enum('status', ['open', 'in_progress', 'closed', 'completed'])->default('open')->change();
        });
    }
};
