'use strict';
/* =========================================================================
   CONFIGURACIÓN Y CONTENIDO EDITABLE (modifica solo esta sección)
   ========================================================================= */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycby7RqbEcEdJTnDeaaOCa_dE0TEUB8OO-LmN_DvGSzUJO5nrDidESU8CesifC-NSE8L1pw/exec', // termina en /exec
  NOTA_MINIMA: 3.0,
  SEGUNDOS_RETO: 15
};

const DATA = {
  // --- Práctica: cuestionarios (a = índice de la respuesta correcta), tarjetas y parejas
  topics: {
    'La célula': {
      quiz: [
        { q: '¿Qué organelo produce la mayor parte de la energía celular?', o: ['Núcleo', 'Mitocondria', 'Ribosoma'], a: 1, e: 'La mitocondria realiza la respiración celular y produce ATP.' },
        { q: '¿Qué estructura rodea y protege a la célula vegetal además de la membrana?', o: ['Pared celular', 'Citoplasma', 'Vacuola'], a: 0, e: 'La pared celular de celulosa da forma y soporte a las plantas.' },
        { q: '¿Dónde se encuentra el material genético en una célula eucariota?', o: ['Lisosoma', 'Aparato de Golgi', 'Núcleo'], a: 2, e: 'El ADN se almacena en el núcleo.' }
      ],
      flash: [['Mitocondria', 'Produce energía (ATP)'], ['Ribosoma', 'Fabrica proteínas'], ['Núcleo', 'Contiene el ADN'], ['Cloroplasto', 'Realiza la fotosíntesis']],
      pairs: [['Mitocondria', 'Energía'], ['Ribosoma', 'Proteínas'], ['Núcleo', 'ADN'], ['Cloroplasto', 'Fotosíntesis']]
    },
    'Sistema solar': {
      quiz: [
        { q: '¿Cuál es el planeta más grande?', o: ['Saturno', 'Júpiter', 'Neptuno'], a: 1, e: 'Júpiter tiene más del doble de masa que los demás planetas juntos.' },
        { q: '¿Qué planeta es el más cercano al Sol?', o: ['Mercurio', 'Venus', 'Marte'], a: 0, e: 'Mercurio orbita a unos 58 millones de km del Sol.' }
      ],
      flash: [['Marte', 'El planeta rojo'], ['Saturno', 'Famoso por sus anillos'], ['Luna', 'Satélite natural de la Tierra']],
      pairs: [['Marte', 'Planeta rojo'], ['Saturno', 'Anillos'], ['Luna', 'Satélite'], ['Sol', 'Estrella']]
    }
  },

  // --- Autoevaluación: rúbrica (puntos por nivel en escala 1.0 - 5.0)
  niveles: [{ n: 'Superior', p: 5 }, { n: 'Alto', p: 4 }, { n: 'Básico', p: 3 }, { n: 'Bajo', p: 1.5 }],
  rubrica: [
    { id: 'conceptos', titulo: 'Comprender conceptos', pregunta: '¿Qué tan bien comprendiste los conceptos del tema?',
      desc: ['Los explico con mis palabras y doy ejemplos', 'Los entiendo casi por completo', 'Entiendo lo esencial, con dudas', 'Aún no los comprendo'] },
    { id: 'aplicacion', titulo: 'Aplicación práctica', pregunta: '¿Cómo aplicaste lo aprendido en las actividades?',
      desc: ['Resolví problemas nuevos con autonomía', 'Apliqué bien con pocos errores', 'Apliqué con ayuda', 'No logré aplicarlo'] },
    { id: 'tiempos', titulo: 'Cumplimiento de tiempos', pregunta: '¿Cumpliste con las entregas en las fechas acordadas?',
      desc: ['Siempre entregué a tiempo', 'Casi siempre a tiempo', 'A veces con retraso', 'Entregué tarde o no entregué'] }
  ],

  // --- Recursos (ID = lo que aparece entre /d/ y /view en el enlace de Drive)
  unidades: [
    { unidad: 'Unidad 1: La célula', items: [
      { titulo: 'Guía 1 – Partes de la célula', tipo: 'Guía', drive: 'ID_DRIVE_PDF_1' },
      { titulo: 'Taller 1 – Organelos', tipo: 'Taller', drive: 'ID_DRIVE_PDF_2' }] },
    { unidad: 'Unidad 2: El sistema solar', items: [
      { titulo: 'Guía 2 – Los planetas', tipo: 'Guía', drive: 'ID_DRIVE_PDF_3' }] }
  ],
  videos: [ // ID = lo que va después de v= en YouTube
    { titulo: 'Video 1 – Introducción', yt: 'ID_YOUTUBE_1' },
    { titulo: 'Video 2 – Práctica guiada', yt: 'ID_YOUTUBE_2' }
  ],
  libro: 'ID_DRIVE_LIBRO'
};

