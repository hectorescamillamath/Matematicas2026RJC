'use strict';
/* =========================================================================
   MÓDULO 2 · PRÁCTICA DE MATEMÁTICAS (8 modos)
   Debe cargarse ANTES de app.js (usa $, esc y shuffle de app.js en tiempo de ejecución).
   Cada generador gX(nivel 1-5) devuelve { q, ans:[números], tol, exp, svg?, multi?, unit?, ph }.
   El nivel sube cada 4 aciertos.
   ========================================================================= */
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[ri(0, a.length - 1)];
const R = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const fmt = n => String(R(n, 4)).replace('-', '−').replace('.', ',');
const sin = d => Math.sin(d * Math.PI / 180), cos = d => Math.cos(d * Math.PI / 180), tan = d => Math.tan(d * Math.PI / 180);
const deg = r => r * 180 / Math.PI;
const nz = () => pick([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
// Polinomio a·v² + b·v + c con signos bien escritos
const pl = (a, b, c, v = 'x') => [[a, v + '²'], [b, v], [c, '']].filter(t => t[0]).map((t, i) => {
  const ab = Math.abs(t[0]), body = (ab === 1 && t[1] ? '' : ab) + t[1];
  return i ? (t[0] < 0 ? ' − ' : ' + ') + body : (t[0] < 0 ? '−' : '') + body;
}).join('') || '0';

/* ---------- 1. Aritmética ---------- */
function gArit(L) {
  const m = [10, 20, 50, 100, 200][L - 1];
  const op = pick(['+', '−', ...(L > 1 ? ['×'] : []), ...(L > 2 ? ['÷'] : []), ...(L > 3 ? ['^', '√'] : []), ...(L > 4 ? ['mix'] : [])]);
  let q, a;
  if (op === '+') { const x = ri(1, m), y = ri(1, m); q = `${x} + ${y}`; a = x + y; }
  else if (op === '−') { let x = ri(1, m), y = ri(1, m); if (L < 3 && y > x) [x, y] = [y, x]; q = `${x} − ${y}`; a = x - y; }
  else if (op === '×') { const x = L < 3 ? ri(2, 12) : ri(11, 10 * L), y = L < 3 ? ri(2, 12) : ri(2, 9); q = `${x} × ${y}`; a = x * y; }
  else if (op === '÷') { const y = ri(2, 12), z = ri(2, 4 + 3 * L); q = `${y * z} ÷ ${y}`; a = z; }
  else if (op === '^') { const e = L > 4 && Math.random() < .4 ? ri(4, 8) : pick([2, 3]), b = e > 3 ? 2 : ri(2, e === 2 ? 12 : 5); q = `${b}<sup>${e}</sup>`; a = b ** e; }
  else if (op === '√') {
    if (L > 4 && Math.random() < .4) { const n = ri(2, 9); q = `∛${n ** 3}`; a = n; } else { const n = ri(2, 8 + 3 * L); q = `√${n * n}`; a = n; }
  } else {
    const x = ri(2, 20), y = ri(2, 9), z = ri(2, 9), w = ri(1, 20);
    if (Math.random() < .5) { q = `${x} + ${y} × ${z} − ${w}`; a = x + y * z - w; } else { q = `(${x} + ${y}) × ${z}`; a = (x + y) * z; }
  }
  return { q: `Calcula: <b class="text-2xl">${q}</b>`, ans: [a], tol: 0, exp: `Resultado: ${fmt(a)}`, ph: 'Tu respuesta' };
}

/* ---------- 2. Ecuaciones de primer grado (variable variable) ---------- */
function gLin(L) {
  const v = pick(['x', 'y', 'z', 't', 'n', 'm', 'k', 'w']), s = ri(-10, 10);
  let l, r;
  if (L === 1) { const a = nz(); l = pl(0, 1, a, v); r = fmt(s + a); }
  else if (L === 2) { const a = nz(); l = pl(0, a, 0, v); r = fmt(a * s); }
  else if (L === 3) { const a = nz(), b = nz(); l = pl(0, a, b, v); r = fmt(a * s + b); }
  else if (L === 4) { const a = nz(); let c = nz(); if (c === a) c = a + 1; const b = nz(), d = (a - c) * s + b; l = pl(0, a, b, v); r = pl(0, c, d, v); }
  else if (Math.random() < .5) { const a = ri(2, 6); let c = nz(); if (c === a) c = a + 1; const b = nz(), d = (a - c) * s + a * b; l = `${a}(${pl(0, 1, b, v)})`; r = pl(0, c, d, v); }
  else { const a = ri(2, 6), c = ri(-6, 6), b = ri(-9, 9); l = `(${pl(0, 1, b, v)})/${a}`; r = fmt(c); return { q: `Resuelve para <b>${v}</b>:<br><b class="text-2xl">${l} = ${r}</b>`, ans: [a * c - b], tol: 0, exp: `${v} = ${a}·${fmt(c)} − (${fmt(b)}) = ${fmt(a * c - b)}`, ph: `Valor de ${v}` }; }
  return { q: `Resuelve para <b>${v}</b>:<br><b class="text-2xl">${l} = ${r}</b>`, ans: [s], tol: 0, exp: `Agrupa los términos con ${v} a un lado y los números al otro: ${v} = ${fmt(s)}`, ph: `Valor de ${v}` };
}

/* ---------- 3. Ecuaciones de segundo grado ---------- */
function gQuad(L) {
  let a = 1, r1 = ri(1, 6), r2 = ri(1, 6), eq, exp;
  if (L === 2) { r1 = ri(-8, 8); r2 = ri(-8, 8); }
  if (L === 3) {
    const f = ri(0, 2), n = ri(2, 10);
    if (f === 0) { eq = `x² = ${n * n}`; r1 = n; r2 = -n; exp = 'Raíz cuadrada en ambos lados: x = ±' + n; }
    else if (f === 1) { const b = nz(); eq = `${pl(1, b, 0)} = 0`; r1 = 0; r2 = -b; exp = `Factor común: x(x ${b < 0 ? '−' : '+'} ${Math.abs(b)}) = 0`; }
    else { a = ri(2, 5); eq = `${pl(a, 0, -a * n * n)} = 0`; r1 = n; r2 = -n; exp = `Despeja x² = ${n * n}`; }
  } else if (L >= 4) { a = ri(L === 4 ? 2 : 1, L === 4 ? 3 : 4); r1 = ri(-7, 7); r2 = ri(-7, 7); }
  if (!eq) {
    const S = r1 + r2, P = r1 * r2;
    eq = L === 5 ? `${pl(a, -a * S, 0)} = ${fmt(-a * P)}` : `${pl(a, -a * S, a * P)} = 0`;
    exp = a === 1 ? `Factoriza: (x ${r1 < 0 ? '+' : '−'} ${Math.abs(r1)})(x ${r2 < 0 ? '+' : '−'} ${Math.abs(r2)}) = 0` : 'Pasa todo a un lado y usa la fórmula general: x = (−b ± √(b² − 4ac)) / 2a';
  }
  return { q: `Halla las soluciones reales:<br><b class="text-2xl">${eq}</b>`, ans: [r1, r2], tol: 0, multi: true, exp, ph: 'Soluciones separadas por ; (ej. 2; −3)' };
}

/* ---------- Dibujo de triángulos (lados a,b,c; ángulos A,B,C opuestos) ---------- */
function svgTri(a, b, c, lab = {}) {
  const cA = (b * b + c * c - a * a) / (2 * b * c), Cx = b * cA, Cy = b * Math.sqrt(Math.max(0, 1 - cA * cA));
  const W = 280, H = 190, xs = [0, c, Cx], x0 = Math.min(...xs), x1 = Math.max(...xs);
  const s = Math.min((W - 90) / (x1 - x0), (H - 80) / Cy), ox = (W - (x1 - x0) * s) / 2, oy = (H - Cy * s) / 2;
  const T = ([x, y]) => [ox + (x - x0) * s, H - oy - y * s];
  const V = { A: T([0, 0]), B: T([c, 0]), C: T([Cx, Cy]) };
  const G = [0, 1].map(i => (V.A[i] + V.B[i] + V.C[i]) / 3);
  const off = (p, d, sg = 1) => { const dx = (p[0] - G[0]) * sg, dy = (p[1] - G[1]) * sg, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * d, p[1] + dy / l * d]; };
  const tx = (p, t, w = 13) => `<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${w}" font-weight="700" fill="#14213D">${t}</text>`;
  let o = `<polygon points="${[V.A, V.B, V.C].map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="#FFF7C2" stroke="#14213D" stroke-width="2.5" stroke-linejoin="round"/>`;
  for (const k of 'ABC') o += tx(off(V[k], 15), k, 15);
  const sd = { a: [V.B, V.C], b: [V.A, V.C], c: [V.A, V.B] };
  for (const k in sd) if (lab[k] !== undefined) o += tx(off([(sd[k][0][0] + sd[k][1][0]) / 2, (sd[k][0][1] + sd[k][1][1]) / 2], 20), `${k} = ${lab[k]}`);
  for (const k of 'ABC') if (lab[k] === undefined || k === 'C' && lab.C === '90') continue; else o += tx(off(V[k], 27, -1), lab[k], 12);
  if (lab.C === '90') {
    const u = q => { const dx = q[0] - V.C[0], dy = q[1] - V.C[1], l = Math.hypot(dx, dy); return [dx / l * 12, dy / l * 12]; }, e1 = u(V.A), e2 = u(V.B), C = V.C;
    o += `<polyline points="${C[0] + e1[0]},${C[1] + e1[1]} ${C[0] + e1[0] + e2[0]},${C[1] + e1[1] + e2[1]} ${C[0] + e2[0]},${C[1] + e2[1]}" fill="none" stroke="#14213D" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="w-full max-w-sm mx-auto" role="img" aria-label="Triángulo con los datos del problema">${o}</svg>`;
}

/* ---------- 4. Teorema de Pitágoras ---------- */
function gPyth(L) {
  const T = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
  let a, b, c, u;
  if (L <= 2) { const k = ri(1, L === 1 ? 2 : 4); [a, b, c] = pick(T.slice(0, L === 1 ? 2 : 5)).map(x => x * k); u = L === 1 ? 'c' : pick(['a', 'b']); }
  else if (L === 3 || (L === 5 && Math.random() < .33)) { const f = L === 3 ? () => ri(3, 15) : () => ri(20, 150) / 10; a = f(); b = f(); c = Math.hypot(a, b); u = 'c'; }
  else {
    c = L === 4 ? ri(10, 25) : ri(100, 300) / 10;
    const x = L === 4 ? ri(3, c - 2) : R(c * ri(20, 90) / 100, 1); u = pick(['a', 'b']);
    if (u === 'a') { b = x; a = Math.sqrt(c * c - x * x); } else { a = x; b = Math.sqrt(c * c - x * x); }
  }
  const S = { a, b, c }, lab = { C: '90' }; for (const k of 'abc') lab[k] = k === u ? '?' : fmt(S[k]);
  const o = u === 'a' ? 'b' : 'a', ans = R(S[u]);
  const exp = u === 'c' ? `c² = a² + b² ⇒ c = √(${fmt(a)}² + ${fmt(b)}²) ≈ ${fmt(ans)}` : `${u}² = c² − ${o}² ⇒ ${u} = √(${fmt(c)}² − ${fmt(S[o])}²) ≈ ${fmt(ans)}`;
  return { svg: svgTri(a, b, c, lab), q: `Triángulo rectángulo (ángulo recto en C, hipotenusa <b>c</b>). Halla el lado <b>${u}</b>; redondea a 2 decimales si es necesario.`, ans: [ans], tol: .02, exp, ph: 'Longitud del lado' };
}

/* ---------- 5. Razones trigonométricas en triángulo rectángulo ---------- */
function gTrigR(L) {
  const A = L === 1 ? pick([30, 45, 60]) : ri(15, 75), K = ri(6, 30);
  const sd = [['a', 'c'], ['b', 'c'], ['a', 'b'], ['b', 'a'], ['c', 'a'], ['c', 'b']], an = [['A', 'ab'], ['A', 'ac'], ['A', 'bc']];
  const [u, g] = pick(L === 1 ? sd.slice(0, 2) : L === 2 ? sd.slice(0, 4) : L === 3 ? sd : L === 4 ? an : [...sd, ...an]);
  const S = {}, lab = { C: '90' }; let ans, tol = .02, exp, q, unit = '';
  if (u === 'A') {
    if (g === 'ab') { S.a = ri(3, 20); S.b = ri(3, 20); S.c = Math.hypot(S.a, S.b); ans = deg(Math.atan(S.a / S.b)); exp = 'tan A = a/b ⇒ A = tan⁻¹(a/b)'; }
    else { S.c = ri(8, 25); const x = ri(3, S.c - 1); if (g === 'ac') { S.a = x; S.b = Math.sqrt(S.c ** 2 - x * x); ans = deg(Math.asin(x / S.c)); exp = 'sen A = a/c ⇒ A = sen⁻¹(a/c)'; } else { S.b = x; S.a = Math.sqrt(S.c ** 2 - x * x); ans = deg(Math.acos(x / S.c)); exp = 'cos A = b/c ⇒ A = cos⁻¹(b/c)'; } }
    for (const k of g) lab[k] = fmt(S[k]); lab.A = '?'; ans = R(ans, 1); tol = .11; unit = '°'; q = 'Halla el ángulo <b>A</b> en grados (1 decimal).';
  } else {
    S[g] = K;
    if (g === 'c') { S.a = K * sin(A); S.b = K * cos(A); } else if (g === 'a') { S.c = K / sin(A); S.b = K / tan(A); } else { S.c = K / cos(A); S.a = K * tan(A); }
    lab[g] = K; lab[u] = '?'; lab.A = A + '°'; ans = R(S[u]);
    exp = { ac: 'sen A = a/c ⇒ a = c·sen A', bc: 'cos A = b/c ⇒ b = c·cos A', ab: 'tan A = a/b ⇒ a = b·tan A', ba: 'tan A = a/b ⇒ b = a / tan A', ca: 'sen A = a/c ⇒ c = a / sen A', cb: 'cos A = b/c ⇒ c = b / cos A' }[u + g] + ` = ${fmt(ans)}`;
    q = `Halla el lado <b>${u}</b> (2 decimales).`;
  }
  return { svg: svgTri(S.a, S.b, S.c, lab), q: q + '<br><span class="text-sm">a es opuesto a A, b es adyacente y c es la hipotenusa.</span>', ans: [ans], tol, unit, exp, ph: u === 'A' ? 'Ángulo en grados' : 'Longitud del lado' };
}

/* ---------- 6. Triángulos generales: leyes de seno y coseno ---------- */
function gTri(L) {
  const kind = L === 1 ? 'ALA' : L === 2 ? 'LAL' : L === 3 ? 'LLL' : L === 4 ? 'LLA' : pick(['ALA', 'LAL', 'LLL', 'LLA']);
  let a, b, c, lab, q, ans, tol = .02, exp, unit = '';
  if (kind === 'ALA') {
    const A = ri(30, 80), B = ri(30, 80), C = 180 - A - B, u = pick(['b', 'c']); a = ri(8, 30); b = a * sin(B) / sin(A); c = a * sin(C) / sin(A);
    lab = { a, A: A + '°', B: B + '°' }; lab[u] = '?'; ans = R(u === 'b' ? b : c); q = `Halla el lado <b>${u}</b> (2 decimales).`;
    exp = (u === 'b' ? 'Ley de senos: b = a·sen B / sen A' : 'C = 180° − A − B; luego c = a·sen C / sen A') + ` = ${fmt(ans)}`;
  } else if (kind === 'LAL') {
    const A = ri(30, 120); b = ri(6, 30); c = ri(6, 30); a = Math.sqrt(b * b + c * c - 2 * b * c * cos(A));
    lab = { b, c, A: A + '°', a: '?' }; ans = R(a); q = 'Halla el lado <b>a</b> (2 decimales).'; exp = `Ley de cosenos: a² = b² + c² − 2bc·cos A ⇒ a = ${fmt(ans)}`;
  } else if (kind === 'LLL') {
    a = ri(6, 20); b = ri(6, 20); c = ri(Math.abs(a - b) + 2, a + b - 2);
    const X = pick(['A', 'B', 'C']), [p, m, n] = X === 'A' ? [a, b, c] : X === 'B' ? [b, a, c] : [c, a, b];
    ans = R(deg(Math.acos((m * m + n * n - p * p) / (2 * m * n))), 1); tol = .11; unit = '°';
    lab = { a, b, c }; lab[X] = '?'; q = `Halla el ángulo <b>${X}</b> en grados (1 decimal).`;
    exp = `Ley de cosenos: cos ${X} = (${m}² + ${n}² − ${p}²) / (2·${m}·${n}) ⇒ ${X} = ${fmt(ans)}°`;
  } else {
    const A = ri(30, 110); a = ri(10, 30); b = ri(5, a - 1); const B = deg(Math.asin(b * sin(A) / a)); c = a * sin(180 - A - B) / sin(A);
    lab = { a, b, A: A + '°', B: '?' }; ans = R(B, 1); tol = .11; unit = '°'; q = 'Halla el ángulo <b>B</b> en grados (1 decimal).';
    exp = `Ley de senos: sen B = b·sen A / a ⇒ B = ${fmt(ans)}°`;
  }
  return { svg: svgTri(a, b, c, lab), q, ans: [ans], tol, unit, exp, ph: unit ? 'Ángulo en grados' : 'Longitud del lado' };
}

/* ---------- 7. Ecuaciones trigonométricas (0° ≤ x < 360°) ---------- */
const TV = { sin: { 30: '1/2', 45: '√2/2', 60: '√3/2' }, cos: { 30: '√3/2', 45: '√2/2', 60: '1/2' }, tan: { 30: '√3/3', 45: '1', 60: '√3' } };
const TK = { sin: [2, { 30: '1', 45: '√2', 60: '√3' }], cos: [2, { 30: '√3', 45: '√2', 60: '1' }], tan: [3, { 30: '√3', 45: '3', 60: '3√3' }] };
function gTrigEq(L) {
  const fn = pick(['sin', 'cos', 'tan']), t = pick([30, 45, 60]), neg = L > 1 && Math.random() < .5;
  const nm = fn === 'sin' ? 'sen' : fn, arg = L === 5 ? '2x' : 'x', cx = L === 3 || L === 4 || (L === 5 && Math.random() < .5);
  const rhs = (neg ? '−' : '') + (cx ? TK[fn][1][t] : TV[fn][t]), lhs = (cx ? TK[fn][0] + ' ' : '') + `${nm} ${arg}`;
  let base = fn === 'sin' ? (neg ? [180 + t, 360 - t] : [t, 180 - t]) : fn === 'cos' ? (neg ? [180 - t, 180 + t] : [t, 360 - t]) : (neg ? [180 - t, 360 - t] : [t, 180 + t]);
  const ans = (L === 5 ? base.flatMap(v => [v / 2, (v + 360) / 2]) : base).sort((x, y) => x - y);
  return { q: `Resuelve para 0° ≤ x < 360°:<br><b class="text-2xl">${lhs} = ${rhs}</b>`, ans, tol: .05, multi: true, unit: '°',
    exp: `Ángulo de referencia: ${t}°. ${L === 5 ? 'Resuelve 2x en [0°, 720°) y divide entre 2. ' : ''}Soluciones: ${ans.map(fmt).join('°; ')}°`, ph: 'Ángulos separados por ; (ej. 30; 150)' };
}

/* ---------- 8. ¿Quién quiere ser millonario? (contenido editable) ---------- */
const PRIZES = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000]; // puntos; punto seguro en la pregunta 5
const MILL = [
  { q: '¿Cuántos grados suman los ángulos internos de un triángulo?', o: ['90°', '180°', '270°', '360°'], a: 1, e: 'En geometría plana siempre suman 180°.' },
  { q: '¿Cómo se llama el lado opuesto al ángulo recto?', o: ['Cateto', 'Hipotenusa', 'Base', 'Apotema'], a: 1, e: 'La hipotenusa es el lado más largo del triángulo rectángulo.' },
  { q: '¿Cuánto vale aproximadamente π?', o: ['2,71', '3,14', '1,61', '9,81'], a: 1, e: 'π ≈ 3,14159… es la razón entre circunferencia y diámetro.' },
  { q: 'Según Pitágoras, en un triángulo rectángulo…', o: ['a + b = c', 'a² + b² = c²', 'a·b = c', 'a² − b² = c²'], a: 1, e: 'La suma de los cuadrados de los catetos es el cuadrado de la hipotenusa.' },
  { q: '¿Cuánto vale sen²x + cos²x?', o: ['0', '2', '1', 'tan x'], a: 2, e: 'Es la identidad pitagórica fundamental.' },
  { q: '¿A cuántos radianes equivalen 180°?', o: ['π/2', 'π', '2π', '3π/2'], a: 1, e: '180° = π rad.' },
  { q: '¿Cuánto vale sen 30°?', o: ['√3/2', '√2/2', '1/2', '1'], a: 2, e: 'sen 30° = 1/2.' },
  { q: 'La tangente de un ángulo se define como…', o: ['cos/sen', 'sen/cos', 'sen·cos', '1/sen'], a: 1, e: 'tan x = sen x / cos x.' },
  { q: '¿Cuál es el periodo de la función seno?', o: ['π', 'π/2', '2π', '4π'], a: 2, e: 'sen(x + 2π) = sen x.' },
  { q: '¿A qué astrónomo griego se le llama "padre de la trigonometría"?', o: ['Euclides', 'Hiparco', 'Arquímedes', 'Tales'], a: 1, e: 'Hiparco de Nicea elaboró las primeras tablas de cuerdas (siglo II a. C.).' }
];

/* =========================================================================
   MOTOR DE JUEGO
   ========================================================================= */
const MODES = [
  { id: 'arit', t: 'Aritmética', d: 'Sumas, restas, productos, divisiones, potencias y raíces', g: gArit },
  { id: 'lin', t: 'Ecuaciones de 1.er grado', d: 'Una incógnita (no siempre x)', g: gLin },
  { id: 'quad', t: 'Ecuaciones de 2.º grado', d: 'Factorización y fórmula general', g: gQuad },
  { id: 'pit', t: 'Teorema de Pitágoras', d: 'Lados de triángulos rectángulos', g: gPyth },
  { id: 'raz', t: 'Razones trigonométricas', d: 'Lados y ángulos con sen, cos y tan', g: gTrigR },
  { id: 'gen', t: 'Leyes de seno y coseno', d: 'Triángulos que no son rectángulos', g: gTri },
  { id: 'teq', t: 'Ecuaciones trigonométricas', d: 'Todas las soluciones entre 0° y 360°', g: gTrigEq },
  { id: 'mill', t: '¿Quién quiere ser millonario?', d: 'Conocimiento general con comodines' }
];
const G = {}, lvlOf = c => Math.min(5, 1 + Math.floor(c / (G.m && G.m.id === 'arit' ? 3 : 4))); // sube de nivel cada 4 aciertos (3 en aritmética)

function initPractica() {
  $('#math-menu').innerHTML = MODES.map(m => `<button class="card p-4 text-left hover:bg-mark" data-mode="${m.id}"><span class="font-display font-extrabold text-lg block">${m.t}</span><span class="text-sm">${m.d}</span></button>`).join('');
  $('#math-menu').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) mathStart(b.dataset.mode); });
  const g = $('#math-game');
  g.addEventListener('submit', e => { e.preventDefault(); mathCheck(); });
  g.addEventListener('click', e => { const b = e.target.closest('button'); if (b) onGameClick(b); });
  window.addEventListener('pagehide', () => logGame());
  logNote(); flushLogs();
}
/* ---------- Registro para el docente: se envía a Google Sheets al terminar cada partida ---------- */
const PEND = 'aula_pend_juegos';
function sendLog(p) {
  fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), keepalive: true })
    .then(r => r.json())
    .catch(() => { try { const q = JSON.parse(localStorage.getItem(PEND) || '[]'); q.push(p); localStorage.setItem(PEND, JSON.stringify(q.slice(-30))); } catch { } }); // sin conexión: se reintenta al abrir la página
}
function flushLogs() { try { const q = JSON.parse(localStorage.getItem(PEND) || '[]'); localStorage.removeItem(PEND); q.forEach(sendLog); } catch { } }
function logNote() { const n = $('#log-note'); if (n) n.textContent = session ? 'Tus resultados se guardan para que tu docente pueda ver tu progreso.' : 'Ingresa en Inicio con tu curso y documento para que tus resultados queden registrados.'; }
function logGame() {
  if (!G.m || G.logged || !session) return;
  const mill = G.m.id === 'mill', M = G.M || {};
  const ac = mill ? M.i : G.c, it = mill ? M.i + (M.msg === 'Respuesta incorrecta' ? 1 : 0) : G.n;
  if (!it) return;
  G.logged = true;
  const cfg = mill ? (M.st === 'end' ? `${M.msg}: ${M.won} puntos` : `Abandonó en la pregunta ${M.i + 1}`) : G.dur ? DURS.find(d => d[0] === G.dur)[1] : '';
  sendLog({ action: 'juego', ts: Date.now(), curso: session.curso, documento: session.documento, modo: G.m.t, config: cfg, aciertos: ac, intentos: it,
    nivel: mill ? 0 : lvlOf(G.c), racha: mill ? 0 : G.best, segundos: Math.min(G.dur || 1e9, Math.round((Date.now() - G.t0) / 1000)) });
}

