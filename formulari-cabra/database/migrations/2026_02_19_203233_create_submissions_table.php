<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();

            // Identitat
            $table->string('access_code')->unique(); // Magic link
            $table->string('email')->unique();
            $table->string('full_name');
            $table->date('birth_date');
            $table->string('phone')->nullable();

            // Contacte del major
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();

            // Sopar
            $table->boolean('attending_dinner')->default(false);
            // Encriptat: celiac...
            $table->text('dinner_notes')->nullable();

            // Respostes dinàmiques
            // Stores per-role questions: instrument, dance style, commission, etc.
            // Structure example:
            // {
            //   "banda_auria": {
            //     "instrument": "Clarinet Sib",
            //     "group": "banda",
            //     "moments": ["11/08-mati", "11/08-tarda"],
            //     "needs_sheet_music": "some",
            //     "notes": ""
            //   },
            //   "danses": {
            //     "dance_style": "Ball de bastons",
            //     "t_shirt_size": "M"
            //   },
            //   "organitzacio": {
            //     "commission": "Taverna"
            //   }
            // }
            $table->jsonb('form_answers')->default('{}');

            // QR
            $table->string('qr_token')->nullable()->unique(); // Used for dinner QR
            $table->timestamp('qr_sent_at')->nullable();       // When ticket was emailed
            $table->timestamp('magic_link_sent_at')->nullable();

            // Estat
            $table->enum('status', ['draft', 'submitted', 'confirmed'])
                ->default('draft');

            $table->timestamps();
            $table->softDeletes();

            // Indexs
            $table->index('status');
            $table->index('attending_dinner');
            // GIN index for jsonb querying (add via raw statement in seeder)
        });

        // GIN index — enables fast jsonb queries like ->where('form_answers->banda_auria->instrument', ...)
        DB::statement('CREATE INDEX submissions_form_answers_gin ON submissions USING GIN (form_answers)');
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
