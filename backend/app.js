import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;

// 1. CONNEXIÓ A SUPABASE
// A producció (Vercel) això haurà d'anar al fitxer .env per seguretat
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares bàsics
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------
// ENDPOINT 1: Obtenir horaris (Agrupant els dies per a Vue)
// ---------------------------------------------------------
app.get('/api/initial_info', async (req, res) => {
    try {
        // Demanem totes les files de la taula 'tasques'
        const { data: tasques, error } = await supabase.from('tasques').select('*');
        if (error) throw error;

        // Transformem l'array de Supabase a l'objecte que s'espera el teu Frontend
        const aforaments = {
            estat_formulari: "START",
            tasques_logistiques: {}
        };

        tasques.forEach(tasca => {
            // Si el dia (ex: dia10) encara no existeix a l'objecte, el creem
            if (!aforaments.tasques_logistiques[tasca.dia]) {
                aforaments.tasques_logistiques[tasca.dia] = [];
            }
            aforaments.tasques_logistiques[tasca.dia].push(tasca);
        });

        res.status(200).json(aforaments);

    } catch (error) {
        console.error("Error carregant tasques des de Supabase:", error);
        res.status(500).json({ error: "Error intern del servidor" });
    }
});

// ---------------------------------------------------------
// ENDPOINT 2: Guardar inscripció (Amb transacció segura)
// ---------------------------------------------------------
app.post('/api/save', async (req, res) => {
    console.log("Rebuda petició de:", req.body.dadesPersonals?.nom);
    const inscripcio = req.body;
    const tasques_demanades = inscripcio.tasquesTriades || [];

    try {
        // PAS A: Restar places de les tasques (Només si n'ha triat alguna)
        if (tasques_demanades.length > 0) {
            // Cridem la funció SQL que hem creat a Supabase
            const { data: placesSuficients, error: errorRpc } = await supabase.rpc('reservar_tasques', {
                tasques_ids: tasques_demanades
            });

            console.log("🔍 Tasques que arriben de Vue:", tasques_demanades);
            console.log("🔍 Resposta de la BD (placesSuficients):", placesSuficients); if (errorRpc) throw errorRpc;

            // Si algú se li ha avançat i no queden places...
            if (!placesSuficients) {
                // Obtenim els aforaments actualitzats de la BD per enviar-los al Frontend
                const { data: tasquesActualitzades } = await supabase.from('tasques').select('*');

                const aforamentsActualitzats = { tasques_logistiques: {} };
                tasquesActualitzades.forEach(t => {
                    if (!aforamentsActualitzats.tasques_logistiques[t.dia]) aforamentsActualitzats.tasques_logistiques[t.dia] = [];
                    aforamentsActualitzats.tasques_logistiques[t.dia].push(t);
                });

                // Avortem i enviem 409
                return res.status(409).json(aforamentsActualitzats);
            }
        }

        // PAS B: Guardar l'usuari a la taula inscripcions
        // (Aquest codi s'executa només si les places eren suficients)
        const { error: errorInscripcio } = await supabase
            .from('inscripcions')
            .insert({
                nom: inscripcio.dadesPersonals.nom,
                cognom: inscripcio.dadesPersonals.cognom,
                correu: inscripcio.dadesPersonals.correu,
                telefon: inscripcio.dadesPersonals.telefon,
                data_naixement: inscripcio.dadesPersonals.dataNaixement || null,
                responsable_legal: inscripcio.dadesPersonals.responsable || null,
                rols: inscripcio.rols || [],
                tasques_logistiques: tasques_demanades,
                // Tota l'estructura de Pinia va a parar dins d'aquesta columna JSONB
                detalls_rols: {
                    banda: inscripcio.detallsBanda,
                    sopar: inscripcio.sopar
                }
            });

        if (errorInscripcio) throw errorInscripcio;

        // Si tot ha anat bé, responguem amb èxit!
        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error crític guardant inscripció:", error);
        res.status(500).json({ error: "Error del servidor guardant la inscripció" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend escoltant al port ${PORT}`);
});