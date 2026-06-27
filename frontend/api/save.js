import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Aquesta funció només accepta POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Mètode no permès' });
    }

    console.log("Rebuda petició de:", req.body.dadesPersonals?.nom);
    const inscripcio = req.body;
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
                detalls_rols: {
                    banda: inscripcio.detallsBanda,
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
