<script setup>
import { inject, computed } from 'vue'

const form = inject('wizardForm')
const visibleTasks = inject('visibleTasks')

const toggleTask = (taskId) => {
    const idx = form.task_ids.indexOf(taskId)
    if (idx === -1) {
        form.task_ids.push(taskId)
    } else {
        form.task_ids.splice(idx, 1)
    }
}

// Group tasks by day then by hour block
const groupedTasks = computed(() => {
    const groups = {}
    visibleTasks.value.forEach(task => {
        const date = task.start_time.split(' ')[0]
        if (!groups[date]) groups[date] = []
        groups[date].push(task)
    })
    return groups
})

const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

const capacityColor = (task) => {
    const pct = task.current_signups / task.capacity
    if (pct >= 1) return 'text-red-500'
    if (pct >= 0.8) return 'text-amber-500'
    return 'text-green-600'
}

const capacityBadge = (task) => {
    if (task.remaining_capacity === 0) return 'Ple'
    return `${task.remaining_capacity} lloc${task.remaining_capacity > 1 ? 's' : ''}`
}
</script>

<template>
    <div class="space-y-6">

        <!-- Intro -->
        <div class="bg-[#b85042]/8 border border-[#b85042]/20 rounded-xl p-5 text-sm text-[#5c4a3a] leading-relaxed">
            <p class="font-semibold text-[#2c1810] mb-1">📋 Horari de tasques</p>
            <p>
                Selecciona les tasques on vols i pots col·laborar durant la festa.
                <strong>Has de triar almenys una tasca</strong> per continuar.
                Les tasques mostrades son les disponibles pel teu rol.
            </p>
        </div>

        <!-- No tasks warning -->
        <div v-if="visibleTasks.length === 0" class="text-center py-8 text-[#c5b5a5]">
            <p class="text-3xl mb-2">🔍</p>
            <p class="text-sm">Torna al pas anterior i selecciona almenys un rol per veure les tasques disponibles.</p>
        </div>

        <!-- Tasks grouped by day -->
        <div v-else class="space-y-6">
            <div v-for="(tasks, date) in groupedTasks" :key="date">

                <!-- Day header -->
                <h3 class="text-xs font-bold uppercase tracking-widest text-[#a0896e] mb-3 capitalize">
                    {{ formatDate(date) }}
                </h3>

                <!-- Task cards -->
                <div class="space-y-2">
                    <button
                        v-for="task in tasks"
                        :key="task.id"
                        type="button"
                        :disabled="task.remaining_capacity === 0 && !form.task_ids.includes(task.id)"
                        @click="toggleTask(task.id)"
                        class="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200"
                        :class="{
              'border-[#b85042] bg-[#b85042]/5 shadow-sm': form.task_ids.includes(task.id),
              'border-[#e7ddd5] bg-white hover:border-[#b85042]/50': !form.task_ids.includes(task.id) && task.remaining_capacity > 0,
              'border-[#e7ddd5] bg-[#f8f5f2] opacity-50 cursor-not-allowed': task.remaining_capacity === 0 && !form.task_ids.includes(task.id),
            }"
                    >
                        <!-- Color dot -->
                        <span
                            class="flex-shrink-0 w-3 h-3 rounded-full"
                            :style="{ backgroundColor: task.color || '#b85042' }"
                        />

                        <!-- Task info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <p class="font-medium text-[#2c1810] text-sm">{{ task.title }}</p>
                                <span class="flex-shrink-0 text-xs font-semibold" :class="capacityColor(task)">
                  {{ capacityBadge(task) }}
                </span>
                            </div>
                            <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-[#a0896e]">
                  {{ task.start_time.split(' ')[1].substring(0,5) }}–{{ task.end_time }}
                </span>
                                <span v-if="task.location" class="text-xs text-[#a0896e]">📍 {{ task.location }}</span>
                            </div>
                            <!-- Capacity bar -->
                            <div class="mt-2 h-1.5 bg-[#e7ddd5] rounded-full overflow-hidden">
                                <div
                                    class="h-full rounded-full transition-all duration-300"
                                    :style="{
                    width: Math.min(100, (task.current_signups / task.capacity) * 100) + '%',
                    backgroundColor: task.color || '#b85042'
                  }"
                                />
                            </div>
                        </div>

                        <!-- Checkbox -->
                        <span
                            class="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                            :class="form.task_ids.includes(task.id)
                ? 'border-[#b85042] bg-[#b85042]'
                : 'border-[#c5b5a5]'"
                        >
              <svg v-if="form.task_ids.includes(task.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Selected summary -->
        <div v-if="form.task_ids.length > 0" class="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            ✓ Has seleccionat <strong>{{ form.task_ids.length }} tasca{{ form.task_ids.length > 1 ? 'es' : '' }}</strong>.
        </div>
        <div v-else-if="visibleTasks.length > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⚠️ Has de seleccionar almenys una tasca per continuar.
        </div>

    </div>
</template>
