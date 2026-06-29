<script>
import DadesPersonals from './components/DadesPersonals.vue';
import BandaAuria from './components/BandaAuria.vue';
import PasLogistica from './components/PasLogistica.vue';
import PasSopar from './components/PasSopar.vue';
import { useFormStore } from './stores/formulari.js';
import { mapState } from 'pinia';
import PasColaboradors from './components/PasColaboradors.vue';
import PasDanses from './components/PasDanses.vue';
import PasOrganitzacio from './components/PasOrganitzacio.vue';
import PasTeatre from './components/PasTeatre.vue';

export default {
  name: 'App',
  components: {
    DadesPersonals,
    BandaAuria,
    PasLogistica,
    PasSopar,
    PasColaboradors,
    PasDanses,
    PasOrganitzacio,
    PasTeatre
  },

  data() {
    return {
      pasIndex: 0,
      inscripcioCompletada: false,
      aforaments: {},
    }
  },

  computed: {
    ...mapState(useFormStore, ['rols']),

    llistaPassos() {
      let passos = ['dades-personals']
      this.rols.forEach(rol => {
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
    enviarFormulari() {
      const store = useFormStore()

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store.dadesPerEnviar)
      };

      console.log("Enviant dades al servidor...");

      fetch('/api/save', requestOptions)
        .then(async response => {
          if (response.status === 200) {
            this.inscripcioCompletada = true;
          }
          else if (response.status === 409) {
            // COL·LISIÓ DE PLACES
            const dadesActualitzades = await response.json();
            this.aforaments = dadesActualitzades;

            alert("Ups! Algú se t'ha avançat i algunes de les tasques que havies triat s'han quedat sense lloc. Torna a revisar l'horari!");

            this.pasIndex = this.llistaPassos.indexOf('pas-logistica');
          }
          else {
            throw new Error(`Error desconegut: ${response.status}`);
          }
        })
        .catch(error => {
          console.error("S'ha produït un error de xarxa:", error);
          alert("No s'ha pogut connectar amb el servidor. Revisa la teva connexió.");
        });
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
}
</script>

<template>
  <div class="page-shell">

    <header class="festa-header">
      <h1 class="festa-title">Cabra d'Or <span class="festa-year">2026</span></h1>
      <p class="festa-subtitle">Formulari de participació</p>
      <div class="festa-divider" aria-hidden="true"></div>
    </header>

    <div class="wizard-container">

      <div v-if="!inscripcioCompletada">
        <div class="progress">
          <span class="step-text">Pas {{ pasIndex + 1 }} de {{ llistaPassos.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: ((pasIndex + 1) / llistaPassos.length) * 100 + '%' }"></div>
          </div>
        </div>

        <DadesPersonals v-if="pasActual === 'dades-personals'" @continuar="seguent" />
        <BandaAuria v-if="pasActual === 'pas-banda'" @continuar="seguent" @enrere="anterior" />
        <PasColaboradors v-if="pasActual === 'pas-colabos'" @continuar="seguent" @enrere="anterior" />
        <PasOrganitzacio v-if="pasActual === 'pas-organitzacio'" @continuar="seguent" @enrere="anterior" />
        <PasTeatre v-if="pasActual === 'pas-teatre'" @continuar="seguent" @enrere="anterior" />
        <PasDanses v-if="pasActual === 'pas-danses'" @continuar="seguent" @enrere="anterior" />


        <PasLogistica v-if="pasActual === 'pas-logistica'" :aforaments="aforaments" @continuar="seguent"
          @enrere="anterior" />
        <PasSopar v-if="pasActual === 'pas-sopar'" @enviar="enviarFormulari" @enrere="anterior" />

      </div>

      <div v-else class="success-screen">
        <div class="success-icon">🐐✨</div>
        <h2>Inscripció completada!</h2>
        <div class="festa-divider festa-divider--small" aria-hidden="true"></div>
        <p>Moltes gràcies per apuntar-te a la Cabra d'Or 2026. Ens veurem molt aviat a la plaça!</p>
        <button class="btn-restart" @click="window.location.reload()">Fer una nova inscripció</button>
      </div>

    </div>

  </div>
</template>

<style>
/* Els teus estils globals */
body {
  font-family: var(--font-body, system-ui, sans-serif);
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
/* Contenidor general de la pàgina (capçalera + targeta) */
.page-shell {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* --- Targeta principal --- */
.wizard-container {
  position: relative;
  background: #ffffff;
  background: var(--cabra-surface, #ffffff);
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 45px -12px rgba(146, 64, 14, 0.18), 0 8px 18px -6px rgba(146, 64, 14, 0.08);
  border: 1px solid var(--cabra-border, #ecdfc4);
  padding: 40px;
  box-sizing: border-box;
}

/* Filet daurat decoratiu a la part superior de la targeta */
.wizard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg,
      var(--cabra-gold-700, #92400e),
      var(--cabra-gold-400, #f59e0b) 50%,
      var(--cabra-gold-700, #92400e));
}

.progress {
  margin-bottom: 30px;
}

.step-text {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--cabra-gold-600, #b45309);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background-color: var(--cabra-gold-100, #fef3c7);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cabra-gold-600, #b45309), var(--cabra-gold-400, #f59e0b));
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.45);
  transition: width 0.3s ease;
}

/* --- Peu de pàgina --- */
.festa-footer {
  margin: 22px 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--cabra-ink-soft, #6b5d4d);
  letter-spacing: 0.02em;
}

/* --- ESTILS DE LA PANTALLA D'ÈXIT --- */
.success-screen {
  text-align: center;
  padding: 20px 0;
  animation: fadeIn 0.5s ease-in-out;
}

.success-icon {
  font-size: 4.5rem;
  margin-bottom: 14px;
}

.success-screen h2 {
  font-family: var(--font-display, serif);
  color: var(--cabra-gold-600, #b45309);
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.festa-divider--small {
  margin: 16px auto 22px;
}

.success-screen p {
  color: var(--cabra-ink-soft, #6b5d4d);
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 30px;
}

.btn-restart {
  background-color: var(--cabra-gold-50, #fffbeb);
  color: var(--cabra-gold-700, #92400e);
  border: 1px solid var(--cabra-gold-200, #fde68a);
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-restart:hover {
  background-color: var(--cabra-gold-100, #fef3c7);
  border-color: var(--cabra-gold-400, #f59e0b);
  color: var(--cabra-gold-600, #b45309);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
