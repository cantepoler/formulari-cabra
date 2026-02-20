<script setup>
import { inject } from 'vue'

const form = inject('wizardForm')
</script>

<template>
    <div class="space-y-6">

        <!-- Info -->
        <div class="bg-[#b85042]/8 border border-[#b85042]/20 rounded-xl p-5 text-sm text-[#5c4a3a] leading-relaxed">
            <p class="font-semibold text-[#2c1810] mb-1">🍽️ Sopar de la Cabra d'Or</p>
            <p>
                Tots els participants i col·laboradors teniu dret a un sopar gratuït.
                Si vindreu a sopar, us enviarem un <strong>codi QR</strong> personalitzat
                com a tiquet una setmana abans de la festa.
            </p>
        </div>

        <!-- Will you attend dinner? -->
        <div>
            <label class="field-label">Vindràs a sopar? *</label>
            <div class="flex gap-3">
                <button
                    type="button"
                    @click="form.attending_dinner = true"
                    class="flex-1 py-4 rounded-xl border-2 text-center font-medium text-sm transition-all duration-200"
                    :class="form.attending_dinner === true
            ? 'border-[#2c7a3a] bg-[#2c7a3a]/5 text-[#2c7a3a]'
            : 'border-[#e7ddd5] text-[#5c4a3a] hover:border-[#2c7a3a]/40'"
                >
                    ✓ Sí, hi seré!
                </button>
                <button
                    type="button"
                    @click="form.attending_dinner = false; form.dinner_notes = ''"
                    class="flex-1 py-4 rounded-xl border-2 text-center font-medium text-sm transition-all duration-200"
                    :class="form.attending_dinner === false
            ? 'border-[#b85042] bg-[#b85042]/5 text-[#b85042]'
            : 'border-[#e7ddd5] text-[#5c4a3a] hover:border-[#b85042]/40'"
                >
                    ✗ No podré venir
                </button>
            </div>
        </div>

        <!-- Allergies (only if attending) -->
        <Transition name="slide-down">
            <div v-if="form.attending_dinner === true" class="space-y-4">
                <div>
                    <label class="field-label">Al·lèrgies o preferències alimentàries</label>
                    <p class="text-xs text-[#a0896e] mb-3">
                        Aquesta informació s'emmagatzema de manera <strong>xifrada</strong> i
                        només l'accedeix l'organització per gestionar el sopar.
                    </p>

                    <!-- Quick options -->
                    <div class="flex flex-wrap gap-2 mb-3">
                        <button
                            v-for="opt in ['Celíac', 'Vegetarià/vegà', 'Al·lèrgia als fruits secs', 'Al·lèrgia al marisc']"
                            :key="opt"
                            type="button"
                            @click="form.dinner_notes = form.dinner_notes
                ? (form.dinner_notes.includes(opt) ? form.dinner_notes.replace(opt + ', ', '').replace(', ' + opt, '').replace(opt, '').trim() : form.dinner_notes + (form.dinner_notes ? ', ' : '') + opt)
                : opt"
                            class="px-3 py-1.5 rounded-full border text-xs transition-all duration-200"
                            :class="form.dinner_notes?.includes(opt)
                ? 'border-[#b85042] bg-[#b85042] text-white'
                : 'border-[#e7ddd5] text-[#5c4a3a] hover:border-[#b85042]'"
                        >
                            {{ opt }}
                        </button>
                    </div>

                    <!-- Free text -->
                    <textarea
                        v-model="form.dinner_notes"
                        rows="3"
                        placeholder="Altres al·lèrgies, intoleràncies o preferències..."
                        class="field-input resize-none"
                    />
                </div>

                <!-- QR info -->
                <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <span class="text-2xl">📱</span>
                    <div class="text-sm text-amber-900">
                        <p class="font-semibold mb-1">Tiquet QR</p>
                        <p>Rebràs un codi QR personalitzat per correu electrònic
                            aproximadament una setmana abans de la festa.
                            Porta'l al sopar per recollir el teu menjar.</p>
                    </div>
                </div>
            </div>
        </Transition>

    </div>
</template>

<style scoped>
.field-label {
    @apply block text-xs font-semibold uppercase tracking-widest text-[#a0896e] mb-2;
}
.field-input {
    @apply w-full px-4 py-3 rounded-xl border border-[#e7ddd5] bg-[#faf7f2]
    text-[#2c1810] placeholder-[#c5b5a5] text-sm
    focus:outline-none focus:ring-2 focus:ring-[#b85042]/30 focus:border-[#b85042]
    transition-all duration-200;
}
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 600px; }
</style>
