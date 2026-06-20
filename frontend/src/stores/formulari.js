import { defineStore } from 'pinia';

// This data is accessible to all components
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
    sopar: {}
  }),

  // Returns a new property called fullName; this is optional
  getters: {
    esMenor16: (state) => {
      if (!state.personals.dataNaixement) return null;
      const avui = new Date();
      const naixement = new Date(state.personals.dataNaixement);
      let edat = avui.getFullYear() - naixement.getFullYear();
      const mes = avui.getMonth() - naixement.getMonth();
      if (mes < 0 || (mes === 0 && avui.getDate() < naixement.getDate())) {
        edat--;
      }

      return edat !== null && edat < 16;
    }
  },


  // these action functions stores the value of firstName and lastName defined in the state, the value will come from component that takes these information as input
  actions: {
  },
});
