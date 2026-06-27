import { createClient } from '@supabase/supabase-js';

// Import de les variables d'entorn des del dashboard de Vercel
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Mètode no permès' });
    }

    try {
        const { data: tasques, error } = await supabase.from('tasques').select('*');
        if (error) throw error;

        const aforaments = {
            estat_formulari: "START",
            tasques_logistiques: {}
        };

        tasques.forEach(tasca => {
            if (!aforaments.tasques_logistiques[tasca.dia]) {
                aforaments.tasques_logistiques[tasca.dia] = [];
            }
            aforaments.tasques_logistiques[tasca.dia].push(tasca);
        });

        res.status(200).json(aforaments);

    } catch (error) {
        console.error("Error carregant tasques:", error);
        res.status(500).json({ error: "Error intern del servidor" });
    }
}
