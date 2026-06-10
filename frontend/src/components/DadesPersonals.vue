<script>
export default {
    emits: ['continuar'],

    data() {
        return {
            personals: {
                nom: '',
                cognom: '',
                dataNaixement: '',
                correu: '',
                telefon: '',
                responsable: '',
            },
            rols: []
        }
    },

    computed: {
        calculaEdat() {
            if (!this.personals.dataNaixement) return null;
            const avui = new Date()
            const naixement = new Date(this.personals.dataNaixement)
            let edat = avui.getFullYear() - naixement.getFullYear()
            const mes = avui.getMonth() - naixement.getMonth();
            if (mes < 0 || (mes === 0 && avui.getDate() < naixement.getDate())) {
                edat--;
            }
            return edat;
        },

        esMenor16() {
            return this.calculaEdat !== null && this.calculaEdat < 16
        }
    },

    methods: {
        continuar() {
            this.$emit('continuar', {
                personals: {
                    ...this.personals,
                    edat: this.calculaEdat
                },
                rols: this.rols
            })
        }
    }
}
</script>

<template>
    <div class="dades-wrapper">
        <div class="header-text">
            <h1>Dades personals</h1>
            <h3>Introdueix la teva informació per a la inscripció</h3>
        </div>

        <div class="form-grid">
            <div class="form-group">
                <input type="text" placeholder="Nom" v-model="personals.nom">
            </div>
            <div class="form-group">
                <input type="text" placeholder="Cognom" v-model="personals.cognom">
            </div>
            <div class="form-group full-width">
                <input type="date" v-model="personals.dataNaixement">
            </div>
            <div class="form-group">
                <input type="email" placeholder="Correu electrònic" v-model="personals.correu">
            </div>
            <div class="form-group">
                <input type="number" placeholder="Telèfon" v-model="personals.telefon">
            </div>
            <div class="form-group full-width" v-if="esMenor16">
                <div class="alert-box">
                    <p>Ets menor de 16 anys. Necessitem les dades del teu tutor legal.</p>
                    <input type="text" placeholder="Nom del Responsable" v-model="personals.responsable">
                </div>
            </div>
        </div>

        <div class="roles-section">
            <h3>Selecciona els teus rols:</h3>
            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" value="organitzacio" v-model="rols">
                    Organització
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="banda" v-model="rols">
                    Banda Àuria
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="teatre" v-model="rols">
                    Teatre
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" value="danses" v-model="rols">
                    Danses
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" value="colabos" v-model="rols">
                    Col·laboradors
                </label>
            </div>
        </div>

        <div class="actions">
            <button @click="continuar">Continuar</button>
        </div>
    </div>
</template>

<style scoped>
.dades-wrapper {
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

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

input[type="text"],
input[type="date"],
input[type="email"],
input[type="number"] {
    width: 100%;
    padding: 14px 16px;
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

.alert-box {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 16px;
    border-radius: 6px;
}

.alert-box p {
    margin: 0 0 10px 0;
    color: #b91c1c;
    font-size: 0.9rem;
    font-weight: 600;
}

.alert-box input {
    background-color: #ffffff;
    border-color: #fca5a5;
}

.roles-section h3 {
    margin: 0 0 16px 0;
    font-size: 1.125rem;
    color: #374151;
    font-weight: 600;
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 1rem;
    color: #4b5563;
    padding: 14px 16px;
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

input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #d97706;
    cursor: pointer;
    margin: 0;
}

.actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
}

button {
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

button:hover {
    background-color: #b45309;
    box-shadow: 0 6px 12px rgba(217, 119, 6, 0.3);
    transform: translateY(-1px);
}

button:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(217, 119, 6, 0.2);
}

@media (max-width: 600px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>