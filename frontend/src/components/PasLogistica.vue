<script>
export default {
    emits: ['continuar', 'enrere'],

    data() {
        return {
            tasquesSeleccionades: [],
            aforaments: {},
        }
    },

    methods: {
        toggleTasca(taskId) {
            const index = this.tasquesSeleccionades.indexOf(taskId);
            if (index === -1) {
                this.tasquesSeleccionades.push(taskId);
            } else {
                this.tasquesSeleccionades.splice(index, 1);
            }
        },

        isSeleccionada(taskId) {
            return this.tasquesSeleccionades.includes(taskId);
        },

        enviar() {
            this.$emit('continuar', {
                tasquesSeleccionades: this.tasquesSeleccionades
            })
        }
    },

    mounted() {
        fetch('/api/initial_info')
            .then(res => res.json())
            .then(data => { this.aforaments = data; })
            .catch(err => console.error("Error carregant horaris inicials:", err));
    }
}
</script>

<template>
    <div class="dades-wrapper">
        <div class="header-text">
            <h1>Horari Logístic</h1>
            <h3>Selecciona les tasques on vols i pots col·laborar</h3>
        </div>

        <div class="info-box">
            <p><strong>Important:</strong> Has de seleccionar almenys una tasca per poder continuar. Les tasques amb 0
                places apareixen bloquejades.</p>
        </div>

        <div class="tasks-grid">
            <div v-for="(tasks, day) in aforaments.tasques_logistiques" :key="day" class="day-selection">
                <h3 class="day-title">{{ day }}</h3>

                <table class="tasks-table">
                    <thead>
                        <tr>
                            <th class="col-hora">Hora</th>
                            <th class="col-tasca">Tasca i Disponibilitat</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="task in tasks" :key="task.id">
                            <td class="cell-hora">{{ task.hora }}</td>
                            <td class="cell-tasca">
                                <button class="btn-task" :class="{ 'is-selected': isSeleccionada(task.id) }"
                                    :disabled="task.places_lliures === 0 && !isSeleccionada(task.id)"
                                    @click="toggleTasca(task.id)">
                                    <div class="task-info">
                                        <span class="task-name">{{ task.nom }}</span>
                                        <span class="task-places"
                                            :class="{ 'text-red': task.places_lliures <= 2 && task.places_lliures > 0 }">
                                            Places lliures: {{ task.places_lliures }}
                                        </span>
                                    </div>
                                    <div class="check-icon" v-if="isSeleccionada(task.id)">✓</div>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="actions">
            <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
            <button @click="enviar" :disabled="tasquesSeleccionades.length === 0" class="btn-primary">Continuar</button>
        </div>
    </div>
</template>

<style scoped>
/* --- ESTRUCTURA GENERAL --- */
.dades-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.header-text h1 {
    margin: 0;
    color: #111827;
    font-size: 1.875rem;
    font-weight: 800;
}

.header-text h3 {
    margin: 8px 0 0 0;
    color: #6b7280;
    font-size: 1rem;
    font-weight: 400;
}

.info-box {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    padding: 12px 16px;
    border-radius: 6px;
}

.info-box p {
    margin: 0;
    color: #b45309;
    font-size: 0.9rem;
}

/* --- TAULA I DIES --- */
.day-selection {
    margin-bottom: 30px;
}

.day-title {
    font-size: 1.2rem;
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 8px;
    margin-bottom: 16px;
    text-transform: capitalize;
}

.tasks-table {
    width: 100%;
    border-collapse: collapse;
}

.tasks-table th {
    text-align: left;
    padding: 0 0 10px 0;
    color: #6b7280;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.col-hora {
    width: 70px;
}

.tasks-table td {
    padding: 8px 0;
    vertical-align: middle;
    border-bottom: 1px solid #f3f4f6;
}

.cell-hora {
    font-weight: 700;
    color: #4b5563;
    font-size: 0.95rem;
}

/* --- BOTONS DE TASCA --- */
.btn-task {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    text-align: left;
}

.task-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.task-name {
    font-weight: 600;
    font-size: 1rem;
    color: #1f2937;
}

.task-places {
    font-size: 0.85rem;
    color: #6b7280;
}

.text-red {
    color: #dc2626;
    /* Color vermell si queden poques places */
    font-weight: 600;
}

/* Estats del Botó de Tasca */
.btn-task:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-1px);
}

.btn-task.is-selected {
    background-color: #f59e0b;
    border-color: #d97706;
}

.btn-task.is-selected .task-name,
.btn-task.is-selected .task-places {
    color: #ffffff;
}

.check-icon {
    background-color: #ffffff;
    color: #d97706;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-task:disabled {
    background-color: #f3f4f6;
    border-color: #e5e7eb;
    cursor: not-allowed;
    opacity: 0.7;
}

/* --- ACCIONS (Botons inferiors) --- */
.actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
}

.btn-primary {
    background-color: #d97706;
    color: #ffffff;
    border: none;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(217, 119, 6, 0.2);
}

.btn-primary:hover:not(:disabled) {
    background-color: #b45309;
    box-shadow: 0 6px 12px rgba(217, 119, 6, 0.3);
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
}

.btn-secondary {
    background-color: #ffffff;
    color: #4b5563;
    border: 1px solid #d1d5db;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
    color: #1f2937;
}
</style>