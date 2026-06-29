<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState } from 'pinia';

export default {
  emits: ['continuar', 'enrere'],

  computed: {
    ...mapWritableState(useFormStore, ['detallsColaboradors']),
  },

  methods: {
    enviar() {
      this.$emit('continuar');
    },
  },
}
</script>

<template>
  <div class="colabos-wrapper">
    <div class="header-text">
      <h1>Col·laboradors</h1>
      <h3>Participa a la festa ajudant on més es necessiti</h3>
    </div>

    <div class="info-box">
      <p>
        Gràcies per voler col·laborar a la Cabra d'Or! Els col·laboradors són la columna
        vertebral de la festa. Podràs ajudar en tasques logístiques, torns de barra, servir
        el sopar, o on faci falta. A la pròxima pantalla podràs triar específicament en quines
        tasques i horaris vols ajudar.
      </p>
    </div>

    <div class="form-section">
      <label class="section-title">Vols afegir alguna cosa?</label>
      <textarea v-model="detallsColaboradors.observacions"
        placeholder="Digue'ns quina disponibilitat tens, en què prefereixes ajudar, o qualsevol cosa que vulguis que sapiguem..."
        rows="5" class="custom-textarea"></textarea>
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar" class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.colabos-wrapper { display: flex; flex-direction: column; gap: 28px; }

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