<script>
import { useFormStore } from '@/stores/formulari';
import { mapWritableState } from 'pinia';

export default {
    name: 'SoparMiddleware',
    emits: ['enviar', 'enrere'],

    computed: {
        ...mapWritableState(useFormStore, ['sopar'])
    },

    methods: {
        enviar() {
            this.$emit('enviar')
        }
    }
}
</script>

<template>
    <div class="sopar-wrapper">
        <div class="header-text">
            <h1>Sopar Popular</h1>
            <h3>Últim pas: Tancament de la jornada</h3>
        </div>

        <div class="info-box">
            <p><strong>El colofó de la festa!</strong> Com cada any, quan acabem de recollir farem un sopar popular per
                a tota la gent que ha col·laborat i participat activament. Ens encantaria que t'hi quedessis.</p>
        </div>

        <div class="form-section">
            <label class="section-title">Vindràs a sopar?</label>
            <div class="radio-group">
                <label class="radio-label" :class="{ 'radio-selected': sopar.volSopar === true }">
                    <input type="radio" :value="true" v-model="sopar.volSopar">
                    <span>Sí, m'hi quedo!</span>
                </label>
                <label class="radio-label" :class="{ 'radio-selected': sopar.volSopar === false }">
                    <input type="radio" :value="false" v-model="sopar.volSopar">
                    <span>No, marxaré abans.</span>
                </label>
            </div>
        </div>

        <div class="form-section" v-if="sopar.volSopar === true">
            <label class="section-title">Tens alguna al·lèrgia o preferència alimentària?</label>
            <div class="checkbox-group">
                <label class="checkbox-label" :class="{ 'checkbox-selected': sopar.alergies.includes('celiac') }">
                    <input type="checkbox" value="celiac" v-model="sopar.alergies">
                    <span class="checkbox-text">Celíac / Intolerància al gluten</span>
                </label>
                <label class="checkbox-label" :class="{ 'checkbox-selected': sopar.alergies.includes('vegetaria') }">
                    <input type="checkbox" value="vegetaria" v-model="sopar.alergies">
                    <span class="checkbox-text">Vegetarià / Vegà</span>
                </label>
                <label class="checkbox-label" :class="{ 'checkbox-selected': sopar.alergies.includes('altres') }">
                    <input type="checkbox" value="altres" v-model="sopar.alergies">
                    <span class="checkbox-text">Altres</span>
                </label>
            </div>

            <div class="extra-input" v-if="sopar.alergies.includes('altres')">
                <input type="text" class="custom-input" placeholder="Especifica la teva al·lèrgia..."
                    v-model="sopar.altresAlergiesText">
            </div>
        </div>

        <div class="actions">
            <button @click="$emit('enrere')" class="btn-secondary">Enrere</button>

            <button @click="enviar"
                :disabled="sopar.volSopar === null || (sopar.volSopar && sopar.alergies.includes('altres') && sopar.altresAlergiesText.trim() === '')"
                class="btn-primary">
                Confirmar Inscripció
            </button>
        </div>
    </div>
</template>

<style scoped>
.sopar-wrapper {
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

.radio-group,
.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.radio-label,
.checkbox-label {
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

.radio-label:hover,
.checkbox-label:hover {
    background-color: #fafafa;
}

.radio-selected,
.checkbox-selected {
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

.extra-input {
    margin-top: 5px;
}

.custom-input {
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
}

.custom-input:focus {
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
    background-color: #10b981;
    /* Canviat a verd per indicar "Finalitzar" */
    color: #ffffff;
    border: none;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

.btn-primary:hover:not(:disabled) {
    background-color: #059669;
    box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
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
