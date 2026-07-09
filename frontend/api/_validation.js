// api/_validation.js  — prefix "_" = Vercel no el tracta com endpoint

const ROLS_VALIDS = ['organitzacio', 'banda', 'teatre', 'danses', 'colabos', 'taverna', 'poble'];
const ALERGIES_VALIDES = ['celiac', 'vegetaria', 'altres'];

function esCorreuValid(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c); }

function calculaEdat(dataNaixement) {
  const n = new Date(dataNaixement);
  if (isNaN(n.getTime())) return null;
  const a = new Date();
  let e = a.getFullYear() - n.getFullYear();
  const m = a.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && a.getDate() < n.getDate())) e--;
  return e;
}

export function validarInscripcio(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['Cos de la petició buit o mal format'];

  // ── Dades personals ──────────────────────────────────────────────────────
  const p = body.dadesPersonals;
  if (!p || typeof p !== 'object') return ['Falten les dades personals'];

  if (!p.nom?.trim())    errors.push('El nom és obligatori');
  if (!p.cognom?.trim()) errors.push('El cognom és obligatori');

  let edat = null;
  if (!p.dataNaixement) {
    errors.push('La data de naixement és obligatòria');
  } else {
    edat = calculaEdat(p.dataNaixement);
    if (edat === null || new Date(p.dataNaixement) > new Date() || new Date(p.dataNaixement).getFullYear() < 1924)
      errors.push('La data de naixement no és vàlida');
  }

  if (!p.correu?.trim() || !esCorreuValid(p.correu))
    errors.push('El correu electrònic no és vàlid');

  if (!p.telefon || String(p.telefon).replace(/\s/g, '').length < 9)
    errors.push('El telèfon no és vàlid');

  if (edat !== null && edat < 16 && !String(p.responsable || '').trim())
    errors.push('Cal el nom del responsable legal per a menors de 16 anys');

  // ── Consentiments ────────────────────────────────────────────────────────
  const cons = body.consentiments;
  if (!cons?.tractamentDades)
    errors.push('Cal acceptar el tractament de dades personals');
  if (edat !== null && edat < 14 && !cons?.responsabilitatMenors)
    errors.push('Cal acceptar les condicions de responsabilitat per a menors de 14 anys');

  // ── Rols ─────────────────────────────────────────────────────────────────
  const rols = Array.isArray(body.rols) ? body.rols : null;
  if (!rols?.length) {
    errors.push('Cal seleccionar almenys un rol');
  } else if (!rols.every(r => ROLS_VALIDS.includes(r))) {
    errors.push('Hi ha un rol no reconegut');
  }

  // ── Tasques ──────────────────────────────────────────────────────────────
  if (body.tasquesTriades !== undefined &&
      (!Array.isArray(body.tasquesTriades) || !body.tasquesTriades.every(t => typeof t === 'string')))
    errors.push('Format de tasques seleccionades no vàlid');

  // ── Sopar ────────────────────────────────────────────────────────────────
  const sopar = body.sopar;
  if (!sopar || typeof sopar.sopar !== 'boolean') {
    errors.push('Cal indicar si vindràs a sopar');
  } else if (Array.isArray(sopar.alergies)) {
    if (!sopar.alergies.every(a => ALERGIES_VALIDES.includes(a)))
      errors.push("Format d'al·lèrgies no vàlid");
    else if (sopar.sopar && sopar.alergies.includes('altres') && !String(sopar.altresAlergies || '').trim())
      errors.push("Cal especificar l'al·lèrgia si has marcat \"Altres\"");
  }

  // ── Validació per rol ────────────────────────────────────────────────────
  const rolsSegurs = rols || [];

  if (rolsSegurs.includes('banda')) {
    const b = body.detallsBanda;
    if (!b?.instrument?.trim())               errors.push("Cal indicar l'instrument a Banda Àuria");
    if (!Array.isArray(b?.moments) || !b.moments.length) errors.push('Cal seleccionar almenys un moment a Banda Àuria');
    if (!b?.necessitaPartitures)              errors.push('Cal respondre la pregunta de partitures a Banda Àuria');
  }

  if (rolsSegurs.includes('organitzacio')) {
    const o = body.detallsOrganitzacio;
    if (!Array.isArray(o?.comissions) || !o.comissions.length)
      errors.push("Cal seleccionar almenys una comissió a Organització");
  }

  if (rolsSegurs.includes('danses')) {
    if (!body.detallsDanses?.ball?.trim())
      errors.push('Cal indicar quin ball fas a Danses');
  }

  if (rolsSegurs.includes('colabos')) {
    if (!body.detallsColaboradors?.comColLabora?.trim())
      errors.push("Cal indicar com col·labores");
  }

  return errors;
}

