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
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('surname');
            $table->datetime('birthdate');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('responsible')->nullable();

            $table->boolean('dinner_attending')->default(false);

            // Dades Xifrades, al·lèrgens ...
            $table->text('dinner_nodtes')->nullable();
            $table->string('dinner_qr_token')->nullable();

            // Altres dades dinàmiques (se'n podrien afegir)
            $table->jsonb('form_answers')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};
