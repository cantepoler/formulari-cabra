<script setup>
import { inject, computed } from 'vue'

const form = inject('wizardForm')

// Age computed for banda/contrabanda filter
const participantAge = computed(() => {
    if (!form.birth_date) return null
    const birth = new Date(form.birth_date)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear()
    const hadBirthday = (
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
    )
    return hadBirthday ? age : age - 1
})

// Banda: >=15, Contrabanda: <15
const canJoinBanda = computed(() => participantAge.value === null || participantAge.value >= 15)
const canJoinContrabanda = computed(() => participantAge.value === null || participantAge.value < 15)

// Auto-assign group based on age if only one option
const groupOptions = computed(() => {
    const opts = []
    if (canJoinBanda.value) opts.push({ value: 'banda', label: 'Banda Àuria', desc: '15 anys o més' })
    if (canJoinContrabanda.value) opts.push({ value: 'contrabanda', label: 'Contrabanda', desc: 'menys de 15 anys' })
    return opts
})

const answers = computed({
    get: () => form.form_answers.banda_auria || {},
    set: (val) => { form.form_answers = { ...form.form_answers, banda_auria: val } },
})

const setAnswer = (key, value) => {
    answers.value = { ...answers.value, [key]: value }
}

const toggleMoment = (moment) => {
    const current = answers.value.moments || []
    const idx = current.indexOf(moment)
    if (idx === -1) {
        setAnswer('moments', [...current, moment])
    } else {
        setAnswer('moments', current.filter(m => m !== moment))
    }
}

const instruments = [
    { group: 'Vent fusta', items: ['Flauta', 'Clarinet Sib', 'Tarota/Oboè', 'Saxo Alt', 'Saxo Tenor', 'Saxo Baríton'] },
    { group: 'Vent metall', items: ['Trompeta en Sib', 'Trompa en Fa', 'Trombó', 'Fiscorn', 'Tuba'] },
    { group: 'Percussió', items: ['Percussió', 'Pandero Quadrat'] },
]

const moments = [
    { key: '10/08-nit',          label: '10/08 (nit)',   desc: 'Baixada del Castell · Banda' },
    { key: '11/08-mati-contra',  label: '11/08 (matí)',  desc: 'Tallers + Passacarrers · Contrabanda' },
    { key: '11/08-tarda-banda',  label: '11/08 (tarda)', desc: 'Passacarrers + Teatre · Banda' },
    { key: '11/08-nit-balls',    label: '11/08 (nit)',   desc: 'Balls · Banda' },
    { key: '11/08-nit-tancada',  label: '11/08 (nit)',   desc: 'Tancada de la Cabra · Banda' },
]

const sheetMusicOptions = [
    { value: 'none',  label: 'No! Encara guardo les dels anys anteriors / Me les sé totes!' },
    { value: 'some',  label: 'Només les més noves…' },
    { value: 'all',   label: 'Sí! Totes' },
]
</script>

