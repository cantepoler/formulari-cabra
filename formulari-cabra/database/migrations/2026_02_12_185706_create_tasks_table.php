<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');                        // "Muntatge plaça"
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->unsignedInteger('capacity');            // Max signups allowed
            $table->string('location')->nullable();         // "Plaça Major"
            $table->string('color')->nullable();            // Hex for the grid UI, e.g. "#F59E0B"

            // Which roles can see/sign up for this task.
            // NULL means visible to ALL roles.
            // e.g. ["banda-auria", "collaboradors"]
            $table->jsonb('visible_to_roles')->nullable();

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('start_time');
            $table->index('is_active');
        });

        DB::statement('CREATE INDEX tasks_visible_to_roles_gin ON tasks USING GIN (visible_to_roles)');
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
