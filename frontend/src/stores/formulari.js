import { defineStore } from 'pinia';

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

    consentiments: {
      tractamentDades: false,
      dretImatge: false,
      responsabilitatMenors: false,
    },

    detallsBanda: {
      instrument: '',
      moments: [],
      necessitaPartitures: '',
      observacions: '',
    },
    detallsOrganitzacio: {
      comissions: [],
    },
    detallsDanses: {
      ball: '',
      talla: '',
      observacions: '',
    },
    detallsTeatre: {
      necessitatConcreta: '',
    },
    detallsColaboradors: {
      comColLabora: '',
    },

    tasquesSeleccionades: [],
    sopar: {
      volSopar: null,
      alergies: [],
      altresAlergiesText: '',
    },
  }),

  // Any de referència de la festa: l'edat es compta "per cursos" (per any de
  // naixement), no per data exacta de naixement, tal com es fa habitualment
  // en aquest tipus d'activitats.
  ANY_FESTA: 2026,

  getters: {
    // Edat "per cursos": anys que es compleixen (o s'han complert) durant
    // l'any de la festa, independentment del dia i mes exactes de naixement.
    edat(state) {
      if (!state.personals.dataNaixement) return null;
      const naixement = new Date(state.personals.dataNaixement);
      if (isNaN(naixement.getTime())) return null;
      return 2026 - naixement.getFullYear();
    },

    esMenor16() { return this.edat !== null && this.edat < 16; },
    esMenor14() { return this.edat !== null && this.edat < 14; },

    // >= 15: banda completa | 13-14 (a partir del 2014): contrabanda però poden fer cercavila
    potTocarBanda() {
      if (this.edat === null) return null;
      return this.edat >= 15;
    },
    potTocarCercavila() {
      return this.edat !== null && this.edat >= 13 && this.edat < 15;
    },

    soparPerEnviar(state) {
      return {
        sopar: state.sopar.volSopar,
        alergies: state.sopar.volSopar ? state.sopar.alergies : [],
        altresAlergies: (state.sopar.volSopar && state.sopar.alergies.includes('altres'))
          ? state.sopar.altresAlergiesText : '',
      };
    },

    dadesPerEnviar(state) {
      return {
        dadesPersonals: state.personals,
        rols: state.rols,
        consentiments: state.consentiments,
        detallsBanda: state.detallsBanda,
        detallsOrganitzacio: state.detallsOrganitzacio,
        detallsDanses: state.detallsDanses,
        detallsTeatre: state.detallsTeatre,
        detallsColaboradors: state.detallsColaboradors,
        tasquesTriades: state.tasquesSeleccionades,
        sopar: this.soparPerEnviar,
        edatCalculada: this.edat,
      };
    },
  },

  actions: {},
});
