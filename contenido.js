'use strict';
/* =========================================================================
   CONTENIDO EDITABLE (rúbrica, recursos y tarjetas de estudio)
   Debe cargarse ANTES de app.js.
   ========================================================================= */
const DATA = {
  // --- Niveles de desempeño (de mayor a menor) y puntos en escala 1.0 - 5.0
  niveles: [{ n: '5', p: 5 }, { n: '4', p: 4 }, { n: '3', p: 3 }, { n: '2', p: 2 }, { n: '1', p: 1 }],

  // --- Rúbrica: [criterio, [5 descriptores ordenados de MENOR a MAYOR desempeño]]
  rubrica: [
    ['Respeto Mutuo', [
      'No respeto a mis compañeros ni al profesor, interrumpo y uso lenguaje inapropiado.',
      'Respeto solo de vez en cuando, a veces interrumpo y uso lenguaje inapropiado.',
      'Casi siempre respeto, rara vez interrumpo o uso lenguaje inapropiado.',
      'Respeto a todos, casi nunca interrumpo y utilizo un lenguaje adecuado.',
      'Siempre muestro respeto a todos, no interrumpo y uso un lenguaje apropiado.']],
    ['Puntualidad', [
      'Llego tarde con frecuencia y no entrego mis tareas a tiempo.',
      'Llego tarde o entrego tarde mis tareas muy seguido, y esto afecta mi rendimiento.',
      'Llego a tiempo y entrego mis tareas en su mayoría a tiempo, aunque a veces me atraso.',
      'Generalmente soy puntual y entrego todo a tiempo, casi no afecta mi rendimiento.',
      'Siempre llego puntual y entrego todas mis tareas a tiempo.']],
    ['Participación Activa', [
      'No participo en clase ni en las actividades de grupo, muestro desinterés.',
      'Participo solo cuando me lo piden directamente.',
      'Participo en algunas ocasiones y muestro algo de interés.',
      'Participo frecuentemente y contribuyo en discusiones y actividades grupales.',
      'Siempre participo activamente, demuestro interés y ayudo a dinamizar las discusiones.']],
    ['Preparación', [
      'No traigo materiales ni tareas, y no reviso los temas antes de clase.',
      'A veces traigo materiales y tareas, y reviso los temas solo de forma superficial.',
      'Casi siempre vengo preparado, con la mayoría de materiales y tareas listos.',
      'Estoy bien preparado la mayor parte del tiempo, reviso los temas con profundidad.',
      'Siempre llego completamente preparado, con todos los materiales y tareas revisados.']],
    ['Ambiente de Aprendizaje', [
      'Contribuyo a un ambiente negativo y suelo distraer a mis compañeros.',
      'A veces contribuyo de forma negativa o distraigo a los demás.',
      'A veces contribuyo de forma positiva y rara vez distraigo a mis compañeros.',
      'Generalmente contribuyo a un ambiente positivo y motivo a otros.',
      'Siempre ayudo a crear un ambiente positivo y mantengo a mis compañeros enfocados.']],
    ['Colaboración', [
      'No trabajo en equipo ni participo en actividades grupales.',
      'Colaboro rara vez y solo cuando es estrictamente necesario.',
      'Colaboro algunas veces y hago aportes en el trabajo grupal.',
      'Colaboro con frecuencia y aporto significativamente en las actividades.',
      'Siempre colaboro de manera efectiva y ayudo a fomentar la colaboración.']],
    ['Responsabilidad', [
      'No asumo responsabilidad por mi aprendizaje y culpo a otros por mis errores.',
      'Asumo responsabilidad solo en ocasiones y suelo culpar a otros.',
      'Acepto mis errores a veces, aunque no siempre los corrijo.',
      'Generalmente reconozco y corrijo mis errores por iniciativa propia.',
      'Siempre asumo la responsabilidad de mis actos, corrijo errores y me esfuerzo por mejorar.']],
    ['Uso de Tecnología', [
      'Uso la tecnología de forma inadecuada y distraigo a los demás.',
      'A veces uso la tecnología mal y causo distracciones.',
      'Uso la tecnología adecuadamente la mayoría de las veces.',
      'Uso la tecnología de forma responsable casi siempre.',
      'Siempre uso la tecnología de forma adecuada y responsable para apoyar mi aprendizaje.']],
    ['Ayuda Mutua', [
      'No ayudo a mis compañeros y muestro indiferencia hacia sus necesidades.',
      'Rara vez ofrezco ayuda a mis compañeros.',
      'Ofrezco ayuda de vez en cuando, pero no siempre soy proactivo.',
      'Ayudo frecuentemente a mis compañeros y muestro interés en sus necesidades.',
      'Siempre estoy dispuesto a ayudar y me esfuerzo por apoyar a mis compañeros.']],
    ['Resolución de Problemas Matemáticos', [
      'No intento resolver problemas por mi cuenta.',
      'Rara vez intento resolver problemas y siempre necesito ayuda.',
      'A veces intento resolver problemas, aunque necesito apoyo.',
      'Generalmente resuelvo problemas por mi cuenta y pido ayuda solo cuando es necesario.',
      'Siempre intento resolver los problemas por mí mismo y busco ayuda solo si es indispensable.']],
    ['Organización y Gestión del Tiempo', [
      'No organizo mi tiempo y no completo mis tareas.',
      'Organizo mi tiempo rara vez y frecuentemente dejo tareas sin terminar.',
      'Organizo mi tiempo algunas veces y completo la mayoría de las tareas a tiempo.',
      'Generalmente organizo bien mi tiempo y cumplo con las tareas.',
      'Siempre organizo mi tiempo de forma eficiente y completo todas mis tareas a tiempo.']],
    ['Actitud y Motivación', [
      'Muestro una actitud negativa y no tengo motivación.',
      'Rara vez mantengo una actitud positiva, necesito mucha motivación externa.',
      'A veces mantengo una actitud positiva y tengo motivación moderada.',
      'Generalmente tengo una actitud positiva y estoy motivado.',
      'Siempre mantengo una actitud muy positiva y me siento altamente motivado.']]
  ],

  // --- Guías y talleres: [tipo, título, ID del PDF en Drive, modo de práctica opcional]
  // Modos: arit, lin, quad, pit, raz, gen, teq
  unidades: [
    { unidad: 'Tercer Periodo', items: [
      ['Guía', 'Tarea 1 – Acuerdos de Clase Tercer Periodo', 'ID_DRIVE_GUIA_1'],
      ['Taller', 'Taller 1 – Trazado de Gráficas Trigonométricas', 'ID_DRIVE_TALLER_1', 'arit'],
      ['Taller', 'Taller 2 – Aplicaciones de las funciones Trigonométricas - M.A.S.', 'ID_DRIVE_TALLER_2', 'lin'],
      ['Taller', 'Taller 3 – Ecuaciones trigonométricas', 'ID_DRIVE_TALLER_3', 'quad']] },
    { unidad: 'Segundo Periodo', items: [
      ['Guía', 'Guía 1 – Acuerdos de Clase Segundo Periodo', 'ID_DRIVE_GUIA_4'],
      ['Taller', 'Taller 1 – Lados desconocidos', 'ID_DRIVE_TALLER_4', 'pit'],
      ['Taller', 'Taller 2 – Seno, coseno y tangente', 'ID_DRIVE_TALLER_5', 'raz']] },
    { unidad: 'Primer Periodo', items: [
      ['Guía', 'Guía 1 – Acuerdos de Clase Primer Periodo', 'ID_DRIVE_GUIA_6'],
      ['Taller', 'Taller 1 – Resolución de triángulos', 'ID_DRIVE_TALLER_6', 'gen']] },
      ['Taller', 'Taller 2 – Ecuaciones con seno, coseno y tangente', 'ID_DRIVE_TALLER_7', 'teq']] }
  ].map(u => ({ unidad: u.unidad, items: u.items.map(([tipo, titulo, drive, modo]) => ({ tipo, titulo, drive, modo })) })),

  // --- Videos (ID = lo que va después de v= en YouTube)
  videos: [
    { titulo: 'Video 1 – Operaciones, potencias y raíces', yt: 'ID_YOUTUBE_1' },
    { titulo: 'Video 2 – Ecuaciones de primer grado', yt: 'ID_YOUTUBE_2' },
    { titulo: 'Video 3 – Ecuaciones de segundo grado', yt: 'ID_YOUTUBE_3' },
    { titulo: 'Video 4 – Teorema de Pitágoras', yt: 'ID_YOUTUBE_4' },
    { titulo: 'Video 5 – Razones trigonométricas', yt: 'ID_YOUTUBE_5' },
    { titulo: 'Video 6 – Leyes de seno y coseno', yt: 'ID_YOUTUBE_6' },
    { titulo: 'Video 7 – Ecuaciones trigonométricas', yt: 'ID_YOUTUBE_7' }
  ],
  libro: 'ID_DRIVE_LIBRO',

  // --- Tarjetas de estudio: tema → [anverso, reverso]
  tarjetas: {
    'Aritmética y álgebra': [
      ['Potencia', 'aⁿ = a · a · … · a (n veces). Ej.: 2⁵ = 32'],
      ['Raíz cuadrada', '√n es el número que, elevado al cuadrado, da n. Ej.: √49 = 7'],
      ['Jerarquía de operaciones', 'Paréntesis → potencias y raíces → × y ÷ → + y −'],
      ['Ecuación de primer grado', 'Haz la misma operación en ambos lados hasta despejar. ax + b = c ⇒ x = (c − b)/a'],
      ['Ecuación de segundo grado', 'ax² + bx + c = 0, con a ≠ 0'],
      ['Fórmula general', 'x = (−b ± √(b² − 4ac)) / 2a'],
      ['Discriminante', 'Δ = b² − 4ac. Δ > 0: dos soluciones reales. Δ = 0: una. Δ < 0: ninguna real'],
      ['Factorización', 'x² + bx + c = (x + p)(x + q), con p + q = b y p · q = c']
    ],
    'Triángulo rectángulo': [
      ['Hipotenusa y catetos', 'La hipotenusa es el lado opuesto al ángulo recto (el más largo). Los otros dos son los catetos'],
      ['Teorema de Pitágoras', 'a² + b² = c²  (c es la hipotenusa)'],
      ['Terna pitagórica', 'Tres enteros que cumplen a² + b² = c². Ej.: 3-4-5, 5-12-13, 8-15-17'],
      ['Seno', 'sen A = cateto opuesto / hipotenusa'],
      ['Coseno', 'cos A = cateto adyacente / hipotenusa'],
      ['Tangente', 'tan A = cateto opuesto / cateto adyacente = sen A / cos A'],
      ['Razones inversas', 'csc A = 1/sen A · sec A = 1/cos A · cot A = 1/tan A'],
      ['Hallar un ángulo', 'A = sen⁻¹(op/hip) = cos⁻¹(ady/hip) = tan⁻¹(op/ady)'],
      ['Elevación y depresión', 'Se miden desde la horizontal: hacia arriba (elevación) o hacia abajo (depresión)'],
      ['Seno y coseno notables', 'sen 30° = 1/2 · sen 45° = √2/2 · sen 60° = √3/2. cos 30° = √3/2 · cos 45° = √2/2 · cos 60° = 1/2'],
      ['Tangente notable', 'tan 30° = √3/3 · tan 45° = 1 · tan 60° = √3']
    ],
    'Triángulos oblicuos': [
      ['Suma de ángulos', 'A + B + C = 180°'],
      ['Ley de senos', 'a/sen A = b/sen B = c/sen C'],
      ['¿Cuándo usar senos?', 'Cuando conoces un lado y su ángulo opuesto (casos ALA, AAL y LLA)'],
      ['Ley de cosenos', 'a² = b² + c² − 2bc·cos A'],
      ['Ángulo con cosenos', 'cos A = (b² + c² − a²) / (2bc)'],
      ['¿Cuándo usar cosenos?', 'Con dos lados y el ángulo entre ellos (LAL) o con los tres lados (LLL)'],
      ['Caso ambiguo (LLA)', 'Con dos lados y un ángulo no comprendido puede haber 0, 1 o 2 triángulos']
    ],
    'Ecuaciones trigonométricas': [
      ['Identidad fundamental', 'sen²x + cos²x = 1'],
      ['Identidades con tangente', 'tan x = sen x / cos x · 1 + tan²x = sec²x'],
      ['Radianes', '180° = π rad. Grados → radianes: × π/180. Radianes → grados: × 180/π'],
      ['Signos por cuadrante', 'I: todas positivas · II: solo sen · III: solo tan · IV: solo cos'],
      ['Ángulo de referencia (θ)', 'Ángulo agudo con el eje x. Cuadrante II: 180° − θ · III: 180° + θ · IV: 360° − θ'],
      ['Periodo', 'sen y cos: 2π (360°). tan: π (180°)'],
      ['Estrategia', 'Despeja la razón, halla el ángulo de referencia θ y ubica las soluciones según el signo'],
      ['sen x = k  (k > 0)', 'x = θ y x = 180° − θ  (cuadrantes I y II)'],
      ['sen x = −k', 'x = 180° + θ y x = 360° − θ'],
      ['cos x = k  (k > 0)', 'x = θ y x = 360° − θ'],
      ['cos x = −k', 'x = 180° − θ y x = 180° + θ'],
      ['tan x = k  (k > 0)', 'x = θ y x = 180° + θ'],
      ['tan x = −k', 'x = 180° − θ y x = 360° − θ'],
      ['Ángulo múltiple (sen 2x)', 'Resuelve 2x en [0°, 720°) y divide entre 2']
    ]
  }
};