<template>
    <div class="space-y-8">

        <!-- Info box -->
        <div class="bg-[#b85042]/8 border border-[#b85042]/20 rounded-xl p-5 text-sm text-[#5c4a3a] leading-relaxed">
            <p class="font-semibold text-[#2c1810] mb-1">🎺 Banda Àuria</p>
            <p>Completa les dades relacionades amb la teva participació musical a la festa.</p>
        </div>

        <!-- Banda / Contrabanda -->
        <div>
            <label class="field-label">Banda o Contrabanda *</label>
            <div v-if="groupOptions.length === 1" class="text-sm text-[#5c4a3a] bg-amber-50 border border-amber-200 rounded-xl p-4">
                ℹ️ Basant-nos en la teva data de naixement, t'assignem automàticament a la
                <strong>{{ groupOptions[0].label }}</strong> ({{ groupOptions[0].desc }}).
            </div>
            <div v-else class="flex gap-3">
                <button
                    v-for="opt in groupOptions"
                    :key="opt.value"
                    type="button"
                    @click="setAnswer('group', opt.value)"
                    class="flex-1 p-4 rounded-xl border-2 text-left transition-all duration-200"
                    :class="answers.group === opt.value
            ? 'border-[#b85042] bg-[#b85042]/5'
            : 'border-[#e7ddd5] hover:border-[#b85042]/40'"
                >
                    <p class="font-medium text-[#2c1810] text-sm">{{ opt.label }}</p>
                    <p class="text-[#a0896e] text-xs mt-0.5">{{ opt.desc }}</p>
                </button>
            </div>
        </div>

        <!-- Instrument -->
        <div>
            <label class="field-label">Instrument *</label>
            <div class="space-y-3">
                <div v-for="group in instruments" :key="group.group">
                    <p class="text-xs text-[#a0896e] uppercase tracking-wider mb-2">{{ group.group }}</p>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="instrument in group.items"
                            :key="instrument"
                            type="button"
                            @click="setAnswer('instrument', instrument)"
                            class="px-3 py-2 rounded-lg border text-sm transition-all duration-200"
                            :class="answers.instrument === instrument
                ? 'border-[#b85042] bg-[#b85042] text-white shadow-sm'
                : 'border-[#e7ddd5] text-[#5c4a3a] hover:border-[#b85042] hover:text-[#b85042]'"
                        >
                            {{ instrument }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Moments -->
        <div>
            <label class="field-label">En quins moments tocaràs? *</label>
            <div class="space-y-2">
                <button
                    v-for="moment in moments"
                    :key="moment.key"
                    type="button"
                    @click="toggleMoment(moment.key)"
                    class="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200"
                    :class="(answers.moments || []).includes(moment.key)
            ? 'border-[#b85042] bg-[#b85042]/5'
            : 'border-[#e7ddd5] hover:border-[#b85042]/40'"
                >
          <span
              class="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
              :class="(answers.moments || []).includes(moment.key)
              ? 'border-[#b85042] bg-[#b85042]'
              : 'border-[#c5b5a5]'"
          >
            <svg v-if="(answers.moments || []).includes(moment.key)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
                    <div>
                        <span class="text-xs font-semibold text-[#b85042]">{{ moment.label }}</span>
                        <span class="text-sm text-[#5c4a3a] ml-2">{{ moment.desc }}</span>
                    </div>
                </button>
            </div>
        </div>

        <!-- Sheet music -->
        <div>
            <label class="field-label">Necessites partitures?</label>
            <div class="space-y-2">
                <button
                    v-for="opt in sheetMusicOptions"
                    :key="opt.value"
                    type="button"
                    @click="setAnswer('needs_sheet_music', opt.value)"
                    class="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm transition-all duration-200"
                    :class="answers.needs_sheet_music === opt.value
            ? 'border-[#b85042] bg-[#b85042]/5 text-[#2c1810]'
            : 'border-[#e7ddd5] text-[#5c4a3a] hover:border-[#b85042]/40'"
                >
          <span
              class="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all"
              :class="answers.needs_sheet_music === opt.value
              ? 'border-[#b85042] bg-[#b85042]'
              : 'border-[#c5b5a5]'"
          />
                    {{ opt.label }}
                </button>
            </div>

            <!-- Sheet music link -->
            <div v-if="answers.needs_sheet_music && answers.needs_sheet_music !== 'none'" class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
                <p class="font-semibold mb-1">🎵 Pots estudiar amb aquestes partitures:</p>
                <a
                    href="https://www.dropbox.com/scl/fo/2yxgqmnuotcy7s0uc9kav/h?rlkey=tsyggfifx2rzcmfunfvsy57v9&st=6nqmyk71&dl=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-amber-700 hover:text-amber-900 underline break-all"
                >
                    Dropbox — Partitures Cabra d'Or
                </a>
                <p class="mt-2 text-amber-700">
                    Et recomanem que te les sàpigues de memòria — així gaudiràs més de la festa!
                    Si no, recorda buscar un «faristolet» per al teu instrument.
                </p>
            </div>
        </div>

        <!-- Notes -->
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
