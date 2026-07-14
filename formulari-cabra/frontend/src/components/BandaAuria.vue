<script>
import { useFormStore } from '@/stores/formulari';
import { mapState, mapWritableState } from 'pinia';
export default {
  emits: ['continuar', 'enrere'],
  data() {
    return {
      instrumentsDisponibles: [
        'Flauta', 'Clarinet en Sib', 'Tarota/Oboè', 'Saxo Alt',
        'Saxo Tenor', 'Saxo Baríton', 'Trompeta en Sib',
        'Trompa en Fa', 'Trombó', 'Fiscorn', 'Tuba',
        'Percussió', 'Pandero Quadrat'
      ],
      // tipus 'tots' → tothom | 'banda' → >=15 (+ 13-14 si avisJoves) | 'contrabanda' → <15
      totsElsMoments: [
        { id: 'm1', text: '10/08 (nit) - Baixada del castell - Banda',      tipus: 'banda' },
        { id: 'm2', text: '11/08 (matí) - Tallers + Passacarrers',          tipus: 'tots' },
        { id: 'm2b', text: "11/08 (matí) - Actuació de la contrabanda - Banda", tipus: 'tots' },
        { id: 'm3', text: '11/08 (tarda) - Passacarrers + teatre - Banda',  tipus: 'banda', avisJoves: true },
        { id: 'm4', text: '11/08 (nit) - Balls - Banda',                    tipus: 'banda' },
        { id: 'm5', text: '11/08 (nit) - Tancada de la cabra - Banda',      tipus: 'banda' },
      ]
    }
  },
  computed: {
    ...mapWritableState(useFormStore, ['detallsBanda']),
    ...mapState(useFormStore, ['potTocarBanda', 'potTocarCercavila']),
    momentsFiltrats() {
      if (this.potTocarBanda === null) return this.totsElsMoments;
      return this.totsElsMoments.filter(m => {
        if (m.tipus === 'tots') return true;
        if (m.tipus === 'banda') {
          if (this.potTocarBanda) return true;
          return m.avisJoves && this.potTocarCercavila;
        }
        return !this.potTocarBanda; // contrabanda
      });
    },
  },
  methods: {
    esAvisJoves(m) { return m.avisJoves && this.potTocarCercavila; },
    enviar() { this.$emit('continuar'); }
  }
}
</script>

<template>
  <div class="banda-wrapper">
    <div class="header-text">
      <h1>Banda Àuria</h1>
    </div>

    <div class="info-box">
      <p>Bandarra! Diga'ns en quins moments podem comptar amb tu i el teu instrument (esperem que sigui a tots)!</p>
    </div>

    <div class="partitures-box">
      <p class="partitures-intro">De moment, pots estudiar amb aquestes partitures:</p>
      <a href="https://www.dropbox.com/scl/fo/2yxgqmnuotcy7s0uc9kav/h?rlkey=tsyggfifx2rzcmfunfvsy57v9&st=tt2el6rp&dl=0"
        target="_blank" rel="noopener" class="partitures-link">
        Accedir al Dropbox de Partitures
      </a>
      <p class="partitures-tip">
        Et recomanem que te les sàpigues de memòria, que així gaudiràs més de la festa!
        Si no, pensa a buscar un "faristolet" apte pel teu instrument!
        (Si el busques per internet, recorda que en castellà es diu <em>atril</em>.
        Però sempre és millor comprar al comerç de proximitat!)
      </p>
    </div>

    <div class="form-section">
      <label class="section-title">Quin instrument toques? <span class="required">*</span></label>
      <select v-model="detallsBanda.instrument" class="custom-select">
        <option value="" disabled selected>Tria el teu instrument</option>
        <option v-for="inst in instrumentsDisponibles" :key="inst" :value="inst">{{ inst }}</option>
      </select>
    </div>

    <div class="form-section">
      <label class="section-title">En quins moments tocaràs? <span class="required">*</span></label>
      <div class="moments-grid">
        <div v-for="moment in momentsFiltrats" :key="moment.id" class="moment-card"
          :class="{ 'moment-selected': detallsBanda.moments.includes(moment.text) }">
          <label class="moment-label">
            <input type="checkbox" :value="moment.text" v-model="detallsBanda.moments">
            <div class="moment-content">
              <span class="moment-text">{{ moment.text }}</span>
              <span v-if="esAvisJoves(moment)" class="avis-joves">
                ⚠️ Com que ets de la contrabanda, aquest dia només podràs tocar durant el
                passacarrers. Al teatre, en aquesta franja, no hi podràs pujar.
              </span>
            </div>
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

    <div class="form-section">
      <label class="section-title">Vols afegir alguna cosa?</label>
      <textarea v-model="detallsBanda.observacions"
        placeholder="Altres comentaris, preferències o detalls rellevants..."
        rows="4" class="custom-textarea"></textarea>
    </div>

    <div class="actions">
      <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>
      <button @click="enviar"
        :disabled="!detallsBanda.instrument || detallsBanda.moments.length === 0 || !detallsBanda.necessitaPartitures"
        class="btn-primary">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.banda-wrapper { display: flex; flex-direction: column; gap: 28px; }
