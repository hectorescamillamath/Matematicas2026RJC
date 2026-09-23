'use strict';
/* =========================================================================
   CONFIGURACIÓN (el contenido editable está en contenido.js)
   ========================================================================= */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzheA6kXcwm90mn8kqRArgI5qR2wVJ74xjonEg5zaMbzSyJEzUkYU_8HAe_7jn9KLCHDg/exec' // termina en /exec
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
if (session && session.v !== 2) { Session.clear(); session = null; } // formato antiguo

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
  if (name !== 'practica') mathMenu(); // cierra la partida en curso (y la registra) al salir de Práctica
}
$$('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));

/* =========================================================================
   MÓDULO 1: LOGIN Y NOTAS
   ========================================================================= */
// Acepta la respuesta del script nuevo (valor) y la del anterior (nota) para no perder notas si hay versiones mezcladas
const normEst = e => ({ ...e, v: 2, definitiva: e.definitiva ?? '', notas: (e.notas || []).map(n => ({ actividad: n.actividad, valor: String(n.valor ?? n.nota ?? '') })) });

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
    session = normEst(d.estudiante); Session.set(session); renderSession(); showTab('notas');
  } catch (ex) {
    err.textContent = ex.message.startsWith('HTTP') || ex.message === 'Failed to fetch'
      ? 'No pudimos conectar con el servidor. Revisa tu internet e inténtalo de nuevo.' : ex.message;
  } finally { btn.disabled = false; btn.textContent = 'Consultar'; }
});

$('#logout').addEventListener('click', () => { Session.clear(); session = null; chat.started = false; renderSession(); showTab('inicio'); });

async function refreshNotas() {
  if (!session) return;
  const b = $('#refresh-notas'); if (b) { b.disabled = true; b.textContent = 'Actualizando…'; }
  try {
    const d = await apiGet({ action: 'login', curso: session.curso, documento: session.documento });
    if (d.ok) { session = normEst(d.estudiante); Session.set(session); }
  } catch { /* se conservan las últimas notas guardadas */ }
  renderSession();
}

function renderSession() {
  const on = !!session;
  $('#login-box').hidden = on; $('#session-chip').classList.toggle('hidden', !on);
  $('#dashboard').classList.toggle('hidden', !on);
  if (!on) { $('#notas-out').innerHTML = '<div class="card p-6">Ingresa desde <button class="underline font-bold" onclick="showTab(\'inicio\')">Inicio</button> para ver tus notas.</div>'; return; }
  $('#session-name').textContent = session.nombre;
  const pub = session.notas.filter(n => n.valor !== '').length;
  $('#dashboard').innerHTML = `<div class="card p-6"><h2 class="font-display text-3xl font-extrabold">Hola, ${esc(session.nombre.split(' ')[0])}</h2>
    <p class="mt-1">Curso ${esc(session.curso)} · ${pub} de ${session.notas.length} calificaciones publicadas</p>
    <div class="mt-4 flex flex-wrap gap-2">${[['notas', 'Ver mis notas'], ['practica', 'Practicar'], ['autoeval', 'Autoevaluarme'], ['recursos', 'Ver recursos']]
      .map(([t, l]) => `<button class="btn" onclick="showTab('${t}')">${l}</button>`).join('')}</div></div>`;
  $('#notas-out').innerHTML = `<div class="card p-6">
    <div class="flex flex-wrap justify-between gap-2 items-center"><h2 class="font-display text-2xl font-extrabold">${esc(session.nombre)}</h2>
      <span class="px-3 py-1 rounded-full border-2 border-ink font-bold ${session.definitiva ? 'bg-mark' : 'bg-gray-200'}">Definitiva: ${session.definitiva ? esc(session.definitiva) : 'pendiente'}</span></div>
    <div class="overflow-x-auto mt-4"><table class="w-full text-left"><thead><tr class="border-b-2 border-ink"><th class="py-2">Actividad</th><th>Calificación</th></tr></thead><tbody>
    ${session.notas.map(n => `<tr class="border-b"><td class="py-2">${esc(n.actividad)}</td><td class="font-bold">${n.valor === '' ? '<span class="font-normal text-gray-600">Sin publicar</span>' : esc(n.valor)}</td></tr>`).join('') || '<tr><td colspan="2" class="py-3">Aún no hay actividades registradas.</td></tr>'}
    </tbody></table></div>
    <p class="mt-4 text-sm">Las calificaciones son ponderadas: el porcentaje de cada actividad aparece en su nombre. La definitiva la publica tu docente.</p>
    ${session.observaciones ? `<p class="mt-2"><strong>Observaciones:</strong> ${esc(session.observaciones)}</p>` : ''}
    <button id="refresh-notas" class="btn mt-4" onclick="refreshNotas()">Actualizar notas</button></div>`;
}