/* =========================================================================
   UTILIDADES, SESIÓN Y API
   ========================================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => [...a].sort(() => Math.random() - .5);
const drivePreview = id => `https://drive.google.com/file/d/${id}/preview`;
const driveDownload = id => `https://drive.google.com/uc?export=download&id=${id}`;

const Session = {
  get() { try { return JSON.parse(localStorage.getItem('aula_session')); } catch { return null; } },
  set(v) { localStorage.setItem('aula_session', JSON.stringify(v)); },
  clear() { localStorage.removeItem('aula_session'); }
};
let session = Session.get();

async function apiGet(params) {
  const r = await fetch(CONFIG.API_URL + '?' + new URLSearchParams(params));
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function apiPost(body) {
  // text/plain evita el preflight CORS que Apps Script no soporta
  const r = await fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* =========================================================================
   NAVEGACIÓN
   ========================================================================= */
function showTab(name) {
  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
  $$('[role=tabpanel]').forEach(p => p.hidden = p.id !== 'tab-' + name);
  if (name === 'autoeval' && !chat.started) chatStart();
}
$$('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));

/* =========================================================================
   MÓDULO 1: LOGIN Y NOTAS
   ========================================================================= */
async function loadCursos() {
  try {
    const d = await apiGet({ action: 'cursos' });
    if (d.ok) $('#cursos-list').innerHTML = d.cursos.map(c => `<option value="${esc(c)}">`).join('');
  } catch { /* el campo sigue funcionando como texto libre */ }
}

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('#login-btn'), err = $('#login-error');
  err.textContent = ''; btn.disabled = true; btn.textContent = 'Consultando…';
  try {
    const d = await apiGet({ action: 'login', curso: $('#curso').value, documento: $('#documento').value });
    if (!d.ok) throw new Error(d.error);
    session = d.estudiante; Session.set(session); renderSession(); showTab('notas');
  } catch (ex) {
    err.textContent = ex.message.startsWith('HTTP') || ex.message === 'Failed to fetch'
      ? 'No pudimos conectar con el servidor. Revisa tu internet e inténtalo de nuevo.' : ex.message;
  } finally { btn.disabled = false; btn.textContent = 'Consultar'; }
});

$('#logout').addEventListener('click', () => { Session.clear(); session = null; chat.started = false; renderSession(); showTab('inicio'); });

function estadoClase(p) { return p == null ? 'bg-gray-200' : p >= CONFIG.NOTA_MINIMA ? 'bg-green-200' : 'bg-red-200'; }

function renderSession() {
  const on = !!session;
  $('#login-box').hidden = on; $('#session-chip').classList.toggle('hidden', !on);
  $('#dashboard').classList.toggle('hidden', !on);
  if (on) {
    $('#session-name').textContent = session.nombre;
    $('#dashboard').innerHTML = `<div class="card p-6"><h2 class="font-display text-3xl font-extrabold">Hola, ${esc(session.nombre.split(' ')[0])}</h2>
      <p class="mt-1">Curso ${esc(session.curso)} · Promedio actual <strong>${session.promedio ?? '—'}</strong></p>
      <div class="mt-4 flex flex-wrap gap-2">${[['notas', 'Ver mis notas'], ['practica', 'Practicar'], ['autoeval', 'Autoevaluarme'], ['recursos', 'Ver recursos']]
        .map(([t, l]) => `<button class="btn" onclick="showTab('${t}')">${l}</button>`).join('')}</div></div>`;
    $('#notas-out').innerHTML = `<div class="card p-6">
      <div class="flex flex-wrap justify-between gap-2 items-center"><h2 class="font-display text-2xl font-extrabold">${esc(session.nombre)}</h2>
        <span class="px-3 py-1 rounded-full border-2 border-ink font-bold ${estadoClase(session.promedio)}">${esc(session.estado)} · ${session.promedio ?? '—'}</span></div>
      <div class="overflow-x-auto mt-4"><table class="w-full text-left"><thead><tr class="border-b-2 border-ink"><th class="py-2">Actividad</th><th>Nota</th><th class="w-1/2">Progreso</th></tr></thead><tbody>
      ${session.notas.map(n => `<tr class="border-b"><td class="py-2">${esc(n.actividad)}</td><td class="font-bold">${n.nota.toFixed(1)}</td>
        <td><div class="h-3 bg-gray-200 rounded"><div class="h-3 rounded ${n.nota >= CONFIG.NOTA_MINIMA ? 'bg-brand' : 'bg-red-500'}" style="width:${Math.min(100, n.nota / 5 * 100)}%"></div></div></td></tr>`).join('') || '<tr><td colspan="3" class="py-3">Aún no hay notas registradas.</td></tr>'}
      </tbody></table></div>${session.observaciones ? `<p class="mt-4"><strong>Observaciones:</strong> ${esc(session.observaciones)}</p>` : ''}</div>`;
  } else {
    $('#notas-out').innerHTML = '<div class="card p-6">Ingresa desde <button class="underline font-bold" onclick="showTab(\'inicio\')">Inicio</button> para ver tus notas.</div>';
  }
}

