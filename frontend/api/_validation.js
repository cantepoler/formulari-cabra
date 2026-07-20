// api/_validation.js  — prefix "_" = Vercel no el tracta com endpoint

const ROLS_VALIDS = ['organitzacio', 'banda', 'teatre', 'danses', 'colabos'];
const ALERGIES_VALIDES = ['celiac', 'vegetaria', 'altres'];

function esCorreuValid(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c); }

// Sense aquest límit, algú podria enviar un camp de text de mides
// arbitràries (MBs) repetidament: infla la BD, els correus i el full de
// Sheets sense cap benefici real per a ningú.
function massaLlarg(text, max) { return typeof text === 'string' && text.length > max; }

// Any de referència de la festa: mateix criteri "per cursos" que al client
// (stores/formulari.js) — es compta per any de naixement, no per data exacta.
const ANY_FESTA = 2026;

function calculaEdat(dataNaixement) {
  const n = new Date(dataNaixement);
  if (isNaN(n.getTime())) return null;
  return ANY_FESTA - n.getFullYear();
}

export function validarInscripcio(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['Cos de la petició buit o mal format'];

  // ── Dades personals ──────────────────────────────────────────────────────
  const p = body.dadesPersonals;
  if (!p || typeof p !== 'object') return ['Falten les dades personals'];

  if (!p.nom?.trim())    errors.push('El nom és obligatori');
  else if (massaLlarg(p.nom, 100)) errors.push('El nom és massa llarg');
  if (!p.cognom?.trim()) errors.push('El cognom és obligatori');
  else if (massaLlarg(p.cognom, 150)) errors.push('El cognom és massa llarg');

  let edat = null;
  if (!p.dataNaixement) {
    errors.push('La data de naixement és obligatòria');
  } else {
    edat = calculaEdat(p.dataNaixement);
    if (edat === null || new Date(p.dataNaixement) > new Date() || new Date(p.dataNaixement).getFullYear() < 1924)
      errors.push('La data de naixement no és vàlida');
  }

  if (!p.correu?.trim() || !esCorreuValid(p.correu) || massaLlarg(p.correu, 254))
    errors.push('El correu electrònic no és vàlid');

  if (!p.telefon || String(p.telefon).replace(/\s/g, '').length < 9 || massaLlarg(String(p.telefon), 20))
    errors.push('El telèfon no és vàlid');

  if (edat !== null && edat < 16 && !String(p.responsable || '').trim())
    errors.push('Cal el nom del responsable legal per a menors de 16 anys');
  if (massaLlarg(p.responsable, 150)) errors.push('El nom del responsable és massa llarg');

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
    else if (massaLlarg(b.instrument, 100))    errors.push("L'instrument és massa llarg");
    if (!Array.isArray(b?.moments) || !b.moments.length) errors.push('Cal seleccionar almenys un moment a Banda Àuria');
    if (!b?.necessitaPartitures)              errors.push('Cal respondre la pregunta de partitures a Banda Àuria');
    if (massaLlarg(b?.observacions, 1000))    errors.push('Les observacions de Banda Àuria són massa llargues');
  }

  if (rolsSegurs.includes('organitzacio')) {
    const o = body.detallsOrganitzacio;
    if (!Array.isArray(o?.comissions) || !o.comissions.length)
      errors.push("Cal seleccionar almenys una comissió a Organització");
  }

  if (rolsSegurs.includes('danses')) {
    if (!body.detallsDanses?.ball?.trim())
      errors.push('Cal indicar quin ball fas a Danses');
    if (massaLlarg(body.detallsDanses?.observacions, 1000))
      errors.push('Les observacions de Danses són massa llargues');
  }

  if (rolsSegurs.includes('colabos')) {
    if (!body.detallsColaboradors?.comColLabora?.trim())
      errors.push("Cal indicar com col·labores");
    else if (massaLlarg(body.detallsColaboradors.comColLabora, 1000))
      errors.push("La resposta de com col·labores és massa llarga");
  }

  if (body.detallsTeatre?.necessitatConcreta && massaLlarg(body.detallsTeatre.necessitatConcreta, 1000))
    errors.push('El text de Teatre és massa llarg');

  if (sopar && massaLlarg(sopar.altresAlergies, 500))
    errors.push("El text d'altres al·lèrgies és massa llarg");

  return errors;
}