/* =========================================================================
   MÓDULO 3: CHATBOT DE AUTOEVALUACIÓN (rúbrica completa, sin APIs de terceros)
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
  say('bot', `¡Hola, <strong>${esc(session.nombre.split(' ')[0])}</strong>! Vamos a autoevaluar tu desempeño en ${DATA.rubrica.length} criterios. En cada uno elige la frase que mejor describe cómo has trabajado. Sé honesto: es para ayudarte a mejorar.`);
  chatAsk(0);
}
function chatAsk(i) {
  const r = DATA.rubrica[i];
  if (!r) return chatReflect();
  say('bot', `<strong>Criterio ${i + 1} de ${DATA.rubrica.length}: ${esc(r[0])}</strong><br>¿Cuál frase te describe mejor?`);
  // los descriptores se guardan de menor a mayor; se muestran de Superior a Muy bajo
  controls(DATA.niveles.map((n, k) => `<button class="btn w-full text-left" data-lvl="${k}" data-i="${i}"><strong>${n.n}.</strong> ${esc(r[1][DATA.niveles.length - 1 - k])}</button>`).join(''));
}
function chatSuggest() {
  const v = Object.values(chat.ans).map(k => DATA.niveles[k].p);
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10;
}
function chatReflect() {
  const rub = DATA.rubrica, weak = rub.filter((r, i) => chat.ans[i] >= 3).map(r => esc(r[0]));
  say('bot', `Este es tu resumen:<br>${rub.map((r, i) => `${esc(r[0])}: <strong>${DATA.niveles[chat.ans[i]].n}</strong>`).join('<br>')}<br><br>Tu nota sugerida es <strong>${chatSuggest().toFixed(1)}</strong> (es una guía, no la nota final).${weak.length ? `<br>Por fortalecer: <strong>${weak.join(', ')}</strong>.` : ''}<br><br>Escribe tu reflexión: ¿qué fortaleza destacas y qué vas a mejorar?`);
  controls('<textarea id="refl" rows="3" maxlength="1000" class="w-full border-2 border-ink rounded-lg p-2" aria-label="Tu reflexión"></textarea><button class="btn btn-primary" data-send>Enviar autoevaluación</button><button class="btn" data-restart>Empezar de nuevo</button>');
}
async function chatSend() {
  const txt = $('#refl').value.trim();
  if (txt.length < 10) { $('#refl').placeholder = 'Escribe al menos una frase (10 caracteres).'; return; }
  say('user', esc(txt)); controls('<span>Enviando…</span>');
  const detalle = Object.fromEntries(DATA.rubrica.map((r, i) => [r[0], DATA.niveles[chat.ans[i]].n]));
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
  if (b.dataset.lvl) { const i = +b.dataset.i, k = +b.dataset.lvl; chat.ans[i] = k; say('user', `<strong>${DATA.niveles[k].n}.</strong> ${esc(DATA.rubrica[i][1][DATA.niveles.length - 1 - k])}`); chatAsk(i + 1); }
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
      <a class="btn inline-block" href="${driveDownload(it.drive)}" target="_blank" rel="noopener">Descargar</a>${it.modo ? `<button class="btn btn-primary mt-2" data-play="${it.modo}">Practicar en línea</button>` : ''}</article>`).join('')}</div></div>`).join('');
  $('#unidades').addEventListener('click', e => {
    const b = e.target.closest('[data-pdf]'), p = e.target.closest('[data-play]');
    if (b) openViewer(b.dataset.title, b.dataset.pdf);
    if (p) { showTab('practica'); mathStart(p.dataset.play); }
  });

  const play = i => {
    $('#player').src = `https://www.youtube-nocookie.com/embed/${DATA.videos[i].yt}?rel=0`;
    $$('#playlist button').forEach((b, k) => b.classList.toggle('bg-mark', k === i));
  };
  $('#playlist').innerHTML = DATA.videos.map((v, i) => `<li><button class="w-full text-left p-2 rounded font-bold" data-v="${i}">${esc(v.titulo)}</button></li>`).join('');
  $('#playlist').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) play(+b.dataset.v); });
  if (DATA.videos.length) play(0);

  $('#book').src = drivePreview(DATA.libro); $('#book-dl').href = driveDownload(DATA.libro);
}

/* Tarjetas de estudio (fórmulas y definiciones) */
const Deck = { list: [], i: 0 };
function initTarjetas() {
  const sel = $('#deck'); sel.innerHTML = Object.keys(DATA.tarjetas).map(t => `<option>${esc(t)}</option>`).join('');
  const load = () => { Deck.list = [...DATA.tarjetas[sel.value]]; Deck.i = 0; deckRender(); };
  sel.addEventListener('change', load);
  $('#deck-shuffle').addEventListener('click', () => { Deck.list = shuffle(Deck.list); Deck.i = 0; deckRender(); });
  $('#deck-out').addEventListener('click', e => {
    const b = e.target.closest('[data-dk]'); if (!b) return;
    if (b.dataset.dk === 'flip') $('#deck-out .flip').classList.toggle('on');
    else { Deck.i = (Deck.i + (b.dataset.dk === 'next' ? 1 : -1) + Deck.list.length) % Deck.list.length; deckRender(); }
  });
  load();
}
function deckRender() {
  const [f, b] = Deck.list[Deck.i];
  $('#deck-out').innerHTML = `<p class="font-bold mb-2">Tarjeta ${Deck.i + 1} de ${Deck.list.length}</p>
    <div class="flip"><button class="flip-in w-full h-56 block" data-dk="flip" aria-label="Voltear tarjeta">
      <span class="face card font-display text-2xl font-extrabold" style="background:#FFE45E">${esc(f)}</span><span class="face back card text-lg" style="background:#fff">${esc(b)}</span></button></div>
    <div class="flex flex-wrap gap-2 mt-4"><button class="btn" data-dk="prev">Anterior</button><button class="btn" data-dk="flip">Voltear</button><button class="btn btn-primary" data-dk="next">Siguiente</button></div>`;
}


/* =========================================================================
   ARRANQUE
   ========================================================================= */
renderSession(); initPractica(); initRecursos(); initTarjetas(); loadCursos(); refreshNotas();
