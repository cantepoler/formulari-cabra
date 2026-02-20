<script setup>
/**
 * Generic role step — used for Organització, Teatre, Danses and Col·laboradors.
 * Each commission fills in their own questions here.
 * Extend this component per role as requirements are confirmed.
 */
import { inject, computed } from 'vue'

const props = defineProps({
    stepKey: String, // e.g. 'organitzacio', 'danses', 'teatre', 'collaboradors'
})

const form = inject('wizardForm')

const answers = computed({
    get: () => form.form_answers[props.stepKey] || {},
    set: (val) => { form.form_answers = { ...form.form_answers, [props.stepKey]: val } },
})

const setAnswer = (key, value) => {
    answers.value = { ...answers.value, [key]: value }
}

// ── Role-specific field definitions ──────────────────────────────────────

const roleConfig = {
    organitzacio: {
        icon: '🏛️',
        intro: 'Preguntes per als membres de les comissions organitzatives.',
        fields: [
            {
                key: 'commission',
                label: 'De quina comissió formes part?',
                type: 'select',
                options: ['Taverna', 'Decoració', 'Logística', 'Comunicació', 'Poble', 'Altra'],
            },
        ],
    },
    danses: {
        icon: '💃',
        intro: 'Preguntes per als participants en les danses tradicionals.',
        fields: [
            {
                key: 'dance_style',
                label: 'Quin ball fas?',
                type: 'select',
                options: ['Ball de bastons', 'Ball de gitanes', 'Sardanes', 'Altre'],
            },
            {
                key: 't_shirt_size',
                label: 'Talla de samarreta',
                type: 'select',
                options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            },
        ],
    },
    teatre: {
        icon: '🎭',
        intro: 'Preguntes per als participants en les activitats de teatre.',
        fields: [], // TBD by committee
    },
    collaboradors: {
        icon: '🤝',
        intro: 'Preguntes per a pares i col·laboradors sense rol d\'organització.',
        fields: [], // TBD by committee
    },
}

const config = computed(() => roleConfig[props.stepKey] || { icon: '❓', intro: '', fields: [] })
</script>

<template>
    <div class="space-y-6">

        <!-- Intro -->
        <div class="bg-[#b85042]/8 border border-[#b85042]/20 rounded-xl p-5 text-sm text-[#5c4a3a] leading-relaxed">
            <p class="font-semibold text-[#2c1810] mb-1">{{ config.icon }} {{ stepKey }}</p>
            <p>{{ config.intro }}</p>
        </div>

        <!-- Generated fields -->
        <div v-if="config.fields.length > 0" class="space-y-5">
            <div v-for="field in config.fields" :key="field.key">
                <label class="field-label">{{ field.label }}</label>

                <!-- Select -->
                <div v-if="field.type === 'select'" class="flex flex-wrap gap-2">
                    <button
                        v-for="opt in field.options"
                        :key="opt"
                        type="button"
                        @click="setAnswer(field.key, opt)"
                        class="px-4 py-2 rounded-xl border-2 text-sm transition-all duration-200"
                        :class="answers[field.key] === opt
              ? 'border-[#b85042] bg-[#b85042] text-white shadow-sm'
              : 'border-[#e7ddd5] text-[#5c4a3a] hover:border-[#b85042] hover:text-[#b85042]'"
                    >
                        {{ opt }}
                    </button>
                </div>

                <!-- Text -->
                <input
                    v-else-if="field.type === 'text'"
                    :value="answers[field.key] || ''"
                    @input="setAnswer(field.key, $event.target.value)"
                    type="text"
                    class="field-input"
                />

            </div>
        </div>

        <!-- TBD placeholder -->
        <div v-else class="text-center py-10 text-[#c5b5a5]">
            <p class="text-3xl mb-3">🚧</p>
            <p class="text-sm">Les preguntes específiques d'aquest rol s'afegiran properament.</p>
        </div>

        <!-- Open notes — always present -->
        <div>
            <label class="field-label">Vols afegir alguna cosa?</label>
            <textarea
                :value="answers.notes || ''"
                @input="setAnswer('notes', $event.target.value)"
                rows="3"
                placeholder="Comentaris, observacions..."
                class="field-input resize-none"
            />
        </div>

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
</style>
