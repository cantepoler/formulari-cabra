// api/_validation.js
//
// Validació del cos de la petició a /api/save, abans de tocar Supabase.
// El prefix "_" al nom del fitxer fa que Vercel NO el tracti com un
// endpoint — és només un mòdul auxiliar que s'importa des de save.js.

const ROLS_VALIDS = ['organitzacio', 'banda', 'teatre', 'danses', 'colabos'];
const ALERGIES_VALIDES = ['celiac', 'vegetaria', 'altres'];

function esCorreuValid(correu) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correu);
}

function calculaEdat(dataNaixement) {
    const naixement = new Date(dataNaixement);
    if (isNaN(naixement.getTime())) return null;

    const avui = new Date();
    let edat = avui.getFullYear() - naixement.getFullYear();
    const mesos = avui.getMonth() - naixement.getMonth();
    if (mesos < 0 || (mesos === 0 && avui.getDate() < naixement.getDate())) edat--;
    return edat;
}

/**
 * Valida el cos complet d'una inscripció.
 * Retorna un array de strings amb els errors trobats (buit si tot és correcte).
 */
export function validarInscripcio(body) {
    const errors = [];

    if (!body || typeof body !== 'object') {
        return ['Cos de la petició buit o mal format'];
    }

    // --- Dades personals ---
    const p = body.dadesPersonals;
    if (!p || typeof p !== 'object') {
        return ['Falten les dades personals'];
    }

    if (!p.nom || typeof p.nom !== 'string' || !p.nom.trim())
        errors.push('El nom és obligatori');

    if (!p.cognom || typeof p.cognom !== 'string' || !p.cognom.trim())
        errors.push('El cognom és obligatori');

    let edat = null;
    if (!p.dataNaixement) {
        errors.push('La data de naixement és obligatòria');
    } else {
        const naixement = new Date(p.dataNaixement);
        edat = calculaEdat(p.dataNaixement);
        if (edat === null || naixement > new Date() || naixement.getFullYear() < 1924) {
            errors.push('La data de naixement no és vàlida');
        }
    }

    if (!p.correu || typeof p.correu !== 'string' || !esCorreuValid(p.correu))
        errors.push('El correu electrònic no és vàlid');

    if (!p.telefon || String(p.telefon).replace(/\s/g, '').length < 9)
        errors.push('El telèfon no és vàlid');

    // Per sota dels 16 anys, el camp "telefon" passa a representar el
    // telèfon del responsable legal — i el seu nom també és obligatori.
    if (edat !== null && edat < 16 && (!p.responsable || !String(p.responsable).trim()))
        errors.push('Cal el nom del responsable legal per a menors de 16 anys');

    // --- Rols ---
    const rols = Array.isArray(body.rols) ? body.rols : null;
    if (!rols || rols.length === 0) {
        errors.push('Cal seleccionar almenys un rol');
    } else if (!rols.every(r => ROLS_VALIDS.includes(r))) {
        errors.push('Hi ha un rol no reconegut');
    }

    // --- Tasques logístiques ---
    if (body.tasquesTriades !== undefined) {
        if (!Array.isArray(body.tasquesTriades) || !body.tasquesTriades.every(t => typeof t === 'string')) {
            errors.push('Format de tasques seleccionades no vàlid');
        }
    }

    // --- Sopar ---
    const sopar = body.sopar;
    if (!sopar || typeof sopar !== 'object' || typeof sopar.sopar !== 'boolean') {
        errors.push('Cal indicar si vindràs a sopar');
    } else {
        if (sopar.alergies !== undefined) {
            if (!Array.isArray(sopar.alergies) || !sopar.alergies.every(a => ALERGIES_VALIDES.includes(a))) {
                errors.push('Format d\'al·lèrgies no vàlid');
            } else if (sopar.sopar && sopar.alergies.includes('altres') && !String(sopar.altresAlergies || '').trim()) {
                errors.push('Cal especificar l\'al·lèrgia si has marcat "Altres"');
            }
        }
    }

    // --- Validacions condicionades pel rol triat ---
    const rolsSegurs = rols || [];

    if (rolsSegurs.includes('banda')) {
        const b = body.detallsBanda;
        if (!b || !b.instrument || !String(b.instrument).trim())
            errors.push('Cal indicar l\'instrument a Banda Àuria');
        if (!b || !Array.isArray(b.moments) || b.moments.length === 0)
            errors.push('Cal seleccionar almenys un moment a Banda Àuria');
        if (!b || !b.necessitaPartitures)
            errors.push('Cal respondre la pregunta de partitures a Banda Àuria');
    }

    if (rolsSegurs.includes('organitzacio')) {
        const o = body.detallsOrganitzacio;
        if (!o || !Array.isArray(o.comissions) || o.comissions.length === 0)
            errors.push('Cal seleccionar almenys una comissió a Organització');
    }

    if (rolsSegurs.includes('danses')) {
        const d = body.detallsDanses;
        if (!d || !d.ball || !String(d.ball).trim())
            errors.push('Cal indicar quin ball fas a Danses');
    }

    return errors;
}
