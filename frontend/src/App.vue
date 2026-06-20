<script>
import DadesPersonals from './components/DadesPersonals.vue';
import BandaAuria from './components/BandaAuria.vue';
import PasLogistica from './components/PasLogistica.vue';
import PasSopar from './components/PasSopar.vue';

export default {
  name: 'App',
  components: {
    DadesPersonals,
    BandaAuria,
    PasLogistica,
    PasSopar
  },

  data() {
    return {
      pasIndex: 0,
      inscripcioCompletada: false,
      aforaments: {}, 
      dadesGlobals: {
        dadesPersonals: {},
        rols: [],
        detallsRols: {},
        tasquesTriades: [],
        sopar: {},
      },
    }
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
      this.dadesGlobals.detallsRols.detallsBanda = dades
      this.seguent()
    },

    guardarAforaments(dades) {
      this.dadesGlobals.tasquesTriades = dades.tasquesSeleccionades
      this.seguent()
    },

    enviarFormulari(dadesPasSopar) {
      this.dadesGlobals.sopar = dadesPasSopar;

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.dadesGlobals)
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
  <div class="wizard-container">
    
    <div v-if="!inscripcioCompletada">
      <div class="progress">
        <span class="step-text">Pas {{ pasIndex + 1 }} de {{ llistaPassos.length }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: ((pasIndex + 1) / llistaPassos.length) * 100 + '%' }"></div>
        </div>
      </div>
      
      <DadesPersonals v-if="pasActual === 'dades-personals'" @continuar="guardarDadesPersonals" />
      <BandaAuria v-if="pasActual === 'pas-banda'" :edat="dadesGlobals.dadesPersonals.edat" @continuar="guardarBanda" @enrere="anterior" />
      <PasLogistica v-if="pasActual === 'pas-logistica'" :aforaments="aforaments" @continuar="guardarAforaments" @enrere="anterior" />
      <PasSopar v-if="pasActual === 'pas-sopar'" @enviar="enviarFormulari" @enrere="anterior" />
    </div>

    <div v-else class="success-screen">
      <div class="success-icon">🎉</div>
      <h2>Inscripció Completada!</h2>
      <p>Moltes gràcies per apuntar-te a la Cabra d'Or 2026. Ens veurem molt aviat a la plaça!</p>
      <button class="btn-restart" @click="window.location.reload()">Fer una nova inscripció</button>
    </div>

  </div>
</template>

<style>
/* Els teus estils globals */
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
/* Els teus estils del contenidor */
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

/* ESTILS DE LA PANTALLA D'ÈXIT */
.success-screen {
  text-align: center;
  padding: 20px 0;
  animation: fadeIn 0.5s ease-in-out;
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.success-screen h2 {
  color: #10b981; /* Verd èxit */
  font-size: 2rem;
  margin-bottom: 10px;
}

.success-screen p {
  color: #4b5563;
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 30px;
}

.btn-restart {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-restart:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>