<script setup>
import { Head } from '@inertiajs/vue3'

const props = defineProps({
    email: String,
})
</script>

<template>
    <Head title="Comprova el teu correu — La Cabra d'Or 2026" />

    <div class="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4">
        <div class="w-full max-w-md text-center">

            <!-- Animated envelope -->
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#b85042]/10 text-4xl mb-6 animate-bounce-slow">
                ✉️
            </div>

            <h1 class="font-serif text-3xl text-[#2c1810] mb-3">Comprova el teu correu</h1>

            <p class="text-[#5c4a3a] leading-relaxed mb-2">
                Si existeix un compte associat a
            </p>
            <p class="font-semibold text-[#b85042] text-lg mb-4 break-all">{{ email }}</p>
            <p class="text-[#5c4a3a] leading-relaxed mb-8">
                t'haurem enviat un <strong>enllaç d'accés</strong>.<br>
                Revisa també la carpeta de correu brossa.
            </p>

            <!-- Info box -->
            <div class="bg-white border border-[#e7ddd5] rounded-2xl p-5 text-sm text-left text-[#5c4a3a] mb-8 shadow-sm">
                <p class="font-semibold mb-2 text-[#2c1810]">⏱ L'enllaç és vàlid durant 1 hora.</p>
                <p>Si no l'has rebut passats uns minuts, pots</p>
                <a :href="route('magic-link.form')" class="text-[#b85042] hover:underline font-medium">
                    tornar a demanar-ne un de nou →
                </a>
            </div>

            <a
                :href="route('formulari')"
                class="text-xs text-[#c5b5a5] hover:text-[#b85042] transition-colors"
            >
                ← Tornar al formulari d'inscripció
            </a>
        </div>
    </div>
</template>

<style scoped>
@keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}
.animate-bounce-slow {
    animation: bounce-slow 2.5s ease-in-out infinite;
}
</style>
