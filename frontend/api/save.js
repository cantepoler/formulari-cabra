import { createClient } from '@supabase/supabase-js';
import { validarInscripcio } from './_validation.js';
import { sincronitzaSheets } from './_sheets.js';
import { enviaMailsInscripcio } from './_mail.js';

// Converteix "HH:MM" a minuts des de mitjanit. Si la tasca creua la
// mitjanit (p. ex. 23:00–01:00), la hora de fi es tracta com si fos
// l'endemà (+24h) perquè el rang es pugui comparar correctament.
function rangMinuts(t) {
    const aMinuts = (hhmm) => {
        if (!hhmm) return null;
        const [h, m] = String(hhmm).split(':').map(Number);
        return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
    };
    const inici = aMinuts(t.hora_inici);
    let fi = aMinuts(t.hora_fi);
    if (inici === null || fi === null) return null;
    if (fi <= inici) fi += 24 * 60;
    return [inici, fi];
}

// Retorna el primer parell de tasques que coincideixen en dia i que el seu
// interval horari es xafa, o null si no n'hi ha cap.
function trobaSolapament(tasques) {
    for (let i = 0; i < tasques.length; i++) {
        for (let j = i + 1; j < tasques.length; j++) {
            const a = tasques[i], b = tasques[j];
            if (a.dia !== b.dia) continue;
            const ra = rangMinuts(a), rb = rangMinuts(b);
            // Si a alguna de les dues li falta hora_inici/hora_fi no podem
            // comprovar-ho: no bloquegem (millor no bloquejar de més que
            // trencar una inscripció legítima per manca de dades).
            if (!ra || !rb) continue;
            if (ra[0] < rb[1] && rb[0] < ra[1]) return [a, b];
        }
    }
    return null;
}

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
        let tasquesInfo = [];

        if (tasques_demanades.length > 0) {
            // Necessitem dia + franja horària de cada tasca triada per poder
            // comprovar solapaments abans de reservar cap plaça.
            const { data, error: errorTasques } = await supabase
                .from('tasques')
                .select('id, nom, dia, hora, hora_inici, hora_fi')
                .in('id', tasques_demanades);

            if (errorTasques) throw errorTasques;
            tasquesInfo = data || [];

            if (tasquesInfo.length !== tasques_demanades.length) {
                return res.status(400).json({ error: 'Alguna de les tasques triades ja no existeix' });
            }

            const solapament = trobaSolapament(tasquesInfo);
            if (solapament) {
                return res.status(422).json({
                    error: 'Simultaneïtat de tasques',
                    detall: `"${solapament[0].nom}" i "${solapament[1].nom}" són el mateix dia i coincideixen en horari. Només pots triar-ne una de les dues.`,
                });
            }
        }

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
        const novaFila = {
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
        };

        const { data: filaInserida, error: errorInscripcio } = await supabase
            .from('inscripcions')
            .insert(novaFila)
            .select()
            .single();

        if (errorInscripcio) throw errorInscripcio;

        // PAS C: Sincronitzar amb Sheets i enviar els correus.
        // Reutilitzem tasquesInfo (ja consultat més amunt per comprovar
        // solapaments) per als noms/hores llegibles del correu.
        // Supabase ja té la dada desada (font de veritat), així que si
        // qualsevol d'aquests dos passos falla, no fem fallar la petició de
        // l'usuari: només ho loguejem perquè es pugui revisar/reenviar a mà.
        //
        // Els envoltem amb un timeout propi (8s) perquè si Gmail o Sheets
        // triguen massa, no es quedin penjats fins a esgotar el temps màxim
        // de la funció (cosa que faria que ni tan sols responguéssim a
        // l'usuari ni sortís cap log).
        const ambTimeout = (promesa, nom, ms = 8000) =>
            Promise.race([
                promesa,
                new Promise((resolve) => setTimeout(() => resolve([{ pestanya: nom, error: `Timeout (${ms}ms)` }]), ms)),
            ]);

        console.log('Iniciant sincronització amb Sheets i enviament de correus...');
        const [errorsSheets, errorsMail] = await Promise.all([
            ambTimeout(sincronitzaSheets(filaInserida, tasquesInfo), 'sheets'),
            ambTimeout(enviaMailsInscripcio(inscripcio, tasquesInfo), 'mail'),
        ]);
        console.log('Sincronització i correus acabats.');
        if (errorsSheets.length) console.error('Errors sincronitzant Sheets:', JSON.stringify(errorsSheets));
        if (errorsMail.length) console.error('Errors enviant correus:', JSON.stringify(errorsMail));

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error guardant inscripció:", error);
        res.status(500).json({ error: "Error del servidor guardant la inscripció" });
    }
}