/* =========================================================================
   MÓDULO 2: PRÁCTICA (cuestionario, reto con tiempo, tarjetas, emparejar)
   ========================================================================= */
const P = { mode: 'quiz' }, Q = {}, out = () => $('#practica-out');

function initPractica() {
  $('#topic').innerHTML = Object.keys(DATA.topics).map(t => `<option>${esc(t)}</option>`).join('');
  $('#topic').addEventListener('change', startPractica);
  $('#modes').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) { P.mode = b.dataset.mode; startPractica(); } });
  startPractica();
}
function startPractica() {
  clearInterval(Q.timer);
  $$('#modes [data-mode]').forEach(b => b.classList.toggle('btn-primary', b.dataset.mode === P.mode));
  P.t = DATA.topics[$('#topic').value];
  ({ quiz: quizStart, timed: quizStart, flash: flashStart, match: matchStart })[P.mode]();
}

function quizStart() { Object.assign(Q, { i: 0, score: 0, done: false, qs: shuffle(P.t.quiz) }); quizRender(); }
function quizRender() {
  clearInterval(Q.timer);
  const q = Q.qs[Q.i];
  if (!q) {
    const pct = Math.round(Q.score / Q.qs.length * 100);
    out().innerHTML = `<h3 class="font-display text-2xl font-extrabold">Resultado: ${Q.score} de ${Q.qs.length} (${pct}%)</h3>
      <p class="my-2">${pct >= 80 ? '¡Excelente dominio del tema!' : pct >= 50 ? 'Vas bien. Repasa las explicaciones y vuelve a intentarlo.' : 'Repasa el tema con las tarjetas y vuelve a intentarlo.'}</p>
      <button class="btn btn-primary" data-act="restart">Reintentar</button>`; return;
  }
  Q.done = false;
  const timed = P.mode === 'timed';
  out().innerHTML = `<div class="flex justify-between font-bold mb-3"><span>Pregunta ${Q.i + 1} de ${Q.qs.length}</span><span>Aciertos: ${Q.score}</span>${timed ? `<span id="clock">⏱ ${CONFIG.SEGUNDOS_RETO}s</span>` : ''}</div>
    <p class="text-xl font-bold mb-4">${esc(q.q)}</p>
    <div class="space-y-2">${q.o.map((o, k) => `<button class="btn w-full text-left" data-opt="${k}">${esc(o)}</button>`).join('')}</div><div id="fb" class="mt-4"></div>`;
  if (timed) {
    let s = CONFIG.SEGUNDOS_RETO;
    Q.timer = setInterval(() => { s--; const c = $('#clock'); if (c) c.textContent = '⏱ ' + s + 's'; if (s <= 0) quizAnswer(-1); }, 1000);
  }
}
function quizAnswer(k) {
  if (Q.done) return; Q.done = true; clearInterval(Q.timer);
  const q = Q.qs[Q.i], ok = k === q.a; if (ok) Q.score++;
  $$('[data-opt]').forEach(b => {
    const i = +b.dataset.opt; b.disabled = true;
    if (i === q.a) b.classList.add('bg-green-200'); else if (i === k) b.classList.add('bg-red-200');
  });
  $('#fb').innerHTML = `<p class="font-bold">${ok ? '¡Correcto!' : k === -1 ? 'Se acabó el tiempo.' : 'No es esa.'}</p><p>${esc(q.e)}</p>
    <button class="btn btn-primary mt-3" data-act="next">${Q.i + 1 < Q.qs.length ? 'Siguiente pregunta' : 'Ver resultado'}</button>`;
  $('[data-act=next]').focus();
}

