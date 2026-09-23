/**
 * API JSON para la plataforma educativa (Google Apps Script + Google Sheets)
 * ---------------------------------------------------------------------------
 * Pestañas requeridas en la hoja de cálculo (fila 1 = encabezados):
 *
 * 1) Estudiantes_Notas
 *    A: Curso | B: Documento | C: Nombre | D...: una columna por actividad
 *    (encabezado = actividad, p. ej. "Taller 1 (20%)"; celda vacía = "Sin publicar").
 *    Columnas opcionales: "Definitiva" (la calcula/escribe el docente) y "Observaciones".
 *
 * 2) Respuestas_Autoevaluacion  (la crea la función crearPestanas)
 *    Fecha | Curso | Documento | Nombre | Detalle_Rubrica | Nota_Sugerida | Reflexion
 *
 * CORS: los Web Apps de Apps Script responden con CORS abierto cuando se
 * despliegan con acceso "Cualquier persona". Para evitar el preflight OPTIONS
 * (que Apps Script no soporta), el frontend envía el POST con
 * Content-Type: text/plain y el cuerpo en JSON.
 */

const HOJA_NOTAS = 'Estudiantes_Notas';
const HOJA_AUTO = 'Respuestas_Autoevaluacion';

/** Ejecutar UNA vez desde el editor para crear las pestañas con encabezados. */
function crearPestanas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(HOJA_NOTAS)) {
    ss.insertSheet(HOJA_NOTAS).appendRow(['Curso', 'Documento', 'Nombre', 'Taller 1 (20%)', 'Quiz 1 (30%)', 'Proyecto (50%)', 'Definitiva', 'Observaciones']);
  }
  if (!ss.getSheetByName(HOJA_AUTO)) {
    ss.insertSheet(HOJA_AUTO).appendRow(['Fecha', 'Curso', 'Documento', 'Nombre', 'Detalle_Rubrica', 'Nota_Sugerida', 'Reflexion']);
  }
}

/** GET ?action=cursos  |  GET ?action=login&curso=X&documento=Y */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'cursos') return json({ ok: true, cursos: listarCursos() });
    if (p.action === 'login') return json(consultarNotas(p.curso, p.documento));
    return json({ ok: true, mensaje: 'API activa' });
  } catch (err) {
    return json({ ok: false, error: 'Error interno: ' + err.message });
  }
}

/** POST { action:'autoevaluacion', curso, documento, nombre, detalle, notaSugerida, reflexion } */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.action !== 'autoevaluacion') return json({ ok: false, error: 'Acción no válida' });

    // Verifica que el estudiante exista (evita registros falsos)
    const est = consultarNotas(d.curso, d.documento);
    if (!est.ok) return json(est);

    lock.waitLock(10000);
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_AUTO).appendRow([
      new Date(), d.curso, "'" + d.documento, est.estudiante.nombre,
      JSON.stringify(d.detalle || {}), Number(d.notaSugerida) || '', String(d.reflexion || '').slice(0, 2000)
    ]);
    return json({ ok: true, mensaje: 'Autoevaluación registrada' });
  } catch (err) {
    return json({ ok: false, error: 'Error interno: ' + err.message });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ------------------------------ Utilidades ------------------------------ */

// Ignora tildes, espacios, puntos y guiones al comparar
const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

function listarCursos() {
  const v = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_NOTAS).getDataRange().getDisplayValues();
  return [...new Set(v.slice(1).map(r => String(r[0]).trim()).filter(Boolean))].sort();
}

function consultarNotas(curso, documento) {
  if (!curso || !documento) return { ok: false, error: 'Falta el curso o el documento.' };
  const v = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_NOTAS).getDataRange().getDisplayValues();
  const head = v[0];
  const fila = v.slice(1).find(r => norm(r[0]) === norm(curso) && norm(r[1]) === norm(documento));
  if (!fila) return { ok: false, error: 'No encontramos esa combinación de curso y documento. Revisa los datos.' };

  // No se calcula ningún promedio: las notas están ponderadas y el docente publica la Definitiva.
  // Celda vacía = calificación aún no publicada.
  const notas = [];
  let obs = '', definitiva = '';
  for (let c = 3; c < head.length; c++) {
    const h = String(head[c]).trim(), val = String(fila[c]).trim();
    if (!h) continue;
    if (norm(h) === 'observaciones') obs = val;
    else if (norm(h) === 'definitiva' || norm(h) === 'notafinal') definitiva = val;
    else notas.push({ actividad: h, valor: val });
  }
  return { ok: true, estudiante: { nombre: String(fila[2]), curso: String(fila[0]), documento: String(fila[1]), notas, definitiva, observaciones: obs } };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
