<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
    roles: Array,
})

const form = inject('wizardForm')

// Under 16 requires guardian fields
const isMinor = computed(() => {
    if (!form.birth_date) return false
    const birth = new Date(form.birth_date)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear()
    const hadBirthday = (
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
    )
    return (hadBirthday ? age : age - 1) < 16
})

const toggleRole = (roleId) => {
    const idx = form.role_ids.indexOf(roleId)
    if (idx === -1) {
        form.role_ids.push(roleId)
    } else {
        form.role_ids.splice(idx, 1)
    }
}
</script>

<template>
    <div class="space-y-6">

        <!-- Welcome text (from PPTX spec) -->
        <div class="bg-[#b85042]/8 border border-[#b85042]/20 rounded-xl p-5 text-sm text-[#5c4a3a] leading-relaxed">
            <p class="font-semibold text-[#2c1810] mb-2">Benvingut/da a la Cabra d'Or 2026!</p>
            <p>
                L'any passat el formulari de participació va ser un èxit i, per tant, repetirem format.
                Aquest formulari és <strong>obligatori</strong> i ens permetrà tenir en compte totes les
                participants per, entre d'altres coses, repartir el sopar gratuït que s'ofereix als
                col·laboradors i participants.
            </p>
            <p class="mt-2">Moltes gràcies per participar, entre tots fem La Cabra d'Or possible! 🐐</p>
        </div>

        <!-- Personal fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Full name -->
            <div class="sm:col-span-2">
                <label class="field-label">Nom i cognoms *</label>
                <input
                    v-model="form.full_name"
                    type="text"
                    autocomplete="name"
                    required
                    placeholder="Maria Garcia Puig"
                    class="field-input"
                    :class="{ 'field-error': form.errors.full_name }"
                />
                <p v-if="form.errors.full_name" class="field-error-msg">{{ form.errors.full_name }}</p>
            </div>

            <!-- Birth date -->
            <div>
                <label class="field-label">Data de naixement *</label>
                <input
                    v-model="form.birth_date"
                    type="date"
                    required
                    class="field-input"
                    :class="{ 'field-error': form.errors.birth_date }"
                />
                <p v-if="form.errors.birth_date" class="field-error-msg">{{ form.errors.birth_date }}</p>
            </div>

            <!-- Phone -->
            <div>
                <label class="field-label">Número de telèfon</label>
                <input
                    v-model="form.phone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="600 000 000"
                    class="field-input"
                />
            </div>

            <!-- Email -->
            <div class="sm:col-span-2">
                <label class="field-label">Correu electrònic *</label>
                <input
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    required
                    placeholder="nom@exemple.com"
                    class="field-input"
                    :class="{ 'field-error': form.errors.email }"
                />
                <p v-if="form.errors.email" class="field-error-msg">{{ form.errors.email }}</p>
                <p class="text-xs text-[#a0896e] mt-1">
                    Rebràs un correu d'accés per consultar la teva inscripció.
                </p>
            </div>

        </div>

        <!-- Guardian fields (only if under 16) -->
        <Transition name="slide-down">
            <div v-if="isMinor" class="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                <p class="text-amber-800 text-sm font-medium">
                    ⚠️ Com que ets menor de 16 anys, necessitem les dades d'un responsable.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="field-label">Nom del/la responsable</label>
                        <input v-model="form.guardian_name" type="text" placeholder="Nom i cognoms" class="field-input" />
                    </div>
                    <div>
                        <label class="field-label">Telèfon del/la responsable</label>
                        <input v-model="form.guardian_phone" type="tel" placeholder="600 000 000" class="field-input" />
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Role selection -->
        <div>
            <label class="field-label mb-3 block">Rol dins la festa * <span class="font-normal normal-case">(pots triar més d'un)</span></label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    v-for="role in roles"
                    :key="role.id"
                    type="button"
                    @click="toggleRole(role.id)"
                    class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200"
                    :class="form.role_ids.includes(role.id)
            ? 'border-[#b85042] bg-[#b85042]/5 shadow-sm'
            : 'border-[#e7ddd5] bg-white hover:border-[#b85042]/40'"
                >
                    <!-- Checkbox indicator -->
                    <span
                        class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                        :class="form.role_ids.includes(role.id)
              ? 'border-[#b85042] bg-[#b85042]'
              : 'border-[#c5b5a5]'"
                    >
            <svg v-if="form.role_ids.includes(role.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
                    <div>
                        <p class="font-medium text-[#2c1810] text-sm">{{ role.name }}</p>
                        <p v-if="role.description" class="text-[#a0896e] text-xs mt-0.5 leading-snug">
                            {{ role.description }}
                        </p>
                    </div>
                </button>
            </div>
            <p v-if="form.errors.role_ids" class="field-error-msg mt-2">{{ form.errors.role_ids }}</p>
            <p v-if="form.role_ids.length > 0" class="text-xs text-[#a0896e] mt-3">
                ✓ S'han seleccionat {{ form.role_ids.length }} rol{{ form.role_ids.length > 1 ? 's' : '' }}.
                A les pàgines següents apareixeran les preguntes específiques per a cada un.
            </p>
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
.field-error {
    @apply border-red-400 bg-red-50;
}
.field-error-msg {
    @apply text-red-500 text-xs mt-1;
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
    opacity: 1;
    max-height: 300px;
}
</style>
