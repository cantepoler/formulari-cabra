import { defineStore } from 'pinia';

// Aquest estat és accessible per tots els components del wizard
export const useFormStore = defineStore('formulari', {
  state: () => ({
    personals: {
      nom: '',
      cognom: '',
      dataNaixement: '',
      correu: '',
      telefon: '',
      responsable: '',
    },
    rols: [],
    detallsBanda: {
      instrument: '',
      moments: [],
      necessitaPartitures: '',
      observacions: '',
    },
    tasquesSeleccionades: [],
    sopar: {
      volSopar: null,
      alergies: [],
      altresAlergiesText: '',
    },
  }),

  getters: {
    edat(state) {
      if (!state.personals.dataNaixement) return null;

      const avui = new Date();
      const naixement = new Date(state.personals.dataNaixement);
      let edat = avui.getFullYear() - naixement.getFullYear();
      const mesos = avui.getMonth() - naixement.getMonth();

      if (mesos < 0 || (mesos === 0 && avui.getDate() < naixement.getDate())) {
        edat--;
      }

      return edat;
    },

    // Per sota dels 16 anys cal demanar les dades del tutor legal.
    esMenor16() {
      return this.edat !== null && this.edat < 16;
    },

    potTocarBanda() {
      if (this.edat === null) return null;
      return this.edat >= 15;
    },

    soparPerEnviar(state) {
      return {
        sopar: state.sopar.volSopar,
        alergies: state.sopar.volSopar ? state.sopar.alergies : [],
        altresAlergies: (state.sopar.volSopar && state.sopar.alergies.includes('altres'))
          ? state.sopar.altresAlergiesText
          : '',
      };
    },

    dadesPerEnviar(state) {
      return {
        dadesPersonals: state.personals,
        rols: state.rols,
        detallsBanda: state.detallsBanda,
        tasquesTriades: state.tasquesSeleccionades,
        sopar: this.soparPerEnviar,
        edatCalculada: this.edat,
      };
    },
  },

  actions: {
  },
});
