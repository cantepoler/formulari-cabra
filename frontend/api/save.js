import { createClient } from '@supabase/supabase-js';
import { validarInscripcio } from './_validation.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Aquesta funció només accepta POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Mètode no permès' });
    }

    const inscripcio = req.body;

    // --- VALIDACIÓ ---
    // Mai ens refiem del que arriba del client: comprovem la forma i el
    // contingut de les dades abans de fer cap operació a la base de dades.
    const errors = validarInscripcio(inscripcio);
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Dades no vàlides', detalls: errors });
    }

    console.log("Rebuda petició de:", inscripcio.dadesPersonals?.nom);
    const tasques_demanades = inscripcio.tasquesTriades || [];

    try {
        // PAS A: Restar places de les tasques (Només si n'ha triat alguna)
        if (tasques_demanades.length > 0) {
            const { data: placesSuficients, error: errorRpc } = await supabase.rpc('reservar_tasques', {
                tasques_ids: tasques_demanades
            });

            if (errorRpc) throw errorRpc;

            if (!placesSuficients) {
                const { data: tasquesActualitzades } = await supabase.from('tasques').select('*');

                const aforamentsActualitzats = { tasques_logistiques: {} };
                tasquesActualitzades.forEach(t => {
                    if (!aforamentsActualitzats.tasques_logistiques[t.dia]) {
                        aforamentsActualitzats.tasques_logistiques[t.dia] = [];
                    }
                    aforamentsActualitzats.tasques_logistiques[t.dia].push(t);
                });

                return res.status(409).json(aforamentsActualitzats);
            }
        }

        // PAS B: Guardar l'usuari a la taula inscripcions
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
                // Totes les dades específiques de cada rol es guarden aquí.
                // Abans només es guardaven 'banda' i 'sopar' — la resta de
                // pestanyes (organització, danses, teatre, col·laboradors)
                // s'enviaven però mai arribaven a desar-se.
            consentiments: inscripcio.consentiments || {},
                detalls_rols: {
                    organitzacio: inscripcio.detallsOrganitzacio || null,
                    banda: inscripcio.detallsBanda || null,
                    teatre: inscripcio.detallsTeatre || null,
                    danses: inscripcio.detallsDanses || null,
                    colaboradors: inscripcio.detallsColaboradors || null,
                    sopar: inscripcio.sopar
                }
	    });

        if (errorInscripcio) throw errorInscripcio;

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error guardant inscripció:", error);
        res.status(500).json({ error: "Error del servidor guardant la inscripció" });
    }
}
