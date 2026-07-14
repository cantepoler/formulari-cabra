import { google } from 'googleapis';

// api/_sheets.js — prefix "_" = Vercel no el tracta com endpoint
//
// Sheets és un mirall de lectura, no la font de veritat: Supabase és la BD
// real. Aquest mòdul es crida directament des de save.js just després
// d'inserir la fila a Supabase (en lloc d'un Database Webhook, que no és
// disponible al pla gratuït de Supabase).

function getAuth() {
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    return new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
}

// Munta, per a cada rol de la inscripció, la fila (array de valors) a
// afegir a la pestanya corresponent. Retorna una llista de { pestanya, fila }.
function construeixFiles(row) {
    const p = {
        nom: row.nom, cognom: row.cognom, correu: row.correu,
        telefon: row.telefon, dataNaixement: row.data_naixement,
        responsable: row.responsable_legal,
    };
    const rols = row.rols || [];
    const detalls = row.detalls_rols || {};
    const files = [];

    files.push({
        pestanya: 'Participants',
        fila: [
            p.nom, p.cognom, p.correu, p.telefon, p.dataNaixement || '',
            p.responsable || '', rols.join(', '),
            (row.tasques_logistiques || []).join(', '),
            row.created_at || new Date().toISOString(),
        ],
    });

    if (rols.includes('banda') && detalls.banda) {
        const b = detalls.banda;
        files.push({
            pestanya: 'Banda Àuria',
            fila: [
                p.nom, p.cognom, p.correu, b.instrument || '',
                (b.moments || []).join(', '), b.necessitaPartitures || '',
                b.observacions || '',
            ],
        });
    }

    if (rols.includes('danses') && detalls.danses) {
        const d = detalls.danses;
        files.push({
            pestanya: 'Danses',
            fila: [p.nom, p.cognom, p.correu, d.ball || '', d.talla || '', d.observacions || ''],
        });
    }

    if (rols.includes('organitzacio') && detalls.organitzacio) {
        const o = detalls.organitzacio;
        files.push({
            pestanya: 'Organització',
            fila: [p.nom, p.cognom, p.correu, (o.comissions || []).join(', ')],
        });
    }

    if (rols.includes('teatre') && detalls.teatre) {
        const t = detalls.teatre;
        files.push({
            pestanya: 'Teatre',
            fila: [p.nom, p.cognom, p.correu, t.necessitatConcreta || ''],
        });
    }

    if (rols.includes('colabos') && detalls.colaboradors) {
        const c = detalls.colaboradors;
        files.push({
            pestanya: 'Col·laboradors',
            fila: [p.nom, p.cognom, p.correu, c.comColLabora || ''],
        });
    }

    if (detalls.sopar) {
        const s = detalls.sopar;
        files.push({
            pestanya: 'Sopar',
            fila: [
                p.nom, p.cognom, p.correu,
                s.sopar ? 'Sí' : 'No',
                (s.alergies || []).join(', '),
                s.altresAlergies || '',
            ],
        });
    }

    return files;
}

// No llancem mai excepcions cap amunt: si Sheets falla, la inscripció ja
// és a Supabase (font de veritat) i no volem que l'usuari vegi un error.
// Retornem els errors perquè save.js els pugui loguejar.
export async function sincronitzaSheets(row) {
    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const files = construeixFiles(row);

        const resultats = await Promise.allSettled(
            files.map(({ pestanya, fila }) =>
                sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${pestanya}!A1`,
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: { values: [fila] },
                })
            )
        );

        return resultats
            .map((r, i) => (r.status === 'rejected' ? { pestanya: files[i].pestanya, error: r.reason?.message } : null))
            .filter(Boolean);

    } catch (error) {
        return [{ pestanya: 'general', error: error.message }];
    }
}
