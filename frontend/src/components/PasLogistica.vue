<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState } from 'pinia';

export default {
  emits: ['continuar', 'enrere'],

  data() {
    return {
      aforaments: {},
      carregant: true,
      errorCarrega: false,
    }
  },

  computed: {
    ...mapWritableState(useFormStore, ['tasquesSeleccionades']),
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
      this.$emit('continuar');
    },

    formatDia(dia) {
      // 'dia10' → 'Dia 10 d\'agost' / 'dia11' → 'Dia 11 d\'agost'
      const num = dia.replace('dia', '');
      return `Dia ${num} d'agost`;
    },
  },

  mounted() {
    fetch('/api/initial_info')
      .then(res => res.json())
      .then(data => {
        this.aforaments = data;
        this.carregant = false;
      })
      .catch(() => {
        this.errorCarrega = true;
        this.carregant = false;
      });
  },
}
</script>

<template>
  <div class="dades-wrapper">
    <div class="header-text">
      <h1>Horari de tasques</h1>
      <h3>Selecciona les tasques on vols i pots col·laborar</h3>
    </div>

    <div class="info-box">
      <p>
        <strong>Important:</strong> Has de seleccionar almenys una tasca per poder continuar.
        Les places disponibles s'actualitzen en temps real — si una tasca es queda sense places
        apareixerà bloquejada.
      </p>
    </div>

    <!-- Estat de càrrega -->
    <div v-if="carregant" class="loading-state">
      <div class="spinner"></div>
      <p>Carregant l'horari...</p>
    </div>

    <!-- Error de càrrega -->
    <div v-else-if="errorCarrega" class="error-state">
      <p>⚠️ No s'ha pogut carregar l'horari. Revisa la teva connexió i torna-ho a intentar.</p>
    </div>

    <!-- Horari -->
    <div v-else class="tasks-grid">
      <div v-for="(tasks, day) in aforaments.tasques_logistiques" :key="day" class="day-section">
        <h3 class="day-title">{{ formatDia(day) }}</h3>

        <div class="tasks-list">
          <div v-for="task in tasks" :key="task.id" class="task-row">
            <span class="task-hora">{{ task.hora }}</span>
            <button
              class="btn-task"
              :class="{ 'is-selected': isSeleccionada(task.id) }"
              :disabled="task.places_lliures === 0 && !isSeleccionada(task.id)"
              @click="toggleTasca(task.id)">
              <div class="task-info">
                <span class="task-name">{{ task.nom }}</span>
                <span class="task-places"
                  :class="{
                    'places-ok': task.places_lliures > 2,
                    'places-low': task.places_lliures <= 2 && task.places_lliures > 0,
                    'places-full': task.places_lliures === 0
                  }">
                  <template v-if="task.places_lliures === 0">Complet</template>
                  <template v-else>{{ task.places_lliures }} places lliures</template>
                </span>
              </div>
              <span v-if="isSeleccionada(task.id)" class="check-icon" aria-hidden="true">✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resum selecció -->
    <div v-if="tasquesSeleccionades.length > 0" class="seleccio-resum">
      ✅ Has seleccionat {{ tasquesSeleccionades.length }}
      {{ tasquesSeleccionades.length === 1 ? 'tasca' : 'tasques' }}
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar" :disabled="tasquesSeleccionades.length === 0" class="btn-primary">
        Continuar
      </button>
    </div>
  </div>
</template>

<style scoped>
.dades-wrapper { display: flex; flex-direction: column; gap: 24px; }

.header-text h1 { margin: 0; color: #111827; font-size: 1.875rem; font-weight: 800; }
.header-text h3 { margin: 8px 0 0 0; color: #6b7280; font-size: 1rem; font-weight: 400; }

.info-box {
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 6px;
}
.info-box p { margin: 0; color: #b45309; font-size: 0.9rem; }

/* Loading / Error */
.loading-state, .error-state {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
}
.spinner {
  width: 24px; height: 24px;
  border: 3px solid #fde68a;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { background-color: #fef2f2; color: #b91c1c; }
.error-state p { margin: 0; }

/* Dies i tasques */
.day-section { margin-bottom: 28px; }
.day-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
  margin: 0 0 14px 0;
}

.tasks-list { display: flex; flex-direction: column; gap: 8px; }

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-hora {
  font-size: 0.85rem;
  font-weight: 700;
  color: #6b7280;
  width: 52px;
  flex-shrink: 0;
  text-align: right;
}

/* ---- BOTÓ DE TASCA (amb fix del hover quan ja està seleccionat) ---- */
.btn-task {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  font-family: inherit;
  text-align: left;
  min-height: 56px;
}

/* Hover NORMAL (no seleccionat, no deshabilitat) */
.btn-task:hover:not(:disabled):not(.is-selected) {
  background-color: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

/* Estat SELECCIONAT */
.btn-task.is-selected {
  background-color: #f59e0b;
  border-color: #d97706;
}
/* Hover quan JA ESTÀ SELECCIONAT → color daurat més fosc (indica que es pot deseleccionar) */
.btn-task.is-selected:hover {
  background-color: #d97706;
  border-color: #b45309;
  transform: translateY(-1px);
}

/* Deshabilitat */
.btn-task:disabled {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  cursor: not-allowed;
  opacity: 0.65;
}

.task-info { display: flex; flex-direction: column; gap: 3px; }

.task-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
}
.btn-task.is-selected .task-name { color: #ffffff; }
.btn-task:disabled .task-name { color: #9ca3af; }

.task-places { font-size: 0.8rem; }
.places-ok { color: #6b7280; }
.places-low { color: #dc2626; font-weight: 600; }
.places-full { color: #9ca3af; }
.btn-task.is-selected .task-places { color: rgba(255,255,255,0.85); }

.check-icon {
  background-color: #ffffff;
  color: #d97706;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Resum selecció */
.seleccio-resum {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #22c55e;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #15803d;
}

/* Accions */
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
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
.btn-primary:disabled { background-color: #e5e7eb; color: #9ca3af; cursor: not-allowed; box-shadow: none; }
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
.btn-secondary:hover { background-color: #f9fafb; border-color: #9ca3af; color: #1f2937; }

/* Responsive */
@media (max-width: 540px) {
  .task-hora { width: 42px; font-size: 0.8rem; }
  .task-name { font-size: 0.9rem; }
  .actions { flex-direction: column-reverse; gap: 10px; }
  .btn-primary, .btn-secondary { width: 100%; text-align: center; }
}
</style>