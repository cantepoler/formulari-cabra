<script setup>
import { useForm, Head } from '@inertiajs/vue3'

const form = useForm({
    email: '',
})

const submit = () => form.post(route('magic-link.send'))
</script>

<template>
    <Head title="Accedir — La Cabra d'Or 2026" />

    <div class="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4">

        <!-- Background texture -->
        <div class="fixed inset-0 bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none" />

        <!-- Card -->
        <div class="relative w-full max-w-md">

            <!-- Logo / Header -->
            <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b85042] text-3xl mb-4 shadow-lg">
                    🐐
                </div>
                <h1 class="font-serif text-3xl text-[#2c1810] tracking-tight">La Cabra d'Or</h1>
                <p class="text-[#a0896e] text-sm mt-1 font-light">Accedeix a la teva inscripció</p>
            </div>

            <!-- Form card -->
            <div class="bg-white rounded-2xl shadow-sm border border-[#e7ddd5] p-8">
                <p class="text-[#5c4a3a] text-sm leading-relaxed mb-6">
                    Introdueix el correu amb el qual et vas inscriure i t'enviarem
                    un <strong>enllaç d'accés</strong> vàlid durant 1 hora.
                </p>

                <form @submit.prevent="submit" class="space-y-4">
                    <div>
                        <label for="email" class="block text-xs font-semibold uppercase tracking-widest text-[#a0896e] mb-2">
                            Correu electrònic
                        </label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            autocomplete="email"
                            required
                            placeholder="nom@exemple.com"
                            class="w-full px-4 py-3 rounded-xl border border-[#e7ddd5] bg-[#faf7f2]
                     text-[#2c1810] placeholder-[#c5b5a5] text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#b85042]/30 focus:border-[#b85042]
                     transition-all duration-200"
                            :class="{ 'border-red-400 bg-red-50': form.errors.email }"
                        />
                        <p v-if="form.errors.email" class="text-red-500 text-xs mt-1">
                            {{ form.errors.email }}
                        </p>
                    </div>

                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="w-full py-3 bg-[#b85042] hover:bg-[#a0403a] text-white font-serif text-base
                   rounded-xl shadow-md hover:shadow-lg transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
            <span v-if="form.processing" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Enviant...
            </span>
                        <span v-else>Envia'm l'enllaç →</span>
                    </button>
                </form>
            </div>

            <!-- Footer link -->
            <p class="text-center text-xs text-[#c5b5a5] mt-6">
                Ets nou/nova?
                <a :href="route('formulari')" class="text-[#b85042] hover:underline font-medium">
                    Omple el formulari d'inscripció
                </a>
            </p>
        </div>
    </div>
</template>
