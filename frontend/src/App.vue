<script>
import DadesPersonals from './components/DadesPersonals.vue';
import BandaAuria from './components/BandaAuria.vue';

export default {
  name: 'App',
  data() {
    return {
      pasIndex: 0,
      dadesGlobals: {
        dadesPersonals: {},
        rols: [],
        detallsRols: {},
        tasquesTriades: [],
        sopar: {},
      }
    }
  },

  components: {
    DadesPersonals,
    BandaAuria
  },

  computed: {
    llistaPassos() {
      let passos = ['dades-personals']
      this.dadesGlobals.rols.forEach(rol => {
        passos.push(`pas-${rol}`)
      });

      passos.push('pas-logistica')
      passos.push('pas-sopar')
      return passos
    },

    pasActual() {
      return this.llistaPassos[this.pasIndex]
    },
  },

  methods: {
    guardarDadesPersonals(dades) {
      this.dadesGlobals.dadesPersonals = dades.personals
      this.dadesGlobals.rols = dades.rols
      this.seguent()
    },

    guardarBanda(dades) {
      this.dadesGlobals.dadesPersonals = dades.personals
      this.dadesGlobals.rols = dades.rols
      this.seguent()
    },

    seguent() {
      if (this.pasIndex < this.llistaPassos.length - 1) {
        this.pasIndex++;
      }
    },

    anterior() {
      if (this.pasIndex > 0) {
        this.pasIndex--;
      }
    }
  },

  mounted() {
    fetch('/api/initial_info')
      .then(x => x.json())
      .then(data => { console.log(data) })
  }
}
</script>

<template>
  <div class="wizard-container">
    <div class="progress">
      <span class="step-text">Pas {{ pasIndex + 1 }} de {{ llistaPassos.length }}</span>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: ((pasIndex + 1) / llistaPassos.length) * 100 + '%' }"></div>
      </div>
    </div>
    <DadesPersonals v-if="pasActual === 'dades-personals'" @continuar="guardarDadesPersonals" />
    <BandaAuria v-if="pasActual === 'pas-banda'" v-model="dadesGlobals.dadesPersonals.edat" @continuar="guardarBanda"
      @enrere="anterior" />
  </div>
</template>

<style>
body {
  background-color: #f3f4f6;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>

<style scoped>
.wizard-container {
  background: #ffffff;
  max-width: 600px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(0, 0, 0, 0.03);
  padding: 40px;
  box-sizing: border-box;
}

.progress {
  margin-bottom: 30px;
}

.step-text {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #d97706;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background-color: #fef3c7;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #f59e0b;
  border-radius: 10px;
  transition: width 0.3s ease;
}
</style>