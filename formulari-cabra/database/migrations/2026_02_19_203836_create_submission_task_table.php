<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_task', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('task_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['submission_id', 'task_id']);
            $table->index('task_id'); // Fast capacity count queries
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_task');
    }
};
