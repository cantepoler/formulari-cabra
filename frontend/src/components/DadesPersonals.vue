<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState, mapState } from 'pinia';

export default {
  emits: ['continuar'],

  data() {
    return {
      intentatContinuar: false,
    }
  },

  computed: {
    ...mapWritableState(useFormStore, ['personals', 'rols']),
    ...mapState(useFormStore, ['esMenor16']),

    errors() {
      const e = {};
      if (!this.personals.nom.trim())
        e.nom = 'El nom és obligatori';
      if (!this.personals.cognom.trim())
        e.cognom = 'El cognom és obligatori';
      if (!this.personals.dataNaixement) {
        e.dataNaixement = 'La data de naixement és obligatòria';
      } else {
        const data = new Date(this.personals.dataNaixement);
        const avui = new Date();
        if (isNaN(data.getTime()) || data > avui || data.getFullYear() < 1924)
          e.dataNaixement = 'La data de naixement no és vàlida';
      }
      if (!this.personals.correu.trim()) {
        e.correu = 'El correu electrònic és obligatori';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.personals.correu)) {
        e.correu = 'El format del correu no és vàlid';
      }
      if (!String(this.personals.telefon).trim()) {
        e.telefon = 'El telèfon és obligatori';
      } else if (String(this.personals.telefon).replace(/\s/g, '').length < 9) {
        e.telefon = 'El telèfon ha de tenir almenys 9 dígits';
      }
      if (this.esMenor16 && !this.personals.responsable.trim())
        e.responsable = 'Les dades del responsable legal són obligatòries';
      if (this.rols.length === 0)
        e.rols = 'Has de seleccionar almenys un rol';
      return e;
    },

    formulariValid() {
      return Object.keys(this.errors).length === 0;
    },
  },

  methods: {
    continuar() {
      this.intentatContinuar = true;
      if (this.formulariValid) {
        this.$emit('continuar');
      }
    },

    // Helper perquè el template sigui més net
    err(camp) {
      return this.intentatContinuar && this.errors[camp];
    },
  },
}
</script>