function flashStart() { Object.assign(Q, { i: 0 }); flashRender(); }
function flashRender() {
  const [f, b] = P.t.flash[Q.i];
  out().innerHTML = `<p class="mb-2 font-bold">Tarjeta ${Q.i + 1} de ${P.t.flash.length}</p>
    <div class="flip" id="card"><button class="flip-in w-full h-48 block" data-act="flip" aria-label="Voltear tarjeta">
      <span class="face card font-display text-3xl font-extrabold bg-mark">${esc(f)}</span><span class="face back card text-xl bg-white">${esc(b)}</span></button></div>
    <div class="flex gap-2 mt-4"><button class="btn" data-act="prev">Anterior</button><button class="btn" data-act="flip">Voltear</button><button class="btn btn-primary" data-act="fnext">Siguiente</button></div>`;
}

function matchStart() {
  Object.assign(Q, { sel: null, hits: 0, L: shuffle(P.t.pairs.map((p, i) => [i, p[0]])), R: shuffle(P.t.pairs.map((p, i) => [i, p[1]])) });
  out().innerHTML = `<p class="mb-3 font-bold">Une cada concepto con su pareja. <span id="mhits">0</span> de ${P.t.pairs.length}</p>
    <div class="grid grid-cols-2 gap-4"><div class="space-y-2">${Q.L.map(([i, t]) => `<button class="btn w-full" data-m="L${i}">${esc(t)}</button>`).join('')}</div>
    <div class="space-y-2">${Q.R.map(([i, t]) => `<button class="btn w-full" data-m="R${i}">${esc(t)}</button>`).join('')}</div></div><p id="mfb" class="mt-3 font-bold"></p>`;
}
function matchClick(btn) {
  const [side, id] = [btn.dataset.m[0], btn.dataset.m.slice(1)];
  if (!Q.sel || Q.sel.side === side) { $$('[data-m]').forEach(b => b.classList.remove('bg-mark')); Q.sel = { side, id, btn }; btn.classList.add('bg-mark'); return; }
  if (Q.sel.id === id) {
    [Q.sel.btn, btn].forEach(b => { b.disabled = true; b.classList.remove('bg-mark'); b.classList.add('bg-green-200'); });
    $('#mhits').textContent = ++Q.hits; $('#mfb').textContent = Q.hits === P.t.pairs.length ? '¡Completaste todas las parejas!' : '¡Pareja correcta!';
  } else { $('#mfb').textContent = 'Esas no van juntas. Intenta de nuevo.'; Q.sel.btn.classList.remove('bg-mark'); }
  Q.sel = null;
}

$('#practica-out').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.opt) quizAnswer(+t.dataset.opt);
  else if (t.dataset.m) matchClick(t);
  else if (t.dataset.act === 'next') { Q.i++; quizRender(); }
  else if (t.dataset.act === 'restart') startPractica();
  else if (t.dataset.act === 'flip') $('#card').classList.toggle('on');
  else if (t.dataset.act === 'fnext') { Q.i = (Q.i + 1) % P.t.flash.length; flashRender(); }
  else if (t.dataset.act === 'prev') { Q.i = (Q.i - 1 + P.t.flash.length) % P.t.flash.length; flashRender(); }
});

/* =========================================================================
   MÓDULO 3: CHATBOT DE AUTOEVALUACIÓN (flujo lógico, sin APIs de terceros)
   ========================================================================= */
const chat = { started: false, ans: {} };
function say(who, html) {
  const me = who === 'user';
  $('#chat-log').insertAdjacentHTML('beforeend', `<div class="flex ${me ? 'justify-end' : ''}"><div class="max-w-[85%] p-3 rounded-xl border-2 border-ink ${me ? 'bg-mark' : 'bg-white'}">${html}</div></div>`);
  $('#chat-log').scrollTop = 1e6;
}
function controls(html) { $('#chat-controls').innerHTML = html; const f = $('#chat-controls button, #chat-controls textarea'); if (f) f.focus(); }

