<script setup>
import { ref, computed, provide } from 'vue'
import { useForm, Head } from '@inertiajs/vue3'
import Step1Personal from './Steps/Step1Personal.vue'
import Step3BandaAuria from './Steps/Step3BandaAuria.vue'
import StepRoleGeneric from './Steps/StepRoleGeneric.vue'
import StepTasks from './Steps/StepTasks.vue'
import StepDinner from './Steps/StepDinner.vue'

const props = defineProps({
    roles: Array,  // All available roles from DB
    tasks: Array,  // All tasks with capacity info
})

// ── Wizard state ─────────────────────────────────────────────────────────

const currentStep = ref(1)

const form = useForm({
    // Step 1
    full_name:      '',
    birth_date:     '',
    email:          '',
    phone:          '',
    guardian_name:  '',
    guardian_phone: '',
    role_ids:       [],

    // Steps 2-6: dynamic role answers
    form_answers: {},

    // Step 7
    task_ids: [],

    // Step 8
    attending_dinner: null,
    dinner_notes:     '',
})

// Share form with child steps via provide/inject
provide('wizardForm', form)

// ── Computed steps ────────────────────────────────────────────────────────

// Selected role slugs — used to show/hide role tabs and filter tasks
const selectedRoleSlugs = computed(() => {
    return props.roles
        .filter(r => form.role_ids.includes(r.id))
        .map(r => r.slug)
})

// Build the dynamic list of steps based on selected roles
const steps = computed(() => {
    const list = [
        { id: 1, key: 'personal', label: 'Dades personals', component: Step1Personal, always: true },
    ]

    // Role-specific tabs (only shown if role selected)
    const roleTabs = [
        { roleSlug: 'organitzacio', id: 2, key: 'organitzacio', label: 'Organització', component: StepRoleGeneric },
        { roleSlug: 'banda-auria',  id: 3, key: 'banda_auria',  label: 'Banda Àuria',  component: Step3BandaAuria },
        { roleSlug: 'teatre',       id: 4, key: 'teatre',       label: 'Teatre',       component: StepRoleGeneric },
        { roleSlug: 'danses',       id: 5, key: 'danses',       label: 'Danses',       component: StepRoleGeneric },
        { roleSlug: 'collaboradors',id: 6, key: 'collaboradors',label: 'Col·laboradors',component: StepRoleGeneric },
    ]

    roleTabs.forEach(tab => {
        if (selectedRoleSlugs.value.includes(tab.roleSlug)) {
            list.push({ ...tab, always: false })
        }
    })

    list.push(
        { id: 7, key: 'tasks',  label: 'Horari de tasques', component: StepTasks,  always: true },
        { id: 8, key: 'dinner', label: 'Sopar',             component: StepDinner, always: true },
    )

    // Re-number sequentially
    return list.map((step, i) => ({ ...step, stepNumber: i + 1 }))
})

const totalSteps = computed(() => steps.value.length)
const currentStepData = computed(() => steps.value.find(s => s.stepNumber === currentStep.value))
const progressPercent = computed(() => Math.round((currentStep.value / totalSteps.value) * 100))

// ── Navigation ────────────────────────────────────────────────────────────

const next = () => {
    if (currentStep.value < totalSteps.value) currentStep.value++
}

const prev = () => {
    if (currentStep.value > 1) currentStep.value--
}

const goTo = (stepNumber) => {
    // Only allow going back to completed steps
    if (stepNumber < currentStep.value) currentStep.value = stepNumber
}

const submit = () => {
    form.post(route('formulari.store'))
}

// ── Tasks filtered by role ────────────────────────────────────────────────

const visibleTasks = computed(() => {
    return props.tasks.filter(task => {
        if (!task.visible_to_roles || task.visible_to_roles.length === 0) return true
        return task.visible_to_roles.some(slug => selectedRoleSlugs.value.includes(slug))
    })
})

provide('visibleTasks', visibleTasks)
provide('selectedRoleSlugs', selectedRoleSlugs)
</script>

<template>
    <Head title="Formulari d'inscripció — La Cabra d'Or 2026" />

    <div class="min-h-screen bg-[#faf7f2]">

        <!-- Top header -->
        <header class="bg-[#b85042] text-white px-4 py-4 shadow-md">
            <div class="max-w-2xl mx-auto flex items-center gap-3">
                <span class="text-2xl">🐐</span>
                <div>
                    <h1 class="font-serif text-lg leading-tight">La Cabra d'Or 2026</h1>
                    <p class="text-white/70 text-xs">Formulari de participació</p>
                </div>
            </div>
        </header>

        <div class="max-w-2xl mx-auto px-4 py-8">

            <!-- Progress bar -->
            <div class="mb-8">
                <div class="flex items-center justify-between text-xs text-[#a0896e] mb-2">
                    <span>Pas {{ currentStep }} de {{ totalSteps }}</span>
                    <span>{{ progressPercent }}% completat</span>
                </div>
                <div class="h-2 bg-[#e7ddd5] rounded-full overflow-hidden">
                    <div
                        class="h-full bg-[#b85042] rounded-full transition-all duration-500 ease-out"
                        :style="{ width: progressPercent + '%' }"
                    />
                </div>
            </div>

            <!-- Step pills (only completed ones are clickable) -->
            <div class="flex flex-wrap gap-2 mb-8">
                <button
                    v-for="step in steps"
                    :key="step.stepNumber"
                    @click="goTo(step.stepNumber)"
                    :disabled="step.stepNumber >= currentStep"
                    class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                    :class="{
            'bg-[#b85042] text-white shadow-sm': step.stepNumber === currentStep,
            'bg-white border border-[#e7ddd5] text-[#a0896e] hover:border-[#b85042] hover:text-[#b85042] cursor-pointer': step.stepNumber < currentStep,
            'bg-[#f0ece6] text-[#c5b5a5] cursor-not-allowed': step.stepNumber > currentStep,
          }"
                >
                    {{ step.label }}
                </button>
            </div>

            <!-- Step card -->
            <div class="bg-white rounded-2xl shadow-sm border border-[#e7ddd5] p-6 md:p-8">

                <!-- Step title -->
                <h2 class="font-serif text-2xl text-[#2c1810] mb-6">
                    {{ currentStepData?.label }}
                </h2>

                <!-- Dynamic step component -->
                <component
                    :is="currentStepData?.component"
                    :roles="roles"
                    :step-key="currentStepData?.key"
                    @next="next"
                />

                <!-- Navigation buttons -->
                <div class="flex justify-between items-center mt-8 pt-6 border-t border-[#e7ddd5]">
                    <button
                        v-if="currentStep > 1"
                        @click="prev"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e7ddd5]
                   text-[#5c4a3a] text-sm hover:border-[#b85042] hover:text-[#b85042]
                   transition-all duration-200"
                    >
                        ← Anterior
                    </button>
                    <div v-else />

                    <button
                        v-if="currentStep < totalSteps"
                        @click="next"
                        class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#b85042] text-white
                   text-sm font-medium shadow-sm hover:bg-[#a0403a] hover:shadow-md
                   transition-all duration-200"
                    >
                        Següent →
                    </button>

                    <button
                        v-else
                        @click="submit"
                        :disabled="form.processing"
                        class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2c7a3a] text-white
                   text-sm font-medium shadow-sm hover:bg-[#245f2d] hover:shadow-md
                   transition-all duration-200 disabled:opacity-50"
                    >
                        <span v-if="form.processing">Enviant...</span>
                        <span v-else>✓ Enviar inscripció</span>
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>
