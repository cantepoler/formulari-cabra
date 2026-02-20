<?php

use App\Http\Controllers\MagicLinkController;
use App\Http\Controllers\SubmissionController;
use Illuminate\Support\Facades\Route;

// Pàgina principal
Route::get('/', fn () => redirect()->route('formulari'));

// Formulari de registre (no requereix auth)
Route::get('/formulari', [SubmissionController::class, 'create'])
    ->name('formulari');

Route::post('/formulari', [SubmissionController::class, 'store'])
    ->name('formulari.store');

// Magic Link
Route::get('/accedir', [MagicLinkController::class, 'showForm'])
    ->name('magic-link.form');

Route::post('/accedir', [MagicLinkController::class, 'send'])
    ->name('magic-link.send');

Route::get('/accedir/{token}', [MagicLinkController::class, 'verify'])
    ->name('magic-link.verify')
    ->middleware('signed'); // Laravel signed URL validation

// Àrea privada (requereix magic link verificat)
Route::middleware('submission.session')->group(function () {
    Route::get('/la-meva-inscripcio', [SubmissionController::class, 'show'])
        ->name('submission.show');

    Route::patch('/la-meva-inscripcio', [SubmissionController::class, 'update'])
        ->name('submission.update');
});
