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

function resumHtml(inscripcio, tasquesLlegibles = []) {
    const p = inscripcio.dadesPersonals;
    const linies = [
        `<p><strong>Nom:</strong> ${p.nom} ${p.cognom}</p>`,
        `<p><strong>Correu:</strong> ${p.correu}</p>`,
        `<p><strong>Telèfon:</strong> ${p.telefon}</p>`,
        `<p><strong>Data de naixement:</strong> ${p.dataNaixement || '—'}</p>`,
        `<p><strong>Rols:</strong> ${(inscripcio.rols || []).join(', ') || '—'}</p>`,
    ];

    if (tasquesLlegibles.length) {
        const text = tasquesLlegibles
            .map(t => `${t.dia ? t.dia + ' ' : ''}${t.hora ? t.hora + ' — ' : ''}${t.nom}`)
            .join('; ');
        linies.push(`<p><strong>Tasques triades:</strong> ${text}</p>`);
    }
    if (inscripcio.detallsBanda?.instrument) {
        const b = inscripcio.detallsBanda;
        linies.push(`<p><strong>Banda Àuria:</strong> ${b.instrument} — ${(b.moments || []).join(', ')}</p>`);
    }
    if (inscripcio.detallsDanses?.ball) {
        const d = inscripcio.detallsDanses;
        linies.push(`<p><strong>Danses:</strong> ${d.ball} (talla ${d.talla || '—'})</p>`);
    }
    if (inscripcio.detallsOrganitzacio?.comissions?.length) {
        linies.push(`<p><strong>Organització:</strong> ${inscripcio.detallsOrganitzacio.comissions.join(', ')}</p>`);
    }
    if (inscripcio.detallsTeatre?.necessitatConcreta) {
        linies.push(`<p><strong>Teatre:</strong> ${inscripcio.detallsTeatre.necessitatConcreta}</p>`);
    }
    if (inscripcio.detallsColaboradors?.comColLabora) {
        linies.push(`<p><strong>Com col·labora:</strong> ${inscripcio.detallsColaboradors.comColLabora}</p>`);
    }
    if (inscripcio.sopar) {
        const s = inscripcio.sopar;
        linies.push(`<p><strong>Sopar:</strong> ${s.sopar ? 'Sí' : 'No'}${s.alergies?.length ? ' — Al·lèrgies: ' + s.alergies.join(', ') : ''}</p>`);
    }

    return linies.join('\n');
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
            await transporter.sendMail({
                from: `"La Cabra d'Or" <${process.env.GMAIL_USER}>`,
                to: correuParticipant,
                subject: "Confirmació d'inscripció — La Cabra d'Or 2026",
                html: `
                    <p>Hola ${inscripcio.dadesPersonals.nom},</p>
                    <p>Hem rebut la teva inscripció a la Cabra d'Or 2026. Aquí tens una còpia
                    de les teves respostes:</p>
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
                subject: `Nova inscripció: ${inscripcio.dadesPersonals?.nom} ${inscripcio.dadesPersonals?.cognom}`,
                html: resum,
            });
        }
    } catch (error) {
        errors.push({ desti: 'associacio', error: error.message });
    }

    return errors;
}
