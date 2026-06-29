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
    // Utilitzem tasquesSeleccionades perquè és el nom real que tens a Pinia
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
    }
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

    <div v-if="carregant" class="loading-state">
      <div class="spinner"></div>
      <p>Carregant l'horari...</p>
    </div>

    <div v-else-if="errorCarrega" class="error-state">
      <p>⚠️ No s'ha pogut carregar l'horari. Revisa la teva connexió i torna-ho a intentar.</p>
    </div>

    <div v-else class="tasks-grid">
      <div v-for="(tasks, day) in aforaments.tasques_logistiques" :key="day" class="day-section">
        <h3 class="day-title">{{ day }}</h3>

        <div class="table-responsive">
          <table class="tasks-table">
            <thead>
              <tr>
                <th class="col-hora">Hora</th>
                <th class="col-public">Què fa el públic?</th>
                <th class="col-tasca">Tasca i Disponibilitat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tasks" :key="task.id">
                <td class="cell-hora">{{ task.hora }}</td>

                <td class="cell-public">
                  <span class="public-event-badge">{{ task.acte_public || '-' }}</span>
                </td>

                <td class="cell-tasca">
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

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

/* Dies i Taula */
.day-section { margin-bottom: 30px; }
.day-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
  margin: 0 0 16px 0;
  text-transform: capitalize; /* Converteix "dia10" a "Dia10" */
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 10px;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
/*   min-width: 600px; /* Evita que s'aixafi massa al mòbil */
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
  width: 50px; /* Reduït al mínim per a l'hora (ex: 12:00) */
}

.col-public { 
  width: 25%; /* Abans era el 35%, el reduïm perquè el botó tingui més aire */
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

.cell-public {
  padding-right: 16px;
}

.public-event-badge {
  display: inline-block;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 0.75rem; /* Reduït de 0.85rem a 0.75rem */
  padding: 4px 8px; /* Més compacte */
  border-radius: 6px;
  font-style: italic;
  border: 1px dashed #d1d5db;
}

/* ---- BOTÓ DE TASCA ---- */
.btn-task {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  padding: 8px 10px; /* Reduït de 12px 14px a 8px 10px per guanyar molt espai */
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  font-family: inherit;
  text-align: left;
  min-height: 48px; /* Una mica més baix per estilitzar */
}

/* Hover NORMAL */
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

/* Hover quan JA ESTÀ SELECCIONAT */
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
  font-size: 0.85rem; /* Reduït de 0.95rem a 0.85rem per al mòbil */
  color: #1f2937;
  line-height: 1.2;
}
.btn-task.is-selected .task-name { color: #ffffff; }
.btn-task:disabled .task-name { color: #9ca3af; }
.task-places { 
  font-size: 0.75rem; /* Text de places una mica més petit i discret */
}
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


@media (max-width: 540px) {
  .tasks-table th {
    font-size: 0.75rem; /* Capçaleres de taula més petites */
  }
  .cell-hora {
    font-size: 0.85rem; /* Hora un pel més petita */
  }
  .check-icon {
    width: 22px;  /* El xec de seleccionat es fa una mica més petit */
    height: 22px;
    font-size: 0.8rem;
  }
  .actions { 
    flex-direction: column-reverse; 
    gap: 10px; 
  }
  .btn-primary, .btn-secondary { 
    width: 100%; 
    text-align: center; 
  }
}
</style>