import nodemailer from 'nodemailer';

// api/_mail.js — prefix "_" = Vercel no el tracta com endpoint
//
// Fem servir un compte de Gmail normal amb una "contrasenya d'aplicació"
// (App Password), no el compte de servei de Sheets: el compte de servei no
// pot enviar correus com si fos una persona sense un Google Workspace de
// pagament amb delegació de domini. Un Gmail normal és gratuït i de sobres
// pel volum d'una festa (límit ~500 correus/dia).

function getTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

// Els camps de text lliure (nom, observacions, "com col·labores"...) els
// escriu qualsevol persona del formulari i s'interpolen directament dins
// l'HTML del correu. Sense escapar-los, algú podria injectar-hi etiquetes
// (enllaços, imatges, estils) tant al correu que rep ell mateix com al que
// rep l'associació — un vector clàssic de phishing/HTML injection.
function escapa(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function resumHtml(inscripcio, tasquesLlegibles = []) {
    const p = inscripcio.dadesPersonals;
    const linies = [
        `<p><strong>Nom:</strong> ${escapa(p.nom)} ${escapa(p.cognom)}</p>`,
        `<p><strong>Correu:</strong> ${escapa(p.correu)}</p>`,
        `<p><strong>Telèfon:</strong> ${escapa(p.telefon)}</p>`,
        `<p><strong>Data de naixement:</strong> ${escapa(p.dataNaixement) || '—'}</p>`,
        `<p><strong>Rols:</strong> ${escapa((inscripcio.rols || []).join(', ')) || '—'}</p>`,
    ];

    if (tasquesLlegibles.length) {
        const text = tasquesLlegibles
            .map(t => {
                const franja = (t.hora_inici && t.hora_fi) ? `${t.hora_inici}–${t.hora_fi}` : t.hora;
                return `${t.dia ? escapa(t.dia) + ' ' : ''}${franja ? escapa(franja) + ' — ' : ''}${escapa(t.nom)}`;
            })
            .join('; ');
        linies.push(`<p><strong>Tasques triades:</strong> ${text}</p>`);
    }
    if (inscripcio.detallsBanda?.instrument) {
        const b = inscripcio.detallsBanda;
        linies.push(`<p><strong>Banda Àuria:</strong> ${escapa(b.instrument)} — ${escapa((b.moments || []).join(', '))}</p>`);
    }
    if (inscripcio.detallsDanses?.ball) {
        const d = inscripcio.detallsDanses;
        linies.push(`<p><strong>Danses:</strong> ${escapa(d.ball)} (talla ${escapa(d.talla) || '—'})</p>`);
    }
    if (inscripcio.detallsOrganitzacio?.comissions?.length) {
        linies.push(`<p><strong>Organització:</strong> ${escapa(inscripcio.detallsOrganitzacio.comissions.join(', '))}</p>`);
    }
    if (inscripcio.detallsTeatre?.necessitatConcreta) {
        linies.push(`<p><strong>Teatre:</strong> ${escapa(inscripcio.detallsTeatre.necessitatConcreta)}</p>`);
    }
    if (inscripcio.detallsColaboradors?.comColLabora) {
        linies.push(`<p><strong>Com col·labora:</strong> ${escapa(inscripcio.detallsColaboradors.comColLabora)}</p>`);
    }
    if (inscripcio.sopar) {
        const s = inscripcio.sopar;
        linies.push(`<p><strong>Sopar:</strong> ${s.sopar ? 'Sí' : 'No'}${s.alergies?.length ? ' — Al·lèrgies: ' + escapa(s.alergies.join(', ')) : ''}</p>`);
    }

    return linies.join('\n');
}

function subjecteSegur(text) {
    return String(text ?? '').replace(/[\r\n]/g, ' ').slice(0, 200);
}

// No llancem mai excepcions cap amunt pel mateix motiu que a _sheets.js:
// la inscripció ja és a Supabase, un correu que falla no ha de fer fallar
// la petició de l'usuari.
export async function enviaMailsInscripcio(inscripcio, tasquesLlegibles = []) {
    const errors = [];
    const transporter = getTransporter();
    const resum = resumHtml(inscripcio, tasquesLlegibles);
    const correuParticipant = inscripcio.dadesPersonals?.correu;

    try {
        if (correuParticipant) {
            const p = inscripcio.dadesPersonals;
            // Si hi ha responsable (es demana només per a menors de 16), el
            // correu —que en aquest cas és el del responsable— es dirigeix
            // a ell/a, no directament al menor.
            const salutacio = String(p.responsable || '').trim()
                ? `Hola, responsable de ${escapa(p.nom)},`
                : `Hola ${escapa(p.nom)},`;
            const textInscripcio = String(p.responsable || '').trim()
                ? `Hem rebut la inscripció de ${escapa(p.nom)} a la Cabra d'Or 2026. Aquí tens una còpia de les respostes:`
                : `Hem rebut la teva inscripció a la Cabra d'Or 2026. Aquí tens una còpia de les teves respostes:`;

            await transporter.sendMail({
                from: `"La Cabra d'Or" <${process.env.GMAIL_USER}>`,
                to: correuParticipant,
                subject: "Confirmació d'inscripció — La Cabra d'Or 2026",
                html: `
                    <p>${salutacio}</p>
                    <p>${textInscripcio}</p>
                    ${resum}
                    <p>Ens veurem molt aviat a la plaça!</p>
                    <p>Associació La Cabra d'Or</p>
                `,
            });
        }
    } catch (error) {
        errors.push({ desti: 'participant', error: error.message });
    }

    try {
        if (process.env.ASSOCIATION_EMAIL) {
            await transporter.sendMail({
                from: `"Formulari Cabra d'Or" <${process.env.GMAIL_USER}>`,
                to: process.env.ASSOCIATION_EMAIL,
                subject: `Nova inscripció: ${subjecteSegur(inscripcio.dadesPersonals?.nom + ' ' + inscripcio.dadesPersonals?.cognom)}`,
                html: resum,
            });
        }
    } catch (error) {
        errors.push({ desti: 'associacio', error: error.message });
    }

    return errors;
}
