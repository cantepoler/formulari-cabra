import { google } from 'googleapis';

// api/_sheets.js — prefix "_" = Vercel no el tracta com endpoint
//
// Sheets és un mirall de lectura, no la font de veritat: Supabase és la BD
// real. Aquest mòdul es crida directament des de save.js just després
// d'inserir la fila a Supabase (en lloc d'un Database Webhook, que no és
// disponible al pla gratuït de Supabase).

// Alguns valors (rols, moments, comissions, tasques, al·lèrgies...) haurien
// de ser sempre un array, però depenent de com estigui definida la columna
// a Supabase (jsonb vs text[]) o de dades antigues, poden arribar com a
// string (JSON serialitzat, o buit) en lloc d'array. Ho normalitzem sempre
// abans de fer .join() perquè un sol camp mal format no faci caure tot
// el sync.
function normalitzaArray(valor) {
    if (Array.isArray(valor)) return valor;
    if (typeof valor === 'string' && valor.trim()) {
        try {
            const parsed = JSON.parse(valor);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return [valor];
        }
    }
    return [];
}

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
function construeixFiles(row, tasquesInfo = []) {
    const p = {
        nom: row.nom, cognom: row.cognom, correu: row.correu,
        telefon: row.telefon, dataNaixement: row.data_naixement,
        responsable: row.responsable_legal,
    };
    const rols = normalitzaArray(row.rols);
    const detalls = row.detalls_rols || {};
    const files = [];

    const tasquesText = tasquesInfo
        .map(t => {
            const franja = (t.hora_inici && t.hora_fi) ? `${t.hora_inici}–${t.hora_fi}` : t.hora;
            return `${t.dia ? t.dia + ' ' : ''}${franja ? franja + ' — ' : ''}${t.nom}`;
        })
        .join('; ');

    files.push({
        pestanya: 'Participants',
        fila: [
            p.nom, p.cognom, p.correu, p.telefon, p.dataNaixement || '',
            p.responsable || '', rols.join(', '),
            tasquesText,
            row.created_at || new Date().toISOString(),
        ],
    });

    if (rols.includes('banda') && detalls.banda) {
        const b = detalls.banda;
        files.push({
            pestanya: 'Banda Àuria',
            fila: [
                p.nom, p.cognom, p.correu, b.instrument || '',
                normalitzaArray(b.moments).join(', '), b.necessitaPartitures || '',
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
            fila: [p.nom, p.cognom, p.correu, normalitzaArray(o.comissions).join(', ')],
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
                normalitzaArray(s.alergies).join(', '),
                s.altresAlergies || '',
            ],
        });
    }

    return files;
}

// No llancem mai excepcions cap amunt: si Sheets falla, la inscripció ja
// és a Supabase (font de veritat) i no volem que l'usuari vegi un error.
// Retornem els errors perquè save.js els pugui loguejar.
export async function sincronitzaSheets(row, tasquesInfo = []) {
    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const files = construeixFiles(row, tasquesInfo);

        // RAW en lloc de USER_ENTERED: aquí hi entra text lliure escrit per
        // qualsevol persona del formulari (nom, observacions...). Amb
        // USER_ENTERED, Google Sheets interpreta com a fórmula qualsevol
        // valor que comenci per =, +, -, @ (p.ex. algú escrivint
        // "=IMPORTXML(...)" al camp "nom"), executant-la quan algú obri el
        // full — és l'atac conegut com "Formula/CSV Injection". Amb RAW,
        // tot es desa sempre com a text literal.
        const resultats = await Promise.allSettled(
            files.map(({ pestanya, fila }) =>
                sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${pestanya}!A1`,
                    valueInputOption: 'RAW',
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
