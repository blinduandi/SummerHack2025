<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ong_projects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ong_id');
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->json('skills_needed')->nullable();
            $table->dateTime('due_date');
            $table->enum('status', ['open', 'in_progress', 'closed', 'completed'])->default('open');
            $table->unsignedBigInteger('winner_user_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ong_projects');
    }
};