function chatStart() {
  chat.started = true; chat.ans = {}; $('#chat-log').innerHTML = '';
  if (!session) { say('bot', 'Para autoevaluarte primero debes ingresar con tu curso y documento.'); controls('<button class="btn btn-primary" onclick="showTab(\'inicio\')">Ir a Inicio</button>'); chat.started = false; return; }
  say('bot', `¡Hola, <strong>${esc(session.nombre.split(' ')[0])}</strong>! Vamos a revisar tu trabajo con ${DATA.rubrica.length} criterios. Responde con honestidad: es para ayudarte a mejorar.`);
  chatAsk(0);
}
function chatAsk(i) {
  const c = DATA.rubrica[i];
  if (!c) return chatReflect();
  say('bot', `<strong>${i + 1}. ${esc(c.titulo)}</strong><br>${esc(c.pregunta)}<ul class="mt-2 text-sm list-disc pl-5">${DATA.niveles.map((n, k) => `<li><strong>${n.n}:</strong> ${esc(c.desc[k])}</li>`).join('')}</ul>`);
  controls(DATA.niveles.map((n, k) => `<button class="btn" data-lvl="${k}" data-i="${i}">${n.n}</button>`).join(''));
}
function chatSuggest() {
  const v = Object.values(chat.ans).map(k => DATA.niveles[k].p);
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10;
}
function chatReflect() {
  const nota = chatSuggest();
  say('bot', `Según tus respuestas, tu nota sugerida es <strong>${nota.toFixed(1)}</strong> (es una guía, no la nota final). Escribe una reflexión: ¿qué hiciste bien y qué mejorarás?`);
  controls('<textarea id="refl" rows="3" maxlength="1000" class="w-full border-2 border-ink rounded-lg p-2" aria-label="Tu reflexión"></textarea><button class="btn btn-primary" data-send>Enviar autoevaluación</button>');
}
async function chatSend() {
  const txt = $('#refl').value.trim();
  if (txt.length < 10) { $('#refl').placeholder = 'Escribe al menos una frase (10 caracteres).'; return; }
  say('user', esc(txt)); controls('<span>Enviando…</span>');
  const detalle = Object.fromEntries(DATA.rubrica.map((c, i) => [c.titulo, DATA.niveles[chat.ans[i]].n]));
  try {
    const d = await apiPost({ action: 'autoevaluacion', curso: session.curso, documento: session.documento, detalle, notaSugerida: chatSuggest(), reflexion: txt });
    if (!d.ok) throw new Error(d.error);
    say('bot', '¡Listo! Tu autoevaluación quedó registrada. Gracias por reflexionar.');
    controls('<button class="btn" data-restart>Hacer otra autoevaluación</button>');
  } catch (ex) {
    say('bot', 'No pudimos enviar tus respuestas: ' + esc(ex.message) + '. Inténtalo de nuevo.');
    controls('<button class="btn btn-primary" data-retry>Reintentar</button>'); chat.retry = txt;
  }
}
$('#chat-controls').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.lvl) { const i = +b.dataset.i; chat.ans[i] = +b.dataset.lvl; say('user', DATA.niveles[+b.dataset.lvl].n); chatAsk(i + 1); }
  else if (b.hasAttribute('data-send')) chatSend();
  else if (b.hasAttribute('data-restart')) chatStart();
  else if (b.hasAttribute('data-retry')) { chatReflect(); $('#refl').value = chat.retry; }
});

/* =========================================================================
   MÓDULO 4: RECURSOS (PDF de Drive, videos de YouTube, libro)
   ========================================================================= */
function openViewer(title, id) {
  $('#viewer-title').textContent = title; $('#viewer-frame').src = drivePreview(id); $('#viewer').showModal();
}
$('#viewer-close').addEventListener('click', () => $('#viewer').close());
$('#viewer').addEventListener('close', () => $('#viewer-frame').src = 'about:blank');

function initRecursos() {
  $('#unidades').innerHTML = DATA.unidades.map(u => `<div><h3 class="font-bold text-lg mb-2">${esc(u.unidad)}</h3><div class="grid sm:grid-cols-2 gap-4">
    ${u.items.map(it => `<article class="card p-4"><p class="text-sm">${esc(it.tipo)}</p><h4 class="font-bold mb-3">${esc(it.titulo)}</h4>
      <button class="btn" data-pdf="${esc(it.drive)}" data-title="${esc(it.titulo)}">Abrir aquí</button>
      <a class="btn inline-block" href="${driveDownload(it.drive)}" target="_blank" rel="noopener">Descargar</a></article>`).join('')}</div></div>`).join('');
  $('#unidades').addEventListener('click', e => { const b = e.target.closest('[data-pdf]'); if (b) openViewer(b.dataset.title, b.dataset.pdf); });

  const play = i => {
    $('#player').src = `https://www.youtube-nocookie.com/embed/${DATA.videos[i].yt}?rel=0`;
    $$('#playlist button').forEach((b, k) => b.classList.toggle('bg-mark', k === i));
  };
  $('#playlist').innerHTML = DATA.videos.map((v, i) => `<li><button class="w-full text-left p-2 rounded font-bold" data-v="${i}">${esc(v.titulo)}</button></li>`).join('');
  $('#playlist').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) play(+b.dataset.v); });
  if (DATA.videos.length) play(0);

  $('#book').src = drivePreview(DATA.libro); $('#book-dl').href = driveDownload(DATA.libro);
}

/* =========================================================================
   ARRANQUE
   ========================================================================= */
renderSession(); initPractica(); initRecursos(); loadCursos();