function mathMenu() { logGame(); logNote(); clearInterval(G.timer); clearTimeout(G.nt); $('#math-game').classList.add('hidden'); $('#math-menu').classList.remove('hidden'); }
const DURS = [[30, '30 s'], [60, '1 min'], [120, '2 min'], [300, '5 min']];
const rec = d => { try { return +localStorage.getItem('aula_rec_' + d) || 0; } catch { return 0; } };

function mathStart(id) {
  logGame(); clearInterval(G.timer); clearTimeout(G.nt);
  Object.assign(G, { m: MODES.find(m => m.id === id), c: 0, n: 0, streak: 0, best: 0, retry: false, dur: 0, logged: false, t0: Date.now() });
  $('#math-menu').classList.add('hidden'); $('#math-game').classList.remove('hidden');
  if (id === 'mill') return millStart();
  if (id === 'arit') {
    $('#math-game').innerHTML = `<button class="underline font-bold" data-mact="menu">← Modos</button>
      <h3 class="font-display text-2xl font-extrabold my-2">Aritmética contrarreloj</h3>
      <p class="mb-4">Resuelve todas las operaciones que puedas: la dificultad sube con tus aciertos. Si fallas, debes escribir la respuesta correcta para continuar (el tiempo sigue corriendo). Elige la duración:</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${DURS.map(([s, l]) => `<button class="btn" data-dur="${s}"><span class="block text-xl">${l}</span><span class="text-xs font-normal">Récord: ${rec(s)}</span></button>`).join('')}</div>`;
    return;
  }
  mathFrame(); mathNext();
}
function startArit(d) {
  logGame(); clearInterval(G.timer); Object.assign(G, { dur: d, c: 0, n: 0, streak: 0, best: 0, retry: false, logged: false, t0: Date.now() });
  mathFrame(); mathNext();
  G.endAt = Date.now() + d * 1000;
  G.timer = setInterval(() => {
    const left = Math.max(0, Math.ceil((G.endAt - Date.now()) / 1000));
    $('#ctext').textContent = `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; $('#cbar').style.width = (left / d * 100) + '%';
    if (left <= 0) mathEnd(true);
  }, 250);
}
// El marco (y el campo de texto) se crea una sola vez por partida: así el teclado del móvil no se cierra entre preguntas
function mathFrame() {
  $('#math-game').innerHTML = `<div id="mhead" class="flex flex-wrap justify-between gap-2 font-bold mb-3"></div>
    ${G.dur ? '<div class="mb-3"><div id="ctext" class="font-bold text-xl" role="timer"></div><div class="h-2 bg-gray-200 rounded"><div id="cbar" class="h-2 bg-brand rounded" style="width:100%"></div></div></div>' : ''}
    <div id="mbody"></div>
    <form id="mform" class="flex flex-wrap gap-2 mt-3"><input id="mans" autocomplete="off" class="border-2 border-ink rounded-lg p-2 flex-1 min-w-[10rem]" aria-label="Respuesta"><button class="btn btn-primary">Comprobar</button></form>
    <div id="mfb" class="mt-4" aria-live="polite"></div><div class="mt-4"><button class="btn" data-mact="end">Terminar y ver resumen</button></div>`;
}
function mathHead() {
  $('#mhead').innerHTML = `<button class="underline" data-mact="menu">← Modos</button><span>${G.m.t}</span><span>Nivel ${lvlOf(G.c)}/5</span><span>Aciertos ${G.c}/${G.n}</span><span>Racha ${G.streak}</span>`;
}
function mathNext(banner = '') {
  G.cur = G.m.g(lvlOf(G.c)); G.retry = false;
  $('#mbody').innerHTML = `${G.cur.svg || ''}<p class="text-xl my-3">${G.cur.q}</p>`;
  const inp = $('#mans'); inp.value = ''; inp.placeholder = G.cur.ph; $('#mfb').innerHTML = banner; mathHead(); inp.focus();
}
const parseNums = (s, multi) => (s.replace(/−/g, '-').replace(/,/g, multi ? ' ' : '.').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
function mathCheck() {
  const c = G.cur, inp = $('#mans'), u = parseNums(inp.value, c.multi); if (!u.length) return;
  const ex = [...new Set(c.ans)].sort((x, y) => x - y), us = [...new Set(u)].sort((x, y) => x - y);
  const ok = us.length === ex.length && ex.every((v, i) => Math.abs(v - us[i]) <= (c.tol || 0) + 1e-9);
  if (G.retry) { // corrección obligatoria: no cuenta como acierto, pero permite avanzar
    if (ok) mathNext('<p class="font-bold text-green-700">Bien corregido. Sigamos con otra.</p>');
    else { $('#mfb').firstElementChild && ($('#mfb').firstElementChild.textContent = 'Todavía no coincide. Revisa la solución y escríbela para continuar.'); inp.select(); }
    return;
  }
  G.n++;
  if (ok) { // acierto: pasa a la siguiente automáticamente
    const before = lvlOf(G.c); G.c++; G.streak++; G.best = Math.max(G.best, G.streak);
    mathNext(`<p class="font-bold text-green-700">✓ ¡Correcto!${lvlOf(G.c) > before ? ` <span class="bg-mark text-ink px-2 rounded">¡Nivel ${lvlOf(G.c)}!</span>` : ''}</p>`);
  } else { // error: revisión y repetición hasta escribir la respuesta correcta
    G.streak = 0; G.retry = true; mathHead();
    $('#mfb').innerHTML = `<p class="font-bold text-red-700">Incorrecto. Revisa la solución y escribe la respuesta correcta para continuar.</p>
      <p>Respuesta correcta: <strong>${ex.map(fmt).join('; ')}${c.unit || ''}</strong></p><p class="text-sm">${c.exp}</p>`;
    inp.value = ''; inp.focus();
  }
}
function mathEnd(timeUp) {
  clearInterval(G.timer); logGame();
  const pct = G.n ? Math.round(G.c / G.n * 100) : 0; let extra = '';
  if (G.dur && G.c > rec(G.dur)) { try { localStorage.setItem('aula_rec_' + G.dur, G.c); } catch { } extra = '<p class="font-bold bg-mark inline-block px-2 rounded mb-3">¡Nuevo récord!</p>'; }
  $('#math-game').innerHTML = `<h3 class="font-display text-2xl font-extrabold">${timeUp ? '¡Se acabó el tiempo!' : 'Resumen'}: ${G.m.t}${G.dur ? ' (' + DURS.find(d => d[0] === G.dur)[1] + ')' : ''}</h3>${extra}
    <p class="my-3">Aciertos: <strong>${G.c}</strong> de ${G.n} (${pct}%) · Nivel alcanzado: <strong>${lvlOf(G.c)}</strong> · Mejor racha: <strong>${G.best}</strong></p>
    <button class="btn btn-primary" data-mact="again">Jugar de nuevo</button> ${G.dur ? '<button class="btn" data-mact="choose">Cambiar duración</button>' : ''} <button class="btn" data-mact="menu">Cambiar de modo</button>`;
}

/* ---------- Millonario ---------- */
function millStart() {
  G.M = { i: 0, hid: [], f50: true, call: true, st: 'ask', tip: '', qs: MILL.map(x => ({ ...x, o: shuffle(x.o.map((t, k) => ({ t, ok: k === x.a }))) })) };
  millRender();
}
function millRender() {
  const M = G.M, q = M.qs[M.i], el = $('#math-game');
  if (M.st === 'end') { logGame(); el.innerHTML = `<h3 class="font-display text-2xl font-extrabold">${M.msg}</h3><p class="my-3">Te llevas <strong>${M.won} puntos</strong>.</p><button class="btn btn-primary" data-mact="again">Jugar de nuevo</button> <button class="btn" data-mact="menu">Cambiar de modo</button>`; return; }
  const fb = M.st === 'fb';
  el.innerHTML = `<div class="flex flex-wrap justify-between gap-2 font-bold mb-3"><button class="underline" data-mact="menu">← Modos</button><span>Pregunta ${M.i + 1} de ${MILL.length}</span><span>En juego: ${PRIZES[M.i]} puntos</span></div>
    <div class="flex flex-wrap gap-2 mb-3"><button class="btn" data-mact="f50" ${M.f50 && !fb ? '' : 'disabled'}>50:50</button><button class="btn" data-mact="call" ${M.call && !fb ? '' : 'disabled'}>Llamar a un amigo</button><button class="btn" data-mact="retire" ${fb ? 'disabled' : ''}>Retirarme</button></div>
    <p class="text-xl font-bold mb-3">${esc(q.q)}</p>
    <div class="grid sm:grid-cols-2 gap-2">${q.o.map((o, k) => {
      const hid = M.hid.includes(k), cl = fb ? (o.ok ? 'bg-green-200' : k === M.sel ? 'bg-red-200' : '') : '';
      return `<button class="btn text-left ${cl} ${hid ? 'opacity-30' : ''}" data-mo="${k}" ${hid || fb ? 'disabled' : ''}>${'ABCD'[k]}. ${hid ? '—' : esc(o.t)}</button>`;
    }).join('')}</div>
    <p class="mt-3 text-sm">${esc(M.tip)}</p>${fb ? `<p class="mt-3">${esc(q.e)}</p><button class="btn btn-primary mt-3" data-mact="mnext">Continuar</button>` : ''}`;
}
function onGameClick(b) {
  const a = b.dataset.mact, M = G.M;
  if (a === 'menu') mathMenu();
  else if (a === 'again') G.dur ? startArit(G.dur) : mathStart(G.m.id);
  else if (a === 'choose') mathStart('arit');
  else if (b.dataset.dur) startArit(+b.dataset.dur);
  else if (a === 'end') mathEnd();
  else if (b.dataset.mo !== undefined) { M.sel = +b.dataset.mo; M.st = 'fb'; millRender(); $('[data-mact=mnext]').focus();
    if (M.qs[M.i].o[M.sel].ok) G.nt = setTimeout(() => onGameClick({ dataset: { mact: 'mnext' } }), 1500); } // acierto: avanza sola
  else if (a === 'mnext') {
    clearTimeout(G.nt);
    if (!M.qs[M.i].o[M.sel].ok) Object.assign(M, { st: 'end', msg: 'Respuesta incorrecta', won: M.i >= 5 ? PRIZES[4] : 0 });
    else if (++M.i === MILL.length) Object.assign(M, { st: 'end', msg: '¡Completaste el reto!', won: PRIZES[9] });
    else Object.assign(M, { st: 'ask', hid: [], tip: '' });
    millRender();
  } else if (a === 'retire') { Object.assign(M, { st: 'end', msg: 'Decidiste retirarte', won: M.i ? PRIZES[M.i - 1] : 0 }); millRender(); }
  else if (a === 'f50') { const q = M.qs[M.i]; M.hid = shuffle(q.o.map((o, k) => k).filter(k => !q.o[k].ok)).slice(0, 2); M.f50 = false; millRender(); }
  else if (a === 'call') {
    const q = M.qs[M.i], vis = q.o.map((o, k) => k).filter(k => !M.hid.includes(k)), right = q.o.findIndex(o => o.ok);
    const k = Math.random() < .75 ? right : pick(vis.filter(x => x !== right));
    M.tip = `Tu amigo dice: "Yo creo que es la ${'ABCD'[k]}${Math.random() < .5 ? ', pero no estoy seguro' : ''}".`; M.call = false; millRender();
  }
}
