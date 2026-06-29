<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState } from 'pinia';

export default {
  emits: ['continuar', 'enrere'],

  data() {
    return {
      comissionsDisponibles: [
        { id: 'gestio', label: '🗂️ Gestió' },
        { id: 'imatge', label: '📸 Imatge' },
        { id: 'taverna', label: '🍺 Taverna' },
        { id: 'poble', label: '🏘️ Poble / Coromines' },
        { id: 'altres', label: '✨ Altres' },
      ],
    }
  },

  computed: {
    ...mapWritableState(useFormStore, ['detallsOrganitzacio']),

    esDeTaverna() {
      return this.detallsOrganitzacio.comissions.includes('taverna');
    },

    potContinuar() {
      return this.detallsOrganitzacio.comissions.length > 0;
    },
  },

  methods: {
    enviar() {
      this.$emit('continuar');
    },
  },
}
</script>

<template>
  <div class="org-wrapper">
    <div class="header-text">
      <h1>Organització</h1>
      <h3>Dades sobre el teu rol organitzatiu a la festa</h3>
    </div>

    <div class="info-box">
      <p>
        Gràcies per formar part de l'organització de la Cabra d'Or! Indica de quina comissió
        formes part perquè puguem coordinar-nos millor.
      </p>
    </div>

    <div class="form-section">
      <label class="section-title">De quina comissió organitzativa formes part? <span class="required">*</span></label>
      <p class="field-hint">Pots seleccionar més d'una si és el cas.</p>
      <div class="options-grid">
        <label v-for="comi in comissionsDisponibles" :key="comi.id"
          class="option-card"
          :class="{ 'option-selected': detallsOrganitzacio.comissions.includes(comi.id) }">
          <input type="checkbox" :value="comi.id" v-model="detallsOrganitzacio.comissions">
          <span>{{ comi.label }}</span>
        </label>
      </div>
    </div>

    <!-- Pregunta específica de Taverna -->
    <div v-if="esDeTaverna" class="taverna-box">
      <div class="taverna-header">
        <span class="taverna-icon">🍺</span>
        <div>
          <h3>Taverna</h3>
          <p>Els torns de barra s'organitzen en base a la gent disponible.</p>
        </div>
      </div>
      <label class="section-title">Et compromets a fer un torn de barra per nit de festa?</label>
      <div class="radio-group">
        <label class="radio-label" :class="{ 'radio-selected': detallsOrganitzacio.tornBarra === true }">
          <input type="radio" :value="true" v-model="detallsOrganitzacio.tornBarra">
          <span>Sí, m'hi comprometo!</span>
        </label>
        <label class="radio-label" :class="{ 'radio-selected': detallsOrganitzacio.tornBarra === false }">
          <input type="radio" :value="false" v-model="detallsOrganitzacio.tornBarra">
          <span>No podré, però col·laboro en altres coses.</span>
        </label>
      </div>
    </div>

    <div class="form-section">
      <label class="section-title">Vols afegir alguna cosa?</label>
      <textarea v-model="detallsOrganitzacio.observacions"
        placeholder="Altres comentaris, disponibilitat, o qualsevol cosa que vulguis fer saber a l'organització..."
        rows="4" class="custom-textarea"></textarea>
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar" :disabled="!potContinuar" class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.org-wrapper {
  display: flex;
  flex-direction: column;
  gap: 28px;
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
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  padding: 16px;
  border-radius: 8px;
}
.info-box p { margin: 0; color: #b45309; font-size: 0.95rem; line-height: 1.5; }

.form-section { display: flex; flex-direction: column; gap: 10px; }

.section-title { font-size: 1.05rem; color: #374151; font-weight: 600; margin: 0; }
.required { color: #ef4444; }
.field-hint { margin: 0; font-size: 0.85rem; color: #6b7280; }

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
}
.option-card:hover { background-color: #fffbeb; border-color: #fde68a; }
.option-selected {
  background-color: #fffbeb !important;
  border-color: #f59e0b !important;
  color: #b45309 !important;
  font-weight: 600 !important;
}

/* Caixa específica de Taverna */
.taverna-box {
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  border-left: 4px solid #f97316;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.taverna-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.taverna-icon { font-size: 2rem; line-height: 1; }
.taverna-header h3 { margin: 0 0 4px; color: #c2410c; font-size: 1.1rem; font-weight: 700; }
.taverna-header p { margin: 0; color: #9a3412; font-size: 0.9rem; }

.radio-group { display: flex; flex-direction: column; gap: 10px; }
.radio-label {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
}
.radio-label:hover { background-color: #fafafa; }
.radio-selected { background-color: #fffbeb; border-color: #f59e0b; color: #b45309; font-weight: 600; }

input[type="checkbox"], input[type="radio"] {
  width: 18px; height: 18px;
  accent-color: #d97706;
  margin: 0; cursor: pointer; flex-shrink: 0;
}

.custom-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  background-color: #f9fafb;
  box-sizing: border-box;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
}
.custom-textarea:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
  background-color: #ffffff;
}

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
  .options-grid { grid-template-columns: 1fr; }
  .actions { flex-direction: column-reverse; gap: 10px; }
  .btn-primary, .btn-secondary { width: 100%; text-align: center; }
}
</style>