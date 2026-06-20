<script>
import { useFormStore } from '@/stores/formulari';
import { mapState, mapWritableState } from 'pinia';
export default {
  emits: ['continuar', 'enrere'],

  data() {
    return {
      instrumentsDisponibles: [
        'Flauta', 'Clarinet Sib', 'Tarota/Oboè', 'Saxo Alt',
        'Saxo Tenor', 'Saxo Baríton', 'Trompeta en Sib',
        'Trompa en Fa', 'Trombó', 'Fiscorn', 'Tuba',
        'Percussió', 'Pandero Quadrat'
      ],
      totsElsMoments: [
        { id: 'm1', text: '10/08 (nit) - Baixada del castell - Banda', tipus: 'banda' },
        { id: 'm2', text: '11/08 (matí) - Tallers + Passacarrers - Contrabanda', tipus: 'contrabanda' },
        { id: 'm3', text: '11/08 (tarda) - Passacarrers + teatre - Banda', tipus: 'banda' },
        { id: 'm4', text: '11/08 (nit) - Balls - Banda', tipus: 'banda' },
        { id: 'm5', text: '11/08 (nit) - Tancada de la cabra - Banda', tipus: 'banda' }
      ]
    }
  },

  computed: {
    ...mapWritableState(useFormStore, ['detallsBanda']),
    ...mapState(useFormStore, ['esMenor16']),
    momentsFiltrats() {

      return this.totsElsMoments.filter(moment => {
        if (moment.tipus === 'banda' && this.esMenor16) return false;
        if (moment.tipus === 'contrabanda' && !this.esMenor16) return false;
        return true;
      });
    }
  },
  methods: {
    enviar() {
      this.$emit('continuar');
    }
  }
}
</script>

<template>
  <div class="banda-wrapper">
    <div class="header-text">
      <h1>Banda Àuria</h1>
      <h3>Gestiona el teu rol com a músic de la festa</h3>
    </div>

    <div class="info-box">
      <p>Benvingut/da a la secció musical! Aquí coordinarem les teves preferències instrumentals i els actes on
        participaràs. Recorda que la selecció d'actes està adaptada a la teva edat registrada.</p>
    </div>

    <div class="form-section">
      <label class="section-title">Quin instrument toques?</label>
      <select v-model="detallsBanda.instrument" class="custom-select">
        <option value="" disabled selected>Tria el teu instrument</option>
        <option v-for="inst in instrumentsDisponibles" :key="inst" :value="inst">
          {{ inst }}
        </option>
      </select>
    </div>

    <div class="form-section">
      <label class="section-title">En quins moments tocaràs?</label>
      <div class="moments-grid">
        <div v-for="moment in momentsFiltrats" :key="moment.id" class="moment-card"
          :class="{ 'moment-selected': detallsBanda.moments.includes(moment.text) }">
          <label class="moment-label">
            <input type="checkbox" :value="moment.text" v-model="detallsBanda.moments">
            <span class="moment-text">{{ moment.text }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="form-section">
      <label class="section-title">Necessites partitures?</label>
      <div class="radio-group">
        <label class="radio-label" :class="{ 'radio-selected': detallsBanda.necessitaPartitures === 'no' }">
          <input type="radio" value="no" v-model="detallsBanda.necessitaPartitures">
          <span>No! Encara guardo les dels anys anteriors / Me les sé totes!</span>
        </label>
        <label class="radio-label" :class="{ 'radio-selected': detallsBanda.necessitaPartitures === 'noves' }">
          <input type="radio" value="noves" v-model="detallsBanda.necessitaPartitures">
          <span>Només les més noves…</span>
        </label>
        <label class="radio-label" :class="{ 'radio-selected': detallsBanda.necessitaPartitures === 'si' }">
          <input type="radio" value="si" v-model="detallsBanda.necessitaPartitures">
          <span>Sí! Totes</span>
        </label>
      </div>
    </div>

    <div class="download-box" v-if="detallsBanda.necessitaPartitures === 'noves' || detallsBanda.necessitaPartitures === 'si'">
      <p>De moment, pots estudiar amb aquestes partitures en línia:</p>
      <a href="https://www.dropbox.com/scl/fo/2yxgqmnuotcy7s0uc9kav/h?rlkey=tsyggfifx2rzcmfunfvsy57v9&st=6nqmyk71&dl=0"
        target="_blank" class="download-link">
        Accedir al Dropbox de Partitures
      </a>
      <p class="download-tip">Et recomanem que te les sàpigues de memòria, així gaudiràs més de la festa! Si no,
        pensa a buscar un "faristolet" apte pel teu instrument.</p>
    </div>

    <div class="form-section">
      <label class="section-title">Vols afegir alguna cosa?</label>
      <textarea v-model="detallsBanda.observacions" placeholder="Altres comentaris, preferències o detalls rellevants..." rows="4"
        class="custom-textarea"></textarea>
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar" :disabled="!detallsBanda.instrument || detallsBanda.moments.length === 0 || !detallsBanda.necessitaPartitures"
        class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.banda-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
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
  gap: 12px;
}

.section-title {
  font-size: 1.125rem;
  color: #374151;
  font-weight: 600;
  margin: 0;
}

.custom-select {
  width: 100%;
  padding: 14px 16px;
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

.moments-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.moment-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.moment-card:hover {
  background-color: #fafafa;
  border-color: #d1d5db;
}

.moment-selected {
  background-color: #fffbeb !important;
  border-color: #f59e0b !important;
}

.moment-label {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.moment-text {
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
}

.moment-selected .moment-text {
  color: #b45309;
  font-weight: 600;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 14px;
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

.radio-label:hover {
  background-color: #fafafa;
}

.radio-selected {
  background-color: #fffbeb;
  border-color: #f59e0b;
  color: #b45309;
  font-weight: 600;
}

input[type="checkbox"],
input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #d97706;
  margin: 0;
  cursor: pointer;
}

.download-box {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-box p {
  margin: 0;
  font-size: 0.95rem;
  color: #1e40af;
}

.download-link {
  display: inline-flex;
  align-self: flex-start;
  background-color: #2563eb;
  color: #ffffff;
  text-decoration: none;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.download-link:hover {
  background-color: #1d4ed8;
}

.download-tip {
  font-size: 0.85rem !important;
  color: #60a5fa !important;
  line-height: 1.4;
}

.custom-textarea {
  width: 100%;
  padding: 14px 16px;
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
