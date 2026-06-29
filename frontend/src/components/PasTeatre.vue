<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState } from 'pinia';

export default {
  emits: ['continuar', 'enrere'],

  computed: {
    ...mapWritableState(useFormStore, ['detallsTeatre']),
  },

  methods: {
    enviar() {
      this.$emit('continuar');
    },
  },
}
</script>

<template>
  <div class="teatre-wrapper">
    <div class="header-text">
      <h1>Teatre</h1>
      <h3>Informació sobre la teva participació al teatre</h3>
    </div>

    <div class="info-box">
      <p>
        Gràcies per participar al teatre de la Cabra d'Or! La comissió de teatre es posarà
        en contacte amb tu per coordinar els assajos i la teva participació. Si tens qualsevol
        pregunta o comentari, pots deixar-lo aquí sota.
      </p>
    </div>

    <div class="form-section">
      <label class="section-title">Vols afegir alguna cosa?</label>
      <textarea v-model="detallsTeatre.observacions"
        placeholder="Disponibilitat, experiència prèvia, paper que t'agradaria fer, o qualsevol altra cosa..."
        rows="5" class="custom-textarea"></textarea>
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar" class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.teatre-wrapper { display: flex; flex-direction: column; gap: 28px; }

.header-text h1 { margin: 0; color: #111827; font-size: 1.875rem; font-weight: 800; }
.header-text h3 { margin: 8px 0 0 0; color: #6b7280; font-size: 1rem; font-weight: 400; }

.info-box {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  padding: 16px;
  border-radius: 8px;
}
.info-box p { margin: 0; color: #b45309; font-size: 0.95rem; line-height: 1.6; }

.form-section { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-size: 1.05rem; color: #374151; font-weight: 600; margin: 0; }

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
.btn-primary:hover { background-color: #b45309; transform: translateY(-1px); }
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
  .actions { flex-direction: column-reverse; gap: 10px; }
  .btn-primary, .btn-secondary { width: 100%; text-align: center; }
}
</style>