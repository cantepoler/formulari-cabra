<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState } from 'pinia';

export default {
  emits: ['continuar', 'enrere'],

  data() {
    return {
      ballsDisponibles: [
        'Cabretes',
        'Portadors/es Xics',
        'Cintes',
        'Guerrers Àuris (Jovenalla)',
        'Pastors',
        'Portadors/es',
        'Trempats i Enxirinades',
        'Cabrones',
        'Portadors/es veteranes',
        'Mort',
      ],
      talles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    }
  },

  computed: {
    ...mapWritableState(useFormStore, ['detallsDanses']),

    potContinuar() {
      return this.detallsDanses.ball.trim() !== '';
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
  <div class="danses-wrapper">
    <div class="header-text">
      <h1>Danses</h1>
      <h3>Informació sobre la teva participació en les danses</h3>
    </div>

    <div class="info-box">
      <p>
        🩰Desde la comissió de danses necessitem saber quin ball fas i la teva talla per poder preparar el vestuari si
        cal! Ens posarem en contacte amb tu per fer-te arribar el vestit si cal.
      </p>
    </div>

    <div class="form-section">
      <label class="section-title">Quin ball fas? <span class="required">*</span></label>
      <select v-model="detallsDanses.ball" class="custom-select">
        <option value="" disabled selected>Tria el ball</option>
        <option v-for="ball in ballsDisponibles" :key="ball" :value="ball">{{ ball }}</option>
      </select>
    </div>

    <div class="form-section">
      <label class="section-title">Talla de roba</label>
      <div class="talla-grid">
        <label v-for="talla in talles" :key="talla" class="talla-card"
          :class="{ 'talla-selected': detallsDanses.talla === talla }">
          <input type="radio" :value="talla" v-model="detallsDanses.talla">
          <span>{{ talla }}</span>
        </label>
      </div>
    </div>

    <div class="form-section">
      <label class="section-title">Vols afegir alguna cosa?</label>
      <textarea v-model="detallsDanses.observacions"
        placeholder="Disponibilitat, dubtes, o qualsevol cosa que vulguis fer saber..." rows="4"
        class="custom-textarea"></textarea>
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar" :disabled="!potContinuar" class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.danses-wrapper {
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

.info-box p {
  margin: 0;
  color: #b45309;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 1.05rem;
  color: #374151;
  font-weight: 600;
  margin: 0;
}

.required {
  color: #ef4444;
}

.custom-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  font-family: inherit;
  cursor: pointer;
}

.custom-select:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
  background-color: #ffffff;
}

/* Selector de talla */
.talla-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.talla-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  min-width: 64px;
}

.talla-card:hover {
  background-color: #fffbeb;
  border-color: #fde68a;
}

.talla-selected {
  background-color: #fffbeb !important;
  border-color: #f59e0b !important;
  color: #b45309 !important;
}

input[type="radio"] {
  display: none;
  /* Amaguem el radio, el card fa de toggle */
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

@media (max-width: 540px) {
  .actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>