.header-text h1 { margin: 0; color: #111827; font-size: 1.875rem; font-weight: 800; }
.info-box { background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; }
.info-box p { margin: 0; color: #b45309; font-size: 0.95rem; line-height: 1.5; }
.partitures-box { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 18px 20px; border-radius: 8px; display: flex; flex-direction: column; gap: 10px; }
.partitures-intro { margin: 0; font-size: 0.95rem; color: #1e40af; font-weight: 600; }
.partitures-link { display: inline-flex; align-self: flex-start; background-color: #2563eb; color: #fff; text-decoration: none; padding: 9px 18px; font-weight: 600; border-radius: 6px; font-size: 0.9rem; transition: background-color 0.2s ease; }
.partitures-link:hover { background-color: #1d4ed8; }
.partitures-tip { margin: 0; font-size: 0.85rem; color: #3b82f6; line-height: 1.5; }
.form-section { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-size: 1.05rem; color: #374151; font-weight: 600; margin: 0; }
.required { color: #ef4444; }
.custom-select { width: 100%; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background-color: #f9fafb; transition: all 0.2s ease; font-family: inherit; cursor: pointer; }
.custom-select:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245,158,11,0.15); background-color: #fff; }
.moments-grid { display: flex; flex-direction: column; gap: 8px; }
.moment-card { border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fff; transition: all 0.2s ease; }
.moment-card:hover { background-color: #fafafa; border-color: #d1d5db; }
.moment-selected { background-color: #fffbeb !important; border-color: #f59e0b !important; }
.moment-label { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box; }
.moment-content { display: flex; flex-direction: column; gap: 4px; }
.moment-text { font-size: 0.95rem; color: #374151; font-weight: 500; }
.moment-selected .moment-text { color: #b45309; font-weight: 600; }
.avis-joves { font-size: 0.8rem; color: #d97706; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; padding: 4px 8px; line-height: 1.4; }
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.radio-label { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fff; cursor: pointer; transition: all 0.2s ease; font-size: 0.95rem; color: #374151; font-weight: 500; }
.radio-label:hover { background-color: #fafafa; }
.radio-selected { background-color: #fffbeb; border-color: #f59e0b; color: #b45309; font-weight: 600; }
input[type="checkbox"], input[type="radio"] { width: 18px; height: 18px; accent-color: #d97706; margin: 0; cursor: pointer; flex-shrink: 0; }
.custom-textarea { width: 100%; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background-color: #f9fafb; box-sizing: border-box; transition: all 0.2s ease; font-family: inherit; resize: vertical; }
.custom-textarea:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245,158,11,0.15); background-color: #fff; }
.actions { display: flex; justify-content: space-between; margin-top: 4px; border-top: 1px solid #e5e7eb; padding-top: 24px; }
.btn-primary { background-color: #d97706; color: #fff; border: none; padding: 14px 32px; font-size: 1rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(217,119,6,0.2); }
.btn-primary:hover:not(:disabled) { background-color: #b45309; box-shadow: 0 6px 12px rgba(217,119,6,0.3); transform: translateY(-1px); }
.btn-primary:disabled { background-color: #e5e7eb; color: #9ca3af; cursor: not-allowed; box-shadow: none; }
.btn-secondary { background-color: #fff; color: #4b5563; border: 1px solid #d1d5db; padding: 14px 32px; font-size: 1rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.btn-secondary:hover { background-color: #f9fafb; border-color: #9ca3af; color: #1f2937; }
@media (max-width: 540px) { .actions { flex-direction: column-reverse; gap: 10px; } .btn-primary, .btn-secondary { width: 100%; text-align: center; } }
</style>

