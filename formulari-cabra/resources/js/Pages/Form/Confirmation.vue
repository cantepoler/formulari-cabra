<!-- resources/js/Pages/Form/Confirmation.vue -->
<script setup>
import { Head } from '@inertiajs/vue3'
</script>

<template>
    <Head title="Inscripció enviada — La Cabra d'Or 2026" />
    <div class="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4 text-center">
        <div class="w-full max-w-md">
            <div class="text-6xl mb-6 animate-bounce">🐐</div>
            <h1 class="font-serif text-3xl text-[#2c1810] mb-3">Gràcies!</h1>
            <p class="text-[#5c4a3a] leading-relaxed mb-6">
                La teva inscripció s'ha enviat correctament.<br>
                T'hem enviat un correu a l'adreça indicada amb un <strong>enllaç d'accés</strong>
                per consultar i modificar la teva inscripció en qualsevol moment.
            </p>
            <div class="bg-white border border-[#e7ddd5] rounded-2xl p-5 text-sm text-[#5c4a3a] shadow-sm">
                <p>🍽️ Si has confirmat sopar, rebràs el teu <strong>tiquet QR</strong> una setmana abans de la festa.</p>
            </div>
        </div>
    </div>
</template>