<template>
  <div class="dades-wrapper">
    <div class="header-text">
      <h1>Dades personals</h1>
      <h3>Introdueix la teva informació per a la inscripció</h3>
    </div>

    <div class="info-box">
      <p>
        Benvingut/da a la Cabra d'Or 2026! Aquest formulari és obligatori i ens permetrà tenir en
        compte totes les participants per, entre d'altres coses, repartir el sopar gratuït i les
        tasques durant la festa. Moltes gràcies per participar — entre tots fem la Cabra d'Or
        possible!
      </p>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label class="field-label">Nom <span class="required">*</span></label>
        <input type="text" placeholder="Nom" v-model="personals.nom"
          :class="{ 'input-error': err('nom') }">
        <span v-if="err('nom')" class="error-msg">{{ errors.nom }}</span>
      </div>

      <div class="form-group">
        <label class="field-label">Cognom <span class="required">*</span></label>
        <input type="text" placeholder="Cognom" v-model="personals.cognom"
          :class="{ 'input-error': err('cognom') }">
        <span v-if="err('cognom')" class="error-msg">{{ errors.cognom }}</span>
      </div>

      <div class="form-group full-width">
        <label class="field-label">Data de naixement <span class="required">*</span></label>
        <input type="date" v-model="personals.dataNaixement"
          :class="{ 'input-error': err('dataNaixement') }">
        <span v-if="err('dataNaixement')" class="error-msg">{{ errors.dataNaixement }}</span>
      </div>

      <div class="form-group">
        <label class="field-label">Correu electrònic <span class="required">*</span></label>
        <input type="email" placeholder="correu@exemple.cat" v-model="personals.correu"
          :class="{ 'input-error': err('correu') }">
        <span v-if="err('correu')" class="error-msg">{{ errors.correu }}</span>
      </div>

      <div class="form-group">
        <label class="field-label">
          {{ esMenor16 ? 'Telèfon del responsable' : 'Telèfon' }} <span class="required">*</span>
        </label>
        <input type="tel" :placeholder="esMenor16 ? 'Telèfon del responsable' : '600 000 000'"
          v-model="personals.telefon" :class="{ 'input-error': err('telefon') }">
        <span v-if="esMenor16" class="field-hint">
          Com que ets menor de 16 anys, demanem el telèfon del teu responsable per poder contactar en cas necessari.
        </span>
        <span v-if="err('telefon')" class="error-msg">{{ errors.telefon }}</span>
      </div>

      <div class="form-group full-width" v-if="esMenor16">
        <div class="alert-box">
          <p>Ets menor de 16 anys. Necessitem les dades del teu tutor legal.</p>
          <label class="field-label">Nom del responsable <span class="required">*</span></label>
          <input type="text" placeholder="Nom i cognom del responsable"
            v-model="personals.responsable"
            :class="{ 'input-error': err('responsable') }">
          <span v-if="err('responsable')" class="error-msg">{{ errors.responsable }}</span>
        </div>
      </div>
    </div>

    <div class="roles-section">
      <h3>Rol dins la festa <span class="required">*</span></h3>
      <p class="roles-hint">Pots seleccionar més d'un rol si és el teu cas.</p>
      <div class="checkbox-group">
        <label class="checkbox-label" :class="{ 'checkbox-selected': rols.includes('organitzacio') }">
          <input type="checkbox" value="organitzacio" v-model="rols">
          <span>🎪 Organització</span>
        </label>
        <label class="checkbox-label" :class="{ 'checkbox-selected': rols.includes('banda') }">
          <input type="checkbox" value="banda" v-model="rols">
          <span>🎺 Banda Àuria</span>
        </label>
        <label class="checkbox-label" :class="{ 'checkbox-selected': rols.includes('teatre') }">
          <input type="checkbox" value="teatre" v-model="rols">
          <span>🎭 Teatre</span>
        </label>
        <label class="checkbox-label" :class="{ 'checkbox-selected': rols.includes('danses') }">
          <input type="checkbox" value="danses" v-model="rols">
          <span>💃 Danses</span>
        </label>
        <label class="checkbox-label" :class="{ 'checkbox-selected': rols.includes('colabos') }">
          <input type="checkbox" value="colabos" v-model="rols">
          <span>🤝 Col·laboradors</span>
        </label>
      </div>
      <span v-if="err('rols')" class="error-msg">{{ errors.rols }}</span>
    </div>

    <!-- Resum d'errors quan es fa clic a continuar -->
    <div v-if="intentatContinuar && !formulariValid" class="error-summary">
      <p>⚠️ Revisa els camps marcats en vermell abans de continuar.</p>
    </div>

    <div class="actions">
      <button @click="continuar" class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.dades-wrapper {
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
  line-height: 1.6;
}

/* Grid del formulari */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.full-width { grid-column: 1 / -1; }

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
.required { color: #ef4444; }

input[type="text"],
input[type="date"],
input[type="email"],
input[type="tel"],
input[type="number"] {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background-color: #f9fafb;
  font-family: inherit;
}
input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
  background-color: #ffffff;
}
.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}
.error-msg {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 2px;
}
.field-hint {
  font-size: 0.8rem;
  color: #92400e;
  margin-top: 2px;
  line-height: 1.4;
}

/* Caixa d'alerta menor */
.alert-box {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.alert-box p {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Secció de rols */
.roles-section h3 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  color: #374151;
  font-weight: 600;
}
.roles-hint {
  margin: 0 0 14px 0;
  font-size: 0.875rem;
  color: #6b7280;
}
.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #4b5563;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  font-weight: 500;
}
.checkbox-label:hover {
  background-color: #fffbeb;
  border-color: #fde68a;
  color: #d97706;
}
.checkbox-selected {
  background-color: #fffbeb !important;
  border-color: #f59e0b !important;
  color: #b45309 !important;
  font-weight: 600 !important;
}
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #d97706;
  cursor: pointer;
  margin: 0;
  flex-shrink: 0;
}

/* Resum d'errors */
.error-summary {
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-left: 4px solid #ef4444;
  padding: 12px 16px;
  border-radius: 6px;
}
.error-summary p {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Accions */
.actions {
  display: flex;
  justify-content: flex-end;
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
  font-family: inherit;
  box-shadow: 0 4px 6px rgba(217, 119, 6, 0.2);
}
.btn-primary:hover {
  background-color: #b45309;
  box-shadow: 0 6px 12px rgba(217, 119, 6, 0.3);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(1px);
}

/* Responsive */
@media (max-width: 540px) {
  .form-grid { grid-template-columns: 1fr; }
  .checkbox-group { grid-template-columns: 1fr; }
  .actions { justify-content: stretch; }
  .btn-primary { width: 100%; text-align: center; }
}
</style>
