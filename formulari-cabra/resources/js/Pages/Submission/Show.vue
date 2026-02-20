<script setup>
import { Head } from '@inertiajs/vue3'

const props = defineProps({
    submission: Object,
})
</script>

<template>
    <Head title="La meva inscripció — La Cabra d'Or 2026" />

    <div class="min-h-screen bg-[#faf7f2]">

        <!-- Header -->
        <header class="bg-[#b85042] text-white px-4 py-4 shadow-md">
            <div class="max-w-2xl mx-auto flex items-center gap-3">
                <span class="text-2xl">🐐</span>
                <div>
                    <h1 class="font-serif text-lg leading-tight">La Cabra d'Or 2026</h1>
                    <p class="text-white/70 text-xs">La meva inscripció</p>
                </div>
            </div>
        </header>

        <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">

            <!-- Welcome -->
            <div class="bg-white border border-[#e7ddd5] rounded-2xl p-6 shadow-sm">
                <h2 class="font-serif text-2xl text-[#2c1810] mb-1">
                    Hola, {{ submission.full_name }}! 👋
                </h2>
                <p class="text-[#a0896e] text-sm">
                    Codi d'accés:
                    <span class="font-mono font-bold text-[#b85042]">{{ submission.access_code }}</span>
                </p>
            </div>

            <!-- Roles -->
            <div class="bg-white border border-[#e7ddd5] rounded-2xl p-6 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-widest text-[#a0896e] mb-3">Rols</h3>
                <div class="flex flex-wrap gap-2">
          <span
              v-for="role in submission.roles"
              :key="role"
              class="px-3 py-1.5 bg-[#b85042]/10 text-[#b85042] rounded-full text-sm font-medium"
          >
            {{ role }}
          </span>
                </div>
            </div>

            <!-- Tasks -->
            <div class="bg-white border border-[#e7ddd5] rounded-2xl p-6 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-widest text-[#a0896e] mb-3">
                    Tasques seleccionades
                </h3>
                <div v-if="submission.tasks.length > 0" class="space-y-2">
                    <div
                        v-for="task in submission.tasks"
                        :key="task.title"
                        class="flex items-start gap-3 p-3 bg-[#faf7f2] rounded-xl"
                    >
                        <span class="text-[#b85042] mt-0.5">✓</span>
                        <div>
                            <p class="text-sm font-medium text-[#2c1810]">{{ task.title }}</p>
                            <p class="text-xs text-[#a0896e]">
                                {{ task.start_time }}–{{ task.end_time }}
                                <span v-if="task.location"> · 📍 {{ task.location }}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <p v-else class="text-sm text-[#a0896e]">Cap tasca seleccionada.</p>
            </div>

            <!-- Dinner -->
            <div class="bg-white border border-[#e7ddd5] rounded-2xl p-6 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-widest text-[#a0896e] mb-3">Sopar</h3>
                <div v-if="submission.attending_dinner">
                    <p class="text-sm text-[#2c1810] mb-1">✅ Vindràs a sopar</p>
                    <p v-if="submission.qr_token" class="text-xs text-[#a0896e]">
                        🎟️ El teu tiquet QR s'enviarà per correu una setmana abans de la festa.
                    </p>
                </div>
                <p v-else class="text-sm text-[#a0896e]">No has confirmat sopar.</p>
            </div>

        </div>
    </div>
</template>
