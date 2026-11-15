/** Textos de la interfaz en español e inglés (del prototipo v2, con datos reales de NASA POWER). */
import type { Estado, Region, Variable } from '@/data/datos'
import { avisoZonaEn } from '@/i18n/avisoZona'

export type Idioma = 'es' | 'en'
export type Perfil = 'agricultor' | 'estudiante'

type PorVariable<T> = Record<Variable, T>

const es = {
  marca: 'Detective del Perú',
  inicio: 'Detective del Perú: inicio',
  lema: 'Tendencias del clima con datos de la NASA',
  cambiarIdioma: 'Cambiar idioma',
  cambiarTema: 'Cambiar tema',
  variableLbl: 'Variable',
  perfilLbl: 'Perfil',
  periodoLbl: 'Periodo',
  variables: { lluvia: 'Lluvia', temperatura: 'Temperatura' } as PorVariable<string>,
  heroH: '¿Qué está cambiando en tu zona del Perú?',
  heroLead: (a: number, b: number) =>
    `Datos de la NASA de ${a} a ${b}. En el mapa, cada departamento sube si llueve más y se hunde si llueve menos.`,
  whoH: '¿Quién eres? Así te lo explicamos',
  perfiles: {
    agricultor: ['Agricultor', 'Lluvia y años secos, en palabras de campo'],
    estudiante: ['Estudiante', 'Con el detalle de cómo se calcula'],
  } satisfies Record<Perfil, [string, string]>,
  exploreBtn: 'Explorar el mapa',
  fuenteReal: (fuente: string) => `Datos de ${fuente}, 25 departamentos`,
  heroCap: (a: number, b: number) =>
    `Arrastra para girar el Perú. Altura: cambio de la lluvia por década, ${a}–${b}.`,
  ocean: 'Océano Pacífico',
  mapaAria:
    'Mapa del Perú en 3D: cada departamento sube o se hunde según cuánto cambió la variable',
  // Explorador
  explorador: 'Explorador',
  mapH: { lluvia: 'Lluvia anual', temperatura: 'Temperatura media' } as PorVariable<string>,
  mapSub: 'Cambio por década',
  mapSubAnio: 'Cada departamento frente a su propio promedio',
  /** El título del mapa dice en qué modo está: tendencia de todo el periodo o un solo año */
  mapModoTendencia: (a: number, b: number) => `tendencia ${a}–${b}`,
  mapModoAnio: (y: number) => `solo ${y}`,
  legSum: 'Cómo leer el mapa',
  legMin: 'Minimizar la leyenda',
  legCols: {
    lluvia: [
      ['Sube', 'llueve más'],
      ['Igual', 'sin cambio'],
      ['Se hunde', 'llueve menos'],
    ],
    temperatura: [
      ['Sube', 'más calor'],
      ['Igual', 'sin cambio'],
      ['Se hunde', 'más frío'],
    ],
  } as PorVariable<[string, string][]>,
  noChange: 'sin cambio',
  texReal: 'Pleno: cambio real',
  texCas: 'Rayado: posible casualidad',
  texFew: 'Contorno: pocos datos',
  calorCosa: { lluvia: 'lluvia anual', temperatura: 'temperatura media' } as PorVariable<string>,
  calorMedia: (cosa: string, a: number, b: number) => `Color: ${cosa} ${a}–${b} en cada celda`,
  calorAnio: (cosa: string, anio: number) => `Color: ${cosa} de ${anio} en cada celda`,
  calorNota: {
    lluvia:
      'Celdas NASA POWER de ~50 km (MERRA-2). Más oscuro = llueve más: la costa es ocre y la selva, violeta. En los Andes el valor sale suavizado.',
    temperatura:
      'Celdas NASA POWER de ~50 km (MERRA-2). En los Andes el valor sale suavizado: la celda promedia valles y cumbres.',
  } as PorVariable<string>,
  scaleTrend: (v: string) => `Columna más alta: ${v} por década`,
  varDef: {
    lluvia: (fuente: string) =>
      `Lluvia: milímetros al año, promedio de las celdas del departamento (${fuente}).`,
    temperatura: (fuente: string) =>
      `Temperatura del aire a 2 m: °C, promedio anual del departamento (${fuente}).`,
  } as PorVariable<(fuente: string) => string>,
  spinOn: 'Pausar giro',
  spinOff: 'Girar el mapa',
  recenter: 'Volver a la vista inicial',
  showReport: 'Mostrar el informe',
  hideReport: 'Ocultar el informe',
  railHint: 'Toca una zona',
  // Ficha
  kind: (r: Region) => `Departamento de la ${r}`,
  unitAxis: { lluvia: 'mm/año', temperatura: '°C' } as PorVariable<string>,
  /** local: copia de NASA POWER, con celdas de ~50 km; con la API, el tamaño depende de su fuente */
  src: (variable: Variable, celdas: number, fuente: string, local: boolean) =>
    celdas === 0
      ? `${fuente}: ninguna celda${local ? ' de ~50 km' : ''} cae dentro del departamento`
      : `${fuente}, ${variable === 'lluvia' ? 'lluvia' : 'temperatura'} anual promedio de ${celdas} ${celdas === 1 ? 'celda' : 'celdas'}${local ? ' de ~50 km' : ''}`,
  /** Aviso de la API cuando el promedio sale de muy pocas celdas (null = se muestra el de la API, en español) */
  notaFija: null as string | null,
  /** Aviso de la API (`stats.aviso`) en este idioma; null = se muestra el de la API, en español */
  avisoFijo: null as ((variable: Variable, lag1: number | null, motivo: string) => string) | null,
  status: {
    real: 'Cambio real',
    posible_casualidad: 'Posible casualidad',
    pocos_datos: 'Pocos datos',
  } as Record<Estado, string>,
  perDecade: 'por década',
  /** Ficha del 3D al pasar el puntero */
  vsPromedio: 'frente a su promedio',
  ic95: 'IC 95 %',
  anios: 'años',
  /** Presentación breve al elegir un departamento */
  introDepto: {
    costa: 'Departamento de la costa del Perú',
    sierra: 'Departamento de la sierra del Perú',
    selva: 'Departamento de la selva del Perú',
  } as Record<Region, string>,
  pctDecade: (p: string) => `${p} por década frente a su promedio`,
  range: (a: string, b: string) => `Rango probable: entre ${a} y ${b}`,
  fewCeldas: (n: number, fuente: string, local: boolean) =>
    n === 0
      ? `Ninguna celda de ${fuente}${local ? ' (de unos 50 km)' : ''} cae dentro de este departamento, así que no tiene serie propia. No sacamos conclusiones.`
      : `Solo ${n} ${n === 1 ? 'celda' : 'celdas'} de ${fuente}${local ? ' (de unos 50 km)' : ''} ${n === 1 ? 'cae' : 'caen'} en este departamento. Necesitamos al menos 4 para medir una tendencia confiable, así que no sacamos conclusiones.`,
  chartCap: (lluvia: boolean, sinNino: boolean, anios: string) =>
    'Puntos: valor de cada año. Línea gruesa: tendencia (pendiente de Sen). Zona sombreada: rango probable.' +
    (lluvia
      ? sinNino
        ? ` Sin los años de El Niño (${anios}).`
        : ` Franjas: años de El Niño (${anios}).`
      : ''),
  ninoToggle: 'Quitar los años de El Niño',
  ninoOn: 'Viendo la tendencia sin los años de El Niño.',
  clueH: 'Pista: sube aquí, baja allá',
  clue: (nombre: string, verbo: string, valor: string, estado: string) =>
    `Mientras tanto, en ${nombre} ${verbo} ${valor} por década (${estado}).`,
  clueBtn: (nombre: string) => `Ir a ${nombre}`,
  dosH: '¿Coinciden dos fuentes de NASA?',
  dosFuente: {
    power: { nombre: 'NASA POWER', tipo: 'modelo, la del mapa' },
    imerg: { nombre: 'GPM IMERG', tipo: 'satélites' },
  },
  dosSi: (sube: boolean) => `Coinciden: las dos dicen que ${sube ? 'llueve más' : 'llueve menos'}.`,
  dosNo: (sube: boolean) =>
    `No coinciden: el modelo dice que ${sube ? 'llueve más' : 'llueve menos'} y los satélites, que ${sube ? 'llueve menos' : 'llueve más'}.`,
  dosSiDebil: (sube: boolean) =>
    `Las dos apuntan a que ${sube ? 'llueve más' : 'llueve menos'}, pero ninguna de las dos es segura.`,
  dosDudoso:
    'Apuntan a lados distintos, pero sus rangos probables se tocan: no se puede decir que se contradigan.',
  dosPocos: 'Una de las dos fuentes tiene muy pocos datos aquí: no las comparamos.',
  dosPorQue:
    'Los satélites de IMERG cambiaron en 2014 (de TRMM a GPM) y eso puede hacer que la lluvia parezca bajar. Por eso el mapa usa POWER y nunca marca a IMERG como cambio real.',
  verb: {
    lluvia: ['la lluvia sube', 'la lluvia baja'],
    temperatura: ['la temperatura sube', 'la temperatura baja'],
  } as PorVariable<[string, string]>,
  howH: 'Cómo lo sabemos',
  howMethod: 'Método',
  howMethodV: 'Mann-Kendall con prewhitening (TFPW) sobre promedios anuales',
  howSlope: 'Pendiente',
  howSlopeV: (v: string) => `Sen, ${v} por década`,
  howN: 'Años con datos',
  howCeldas: 'Celdas',
  howLag: 'Autocorrelación (lag1)',
  howMotivo: 'Por qué no es «cambio real»',
  howSrc: 'Fuente',
  howDatos: 'Datos servidos por',
  datosApi: 'la API del proyecto',
  datosLocal: 'la copia local del proyecto (la API no respondió o aún no trae tendencias)',
  lagExpl:
    'Mide cuánto se parece un año al siguiente. Si es alta, la prueba lo corrige para no exagerar la tendencia.',
  qExpl: (m: number) =>
    `q es el valor p corregido por revisar ${m} zonas a la vez. «Cambio real» pide q menor que 0,05, un rango probable que no cruce el cero y autocorrelación de 0,5 o menos.`,
  disclaimer: 'Muestra lo que ya cambió. No es un pronóstico ni una recomendación.',
  tapH: 'Toca un departamento',
  tapP: {
    lluvia: 'Verás cuánto cambió su lluvia y si el cambio es real o casualidad.',
    temperatura: 'Verás cuánto cambió su temperatura y si el cambio es real o casualidad.',
  } as PorVariable<string>,
  // Máquina del tiempo
  timeModeAria: 'Qué ver en el mapa',
  timeTrend: 'Tendencia',
  timeTrendTitle: (a: number, b: number) => `Tendencia ${a}–${b}: cuánto cambió en esos años`,
  timeByYear: 'Año a año',
  timeByYearTitle: 'Año a año: cómo fue cada año frente a su promedio',
  timeHelp: (n: number) =>
    `Tendencia: cuánto cambió en ${n} años. Año a año: cómo fue ese año frente a su promedio.`,
  timeHelpClose: 'Cerrar la ayuda',
  timePlay: (a: number, b: number) => `Reproducir ${a}–${b}`,
  timePause: 'Pausar',
  timeYear: 'Año',
  timeAria: 'Máquina del tiempo',
  legColsT: [
    ['Sube', 'más que su promedio'],
    ['Igual', 'como su promedio'],
    ['Se hunde', 'menos que su promedio'],
  ] as [string, string][],
  scaleTime: (v: string) => `Columna más alta: ${v} frente a su promedio`,
  legTimeNote: (y: number) => `Año ${y}: cada departamento frente a su propio promedio`,
  tipTime: (nombre: string, v: string, y: number) => `${nombre} en ${y}: ${v} frente a su promedio`,
  // Caso 2: antes y después (NDVI real de MODIS)
  cmpH: 'La costa que reverdece',
  cmpTexto: (valle: string, a: number, b: number, pct: number) =>
    `En ${valle}, el área con vegetación pasó de ${a} km² en 2001 a ${b} km² en 2024 (+${pct} %). Es tierra irrigada ganada al desierto.`,
  cmpLbl: 'Comparar la vegetación de 2001 y 2024',
  cmpAlt: (valle: string, anio: number) =>
    `Vegetación (NDVI) de ${valle} en ${anio}, imagen satelital MODIS`,
  cmpDesierto: 'Desierto',
  cmpVerde: 'Vegetación densa',
  cmpCap: 'NDVI anual de MODIS MOD13A3 (NASA), píxeles de 1 km. Desliza para comparar 2001 y 2024.',
  cmpUnidad:
    'Cifras de un recuadro de 0,25° × 0,25° (~27 × 27 km) sobre el valle; no son el promedio del departamento.',
  /** Etiqueta del aviso de una zona (p. ej. Olmos o La Pampa) */
  cuidado: 'Léelo con cuidado',
  // Árboles de la selva (MODIS MOD44B), donde el NDVI se satura
  selvaH: 'Árboles de la selva',
  selvaTexto: (zona: string, a: number, b: number, ka: number, kb: number) =>
    `En ${zona}, los árboles cubrían el ${a} % del suelo en 2001 y el ${b} % en 2024: el bosque pasó de ${ka} km² a ${kb} km².`,
  selvaSinCambio: (zona: string, b: number) =>
    `En ${zona}, los árboles cubren cerca del ${b} % del suelo y de 2001 a 2024 no hay un cambio distinguible de 0. Es el contraste con la selva que se pierde.`,
  selvaTendencia: (v: string) => `Tendencia: ${v} puntos de árboles por década`,
  selvaNoDistinguible: 'No distinguible de 0',
  selvaCap:
    'Cobertura de árboles de MODIS MOD44B (NASA), píxeles de 250 m. Bosque: píxeles con 30 % o más de árboles.',
  selvaUnidad:
    'Cifras de un recuadro de unos 25 km de lado en la selva; no son el promedio del departamento.',
  // Mapa 2D
  vistaMapa: 'Vista del mapa',
  mapaControles: 'Controles del mapa',
  compartir: 'Compartir esta vista',
  enlaceCopiado: 'Enlace copiado',
  compartirManual: 'Copia el enlace para compartir esta vista:',
  mapa2dAria: 'Mapa del Perú en 2D',
  noGl: 'Tu navegador no muestra 3D. Te mostramos el mapa en 2D con los mismos datos.',
  tipVal: (nombre: string, v: string, u: string, estado: string) =>
    `${nombre}, ${v} ${u}, ${estado.toLowerCase()}`,
  // Esperas y errores
  cargando: 'Cargando…',
  errorH: 'Algo salió mal',
  errorP: 'No pudimos mostrar esta pantalla. Puedes volver a intentarlo o ir al inicio.',
  reintentar: 'Reintentar',
  alInicio: 'Ir al inicio',
  noEncontradaH: 'Esta página no existe',
  noEncontradaP: 'El enlace está incompleto o ya no existe.',
  serieErrorH: 'No pudimos cargar la serie de años',
  serieErrorP: 'La API no respondió. Los datos de tendencia de arriba siguen siendo válidos.',
  // Metodología
  metodologia: 'Metodología y fuentes',
  metodologiaCorto: 'Metodología',
  metodologiaTodo: 'Ver la metodología completa',
  paginaActual: '(página actual)',
  metodologiaEnlace: 'Cómo lo calculamos y de dónde salen los datos',
  irAlMapa: 'Explorar el mapa',
}

type Textos = typeof es

const en: Textos = {
  marca: 'Peru Trend Detective',
  inicio: 'Peru Trend Detective: home',
  lema: 'Climate trends from NASA data',
  cambiarIdioma: 'Change language',
  cambiarTema: 'Change theme',
  variableLbl: 'Variable',
  perfilLbl: 'Profile',
  periodoLbl: 'Period',
  variables: { lluvia: 'Rainfall', temperatura: 'Temperature' },
  heroH: 'What is changing in your part of Peru?',
  heroLead: (a, b) =>
    `NASA data from ${a} to ${b}. On the map, each department rises where it rains more and sinks where it rains less.`,
  whoH: "Who are you? We'll explain it your way",
  perfiles: {
    agricultor: ['Farmer', 'Rain and dry years, in plain words'],
    estudiante: ['Student', 'With the details of how it is calculated'],
  },
  exploreBtn: 'Explore the map',
  fuenteReal: (fuente) => `${fuente} data, 25 departments`,
  heroCap: (a, b) => `Drag to turn Peru. Height: rainfall change per decade, ${a}–${b}.`,
  ocean: 'Pacific Ocean',
  mapaAria: 'Map of Peru in 3D: each department rises or sinks by how much the variable changed',
  explorador: 'Explorer',
  mapH: { lluvia: 'Annual rainfall', temperatura: 'Mean temperature' },
  mapSub: 'Change per decade',
  mapSubAnio: 'Each department vs its own average',
  mapModoTendencia: (a, b) => `trend ${a}–${b}`,
  mapModoAnio: (y) => `${y} only`,
  legSum: 'How to read the map',
  legMin: 'Minimize the legend',
  legCols: {
    lluvia: [
      ['Rises', 'more rain'],
      ['Flat', 'no change'],
      ['Sinks', 'less rain'],
    ],
    temperatura: [
      ['Rises', 'warmer'],
      ['Flat', 'no change'],
      ['Sinks', 'cooler'],
    ],
  },
  noChange: 'no change',
  texReal: 'Solid: real change',
  texCas: 'Striped: possibly chance',
  texFew: 'Outline: not enough data',
  calorCosa: { lluvia: 'annual rainfall', temperatura: 'mean temperature' },
  calorMedia: (cosa, a, b) => `Colour: ${cosa} ${a}–${b} in each cell`,
  calorAnio: (cosa, anio) => `Colour: ${cosa} of ${anio} in each cell`,
  calorNota: {
    lluvia:
      'NASA POWER cells of ~50 km (MERRA-2). Darker = more rain: the coast is ochre and the jungle, violet. In the Andes values are smoothed.',
    temperatura:
      'NASA POWER cells of ~50 km (MERRA-2). In the Andes values are smoothed: a cell averages valleys and peaks.',
  },
  scaleTrend: (v) => `Tallest column: ${v} per decade`,
  varDef: {
    lluvia: (fuente) =>
      `Rainfall: millimetres per year, average of the department cells (${fuente}).`,
    temperatura: (fuente) => `Air temperature at 2 m: °C, department annual average (${fuente}).`,
  },
  spinOn: 'Pause rotation',
  spinOff: 'Rotate the map',
  recenter: 'Back to the starting view',
  showReport: 'Show the report',
  hideReport: 'Hide the report',
  railHint: 'Tap an area',
  kind: (r) =>
    `${({ costa: 'Coastal', sierra: 'Highland', selva: 'Rainforest' } as Record<Region, string>)[r]} department`,
  unitAxis: { lluvia: 'mm/yr', temperatura: '°C' },
  src: (variable, celdas, fuente, local) =>
    celdas === 0
      ? `${fuente}: no ${local ? '~50 km ' : ''}cell falls inside the department`
      : `${fuente}, annual ${variable === 'lluvia' ? 'rainfall' : 'temperature'} averaged over ${celdas} ${local ? '~50 km ' : ''}${celdas === 1 ? 'cell' : 'cells'}`,
  notaFija: 'Average of very few or shared grid cells: low-confidence data',
  // Mismas reglas que el pipeline: lag1 > 0.5 (el aviso de 2014 de IMERG ya no va en la lluvia principal, POWER)
  avisoFijo: (_variable, lag1, motivo) =>
    [
      avisoZonaEn(motivo),
      lag1 != null &&
        lag1 > 0.5 &&
        'Years very similar to each other (high lag1): the trend may look more certain than it is.',
    ]
      .filter(Boolean)
      .join(' '),
  status: {
    real: 'Real change',
    posible_casualidad: 'Possibly chance',
    pocos_datos: 'Not enough data',
  },
  perDecade: 'per decade',
  vsPromedio: 'vs. its average',
  ic95: '95% CI',
  anios: 'years',
  introDepto: {
    costa: "A department on Peru's coast",
    sierra: "A department in Peru's Andes",
    selva: "A department in Peru's Amazon",
  },
  pctDecade: (p) => `${p} per decade vs its average`,
  range: (a, b) => `Likely range: ${a} to ${b}`,
  fewCeldas: (n, fuente, local) =>
    n === 0
      ? `No ${fuente} cell${local ? ' (about 50 km wide)' : ''} falls inside this department, so it has no series of its own. We draw no conclusion.`
      : `Only ${n} ${fuente} ${n === 1 ? 'cell' : 'cells'}${local ? ' (about 50 km wide)' : ''} ${n === 1 ? 'falls' : 'fall'} in this department. We need at least 4 to measure a reliable trend, so we draw no conclusion.`,
  chartCap: (lluvia, sinNino, anios) =>
    "Dots: each year's value. Thick line: trend (Sen's slope). Shaded area: likely range." +
    (lluvia
      ? sinNino
        ? ` El Niño years (${anios}) removed.`
        : ` Bands: El Niño years (${anios}).`
      : ''),
  ninoToggle: 'Remove El Niño years',
  ninoOn: 'Showing the trend without El Niño years.',
  clueH: 'Clue: up here, down there',
  clue: (nombre, verbo, valor, estado) =>
    `Meanwhile, in ${nombre} ${verbo} by ${valor} per decade (${estado}).`,
  clueBtn: (nombre) => `Go to ${nombre}`,
  dosH: 'Do two NASA sources agree?',
  dosFuente: {
    power: { nombre: 'NASA POWER', tipo: 'model, the one on the map' },
    imerg: { nombre: 'GPM IMERG', tipo: 'satellites' },
  },
  dosSi: (sube) => `They agree: both say it ${sube ? 'rains more' : 'rains less'}.`,
  dosNo: (sube) =>
    `They disagree: the model says it ${sube ? 'rains more' : 'rains less'} and the satellites say it ${sube ? 'rains less' : 'rains more'}.`,
  dosSiDebil: (sube) => `Both point to ${sube ? 'more' : 'less'} rain, but neither is certain.`,
  dosDudoso:
    'They point in different directions, but their likely ranges overlap: we cannot say they contradict each other.',
  dosPocos: 'One of the two sources has very little data here: we do not compare them.',
  dosPorQue:
    'IMERG satellites changed in 2014 (from TRMM to GPM), which can make rainfall look like it drops. That is why the map uses POWER and never marks IMERG as a real change.',
  verb: {
    lluvia: ['rainfall rises', 'rainfall falls'],
    temperatura: ['temperature rises', 'temperature falls'],
  },
  howH: 'How we know',
  howMethod: 'Method',
  howMethodV: 'Mann-Kendall with pre-whitening (TFPW) on annual means',
  howSlope: 'Slope',
  howSlopeV: (v) => `Sen, ${v} per decade`,
  howN: 'Years with data',
  howCeldas: 'Grid cells',
  howLag: 'Autocorrelation (lag1)',
  howMotivo: 'Why it is not a real change',
  howSrc: 'Source',
  howDatos: 'Data served by',
  datosApi: 'the project API',
  datosLocal: "the project's local copy (the API did not answer or has no trends yet)",
  lagExpl:
    'How much one year resembles the next. When it is high, the test corrects for it so the trend is not overstated.',
  qExpl: (m) =>
    `q is the p-value corrected for checking ${m} areas at once. A real change needs q below 0.05, a likely range that does not cross zero and autocorrelation of 0.5 or less.`,
  disclaimer: 'Shows what has already changed. It is not a forecast or a recommendation.',
  tapH: 'Tap a department',
  tapP: {
    lluvia: "You'll see how much its rainfall changed and whether the change is real or chance.",
    temperatura:
      "You'll see how much its temperature changed and whether the change is real or chance.",
  },
  timeModeAria: 'What to show on the map',
  timeTrend: 'Trend',
  timeTrendTitle: (a, b) => `Trend ${a}–${b}: how much changed over those years`,
  timeByYear: 'By year',
  timeByYearTitle: 'By year: how each year compared with its average',
  timeHelp: (n) =>
    `Trend: how much changed over ${n} years. By year: how that year compared with its average.`,
  timeHelpClose: 'Close the help',
  timePlay: (a, b) => `Play ${a}–${b}`,
  timePause: 'Pause',
  timeYear: 'Year',
  timeAria: 'Time machine',
  legColsT: [
    ['Rises', 'above its average'],
    ['Flat', 'at its average'],
    ['Sinks', 'below its average'],
  ],
  scaleTime: (v) => `Tallest column: ${v} vs its average`,
  legTimeNote: (y) => `Year ${y}: each department vs its own average`,
  tipTime: (nombre, v, y) => `${nombre} in ${y}: ${v} vs its average`,
  cmpH: 'The coast turning green',
  cmpTexto: (valle, a, b, pct) =>
    `In ${valle}, the vegetated area grew from ${a} km² in 2001 to ${b} km² in 2024 (+${pct} %). It is irrigated land won from the desert.`,
  cmpLbl: 'Compare vegetation in 2001 and 2024',
  cmpAlt: (valle, anio) => `Vegetation (NDVI) of ${valle} in ${anio}, MODIS satellite image`,
  cmpDesierto: 'Desert',
  cmpVerde: 'Dense vegetation',
  cmpCap: 'Annual NDVI from MODIS MOD13A3 (NASA), 1 km pixels. Drag to compare 2001 and 2024.',
  cmpUnidad:
    'Figures for a 0.25° × 0.25° box (~27 × 27 km) over the valley; not the department average.',
  cuidado: 'Read with care',
  selvaH: 'Rainforest trees',
  selvaTexto: (zona, a, b, ka, kb) =>
    `In ${zona}, trees covered ${a} % of the ground in 2001 and ${b} % in 2024: forest went from ${ka} km² to ${kb} km².`,
  selvaSinCambio: (zona, b) =>
    `In ${zona}, trees cover about ${b} % of the ground and from 2001 to 2024 there is no change distinguishable from 0. It is the contrast with the rainforest being lost.`,
  selvaTendencia: (v) => `Trend: ${v} points of tree cover per decade`,
  selvaNoDistinguible: 'Not distinguishable from 0',
  selvaCap:
    'Tree cover from MODIS MOD44B (NASA), 250 m pixels. Forest: pixels with 30 % or more trees.',
  selvaUnidad: 'Figures for a box about 25 km wide in the rainforest; not the department average.',
  vistaMapa: 'Map view',
  mapaControles: 'Map controls',
  compartir: 'Share this view',
  enlaceCopiado: 'Link copied',
  compartirManual: 'Copy the link to share this view:',
  mapa2dAria: 'Map of Peru in 2D',
  noGl: "Your browser can't show 3D. Here is the 2D map with the same data.",
  tipVal: (nombre, v, u, estado) => `${nombre}, ${v} ${u}, ${estado.toLowerCase()}`,
  // Waiting and errors
  cargando: 'Loading…',
  errorH: 'Something went wrong',
  errorP: "We couldn't show this screen. You can try again or go home.",
  reintentar: 'Try again',
  alInicio: 'Go home',
  noEncontradaH: "This page doesn't exist",
  noEncontradaP: 'The link is incomplete or no longer exists.',
  serieErrorH: "We couldn't load the yearly series",
  serieErrorP: "The API didn't answer. The trend figures above are still valid.",
  // Methodology
  metodologia: 'Methodology and sources',
  metodologiaCorto: 'Methodology',
  metodologiaTodo: 'Read the full methodology',
  paginaActual: '(current page)',
  metodologiaEnlace: 'How we calculate it and where the data comes from',
  irAlMapa: 'Explore the map',
}

export const TEXTOS: Record<Idioma, Textos> = { es, en }

/** Orden de los perfiles en la portada: el público son agricultores y estudiantes (decisión del equipo, 14 nov). */
export const ORDEN_PERFILES: Perfil[] = ['agricultor', 'estudiante']

/** Frase simple de la ficha según el perfil (solo cambian los textos, no los datos). */
export const FRASES = {
  es: {
    farmMore: { lluvia: 'más lluvia', temperatura: 'más calor' } as PorVariable<string>,
    farmLess: { lluvia: 'menos lluvia', temperatura: 'menos calor' } as PorVariable<string>,
    agricultorUp: (z: string, x: string, desde: number) =>
      `Los años en ${z} vienen con ${x} que en ${desde}, y es una tendencia sostenida.`,
    agricultorCas: (z: string) =>
      `En ${z} hay años buenos y años malos, pero no se ve una tendencia clara.`,
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall con prewhitening da p = ${p}; corregido entre ${m} zonas, q = ${q} (menor que 0,05). Pendiente de Sen: ${val} por década.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} y q = ${q} tras corregir entre ${m} zonas. No cumple todas las condiciones de «cambio real».`,
    few: (z: string) => `En ${z} hay muy pocas celdas con datos. No sacamos conclusiones.`,
  },
  en: {
    farmMore: { lluvia: 'more rain', temperatura: 'more heat' } as PorVariable<string>,
    farmLess: { lluvia: 'less rain', temperatura: 'less heat' } as PorVariable<string>,
    agricultorUp: (z: string, x: string, desde: number) =>
      `Years in ${z} bring ${x} than in ${desde}, and it is a steady trend.`,
    agricultorCas: (z: string) => `${z} has good years and bad years, but no clear trend.`,
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall with pre-whitening gives p = ${p}; corrected across ${m} areas, q = ${q} (below 0.05). Sen's slope: ${val} per decade.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} and q = ${q} after correcting across ${m} areas. It does not meet all the conditions of a real change.`,
    few: (z: string) => `${z} has very few cells with data. We draw no conclusion.`,
  },
}

/** Nombre y dato de cada personaje de la fauna del mapa 3D (src/features/mapa/escena/fauna.ts), por especie. */
export const FAUNA_TEXTOS: Record<Idioma, Record<string, [string, string]>> = {
  es: {
    alpaca: [
      'Alpaca · Puno',
      'Puno cría la mayor cantidad de alpacas del Perú. Las borlas de lana en las orejas son una tradición andina para marcar a cada animal.',
    ],
    vicuna: [
      'Vicuña · Ayacucho',
      'Animal nacional: está en el escudo del Perú. La Reserva Pampa Galeras ayudó a salvarla de la extinción.',
    ],
    condor: [
      'Cóndor andino · Arequipa',
      'Planea sobre el Cañón del Colca aprovechando el aire caliente; sus alas pasan los 3 metros.',
    ],
    pastora: [
      'Pastora andina · Cusco',
      'Pollera y montera: ropa tradicional de las comunidades quechuas del Cusco.',
    ],
    caballito: [
      'Caballito de totora · La Libertad',
      'Los pescadores de Huanchaco usan estas balsas de junco desde tiempos preincas.',
    ],
    agricultor: [
      'Agricultor · Ica',
      'El riego convierte el desierto de Ica en viñedos para el pisco y campos de espárragos.',
    ],
    pinguino: [
      'Pingüino de Humboldt · Ica',
      'Vive en las islas Ballestas, en el agua fría de la corriente de Humboldt. Es una especie vulnerable.',
    ],
    lobo: ['Lobo marino · Callao', 'Forma colonias en las islas Palomino, frente al Callao.'],
    pelicano: [
      'Pelícano peruano · costa norte',
      'Pesca anchoveta en el mar frío de la corriente de Humboldt.',
    ],
    delfin: [
      'Delfín rosado · Loreto',
      'Vive en los ríos amazónicos, como los de la Reserva Pacaya Samiria.',
    ],
    guacamayo: [
      'Guacamayo escarlata · Madre de Dios',
      'Cientos se reúnen en las collpas, paredes de arcilla junto a los ríos de Tambopata.',
    ],
    jaguar: ['Jaguar · Ucayali', 'El felino más grande de América vive en la selva amazónica.'],
    gallito: [
      'Gallito de las rocas · San Martín',
      'Ave nacional del Perú; vive en los bosques nublados.',
    ],
    mono: [
      'Mono choro de cola amarilla · Amazonas',
      'Solo existe en el Perú y está en peligro crítico de extinción.',
    ],
    oso: [
      'Oso de anteojos · Cajamarca',
      'El único oso de Sudamérica; las manchas claras de su cara son distintas en cada uno.',
    ],
    cocodrilo: [
      'Cocodrilo americano · Tumbes',
      'El único cocodrilo del Perú vive en los manglares y ríos de Tumbes.',
    ],
    caballo: [
      'Caballo peruano de paso · Lima',
      'Su andar suave, el «paso llano», es patrimonio cultural de la nación.',
    ],
    shipibo: [
      'Mujer shipibo-konibo · Ucayali',
      'Pueblo amazónico del río Ucayali. Sus diseños kené, pintados y bordados, son Patrimonio Cultural de la Nación desde 2008.',
    ],
    danzante: [
      'Danzante de tijeras · Huancavelica',
      'El danzaq baila al ritmo de unas tijeras de metal. La UNESCO la declaró Patrimonio Cultural Inmaterial de la Humanidad en 2010.',
    ],
  },
  en: {
    alpaca: [
      'Alpaca · Puno',
      'Puno raises more alpacas than any other region of Peru. The wool tassels on their ears are an Andean tradition to mark each animal.',
    ],
    vicuna: [
      'Vicuña · Ayacucho',
      "National animal, shown on Peru's coat of arms. The Pampa Galeras reserve helped save it from extinction.",
    ],
    condor: [
      'Andean condor · Arequipa',
      'It soars over the Colca Canyon on warm air currents; its wingspan exceeds 3 metres.',
    ],
    pastora: [
      'Andean shepherdess · Cusco',
      "Pollera skirt and montera hat: traditional clothing of Cusco's Quechua communities.",
    ],
    caballito: [
      'Reed boat · La Libertad',
      "Huanchaco's fishermen have used these reed boats since pre-Inca times.",
    ],
    agricultor: [
      'Farmer · Ica',
      "Irrigation turns Ica's desert into vineyards for pisco and asparagus fields.",
    ],
    pinguino: [
      'Humboldt penguin · Ica',
      'It lives on the Ballestas Islands, in the cold Humboldt Current. It is a vulnerable species.',
    ],
    lobo: ['Sea lion · Callao', 'It forms colonies on the Palomino Islands, off Callao.'],
    pelicano: [
      'Peruvian pelican · north coast',
      'It fishes for anchovy in the cold Humboldt Current.',
    ],
    delfin: [
      'Pink river dolphin · Loreto',
      'It lives in Amazonian rivers, such as those of the Pacaya Samiria reserve.',
    ],
    guacamayo: [
      'Scarlet macaw · Madre de Dios',
      "Hundreds gather at the clay licks along Tambopata's rivers.",
    ],
    jaguar: ['Jaguar · Ucayali', 'The largest cat in the Americas lives in the Amazon rainforest.'],
    gallito: [
      'Andean cock-of-the-rock · San Martín',
      "Peru's national bird; it lives in cloud forests.",
    ],
    mono: [
      'Yellow-tailed woolly monkey · Amazonas',
      'Found only in Peru and critically endangered.',
    ],
    oso: [
      'Spectacled bear · Cajamarca',
      "South America's only bear; its pale face markings differ in every individual.",
    ],
    cocodrilo: [
      'American crocodile · Tumbes',
      "Peru's only crocodile lives in Tumbes' mangroves and rivers.",
    ],
    caballo: [
      'Peruvian Paso horse · Lima',
      "Its smooth gait, the 'paso llano', is part of Peru's national heritage.",
    ],
    shipibo: [
      'Shipibo-Konibo woman · Ucayali',
      'An Amazonian people of the Ucayali River. Their kené designs, painted and embroidered, have been National Cultural Heritage of Peru since 2008.',
    ],
    danzante: [
      'Scissors dancer · Huancavelica',
      'The danzaq dances to the beat of metal scissors. UNESCO listed it as Intangible Cultural Heritage of Humanity in 2010.',
    ],
  },
}

// ---- Páginas: etiquetas para buscadores y redes (META) y la página de metodología ----

type Pagina = 'inicio' | 'explorar' | 'metodologia'

export const META: Record<Idioma, Record<Pagina, { titulo: string; descripcion: string }>> = {
  es: {
    inicio: {
      titulo: 'Detective del Perú · ¿Qué está cambiando en tu zona?',
      descripcion:
        'Mapa 3D del Perú con datos de la NASA: cuánto cambiaron la lluvia y la temperatura de cada departamento desde {desde}, y si el cambio es real o casualidad.',
    },
    explorar: {
      titulo: 'Explorador del clima del Perú · Detective del Perú',
      descripcion:
        'Elige un departamento y mira cuánto cambió su lluvia o su temperatura, año por año, con datos de la NASA.',
    },
    metodologia: {
      titulo: 'Metodología, fuentes y créditos · Detective del Perú',
      descripcion:
        'Cómo calculamos las tendencias (Mann-Kendall y pendiente de Sen) y de dónde salen los datos: NASA GPM IMERG, MERRA-2 vía POWER y MODIS.',
    },
  },
  en: {
    inicio: {
      titulo: 'Peru Trend Detective · What is changing in your area?',
      descripcion:
        '3D map of Peru with NASA data: how much rainfall and temperature changed in each department since {desde}, and whether the change is real or chance.',
    },
    explorar: {
      titulo: 'Peru climate explorer · Peru Trend Detective',
      descripcion:
        'Pick a department and see how much its rainfall or temperature changed, year by year, with NASA data.',
    },
    metodologia: {
      titulo: 'Methodology, sources and credits · Peru Trend Detective',
      descripcion:
        'How we calculate the trends (Mann-Kendall and Sen slope) and where the data comes from: NASA GPM IMERG, MERRA-2 via POWER and MODIS.',
    },
  },
}

type Enlace = [texto: string, url: string]

/** Secciones de /metodologia: el id del título es `m-<sección>` (el menú de la cabecera salta a ellas). */
export const SECCIONES_METODOLOGIA = [
  'fuentes',
  'calculo',
  'semaforo',
  'limites',
  'creditos',
] as const
export type SeccionMetodologia = (typeof SECCIONES_METODOLOGIA)[number]

interface Metodologia {
  titulo: string
  intro: string
  fuentesH: string
  tablaCols: [string, string, string, string]
  fuentes: {
    variable: string
    fuente: string
    resolucion: string
    anios?: string
    rango?: 'lluvia' | 'temperatura' | 'local'
    enlace: Enlace
  }[]
  fuentesNota: string
  calculoH: string
  pasos: [titulo: string, texto: string][]
  semaforoH: string
  estados: [nombre: string, texto: string][]
  limitesH: string
  limites: [titulo: string, texto: string][]
  creditosH: string
  creditosP: string
  creditosDatos: Enlace[]
  creditosCodigo: string
  repos: Enlace[]
  creditosNasa: string
  /** Una línea por sección para el menú de la cabecera */
  menuD: Record<SeccionMetodologia, string>
}

const REPOS: Enlace[] = [
  ['nasa-challenge-frontend', 'https://github.com/unac-team-challenges/nasa-challenge-frontend'],
  ['nasa-challenge-backend', 'https://github.com/unac-team-challenges/nasa-challenge-backend'],
]

export const METODOLOGIA: Record<Idioma, Metodologia> = {
  es: {
    titulo: 'Metodología, fuentes y créditos',
    intro:
      'Detective del Perú muestra cuánto cambiaron la lluvia y la temperatura de cada departamento y si ese cambio es real o pudo ser casualidad. Aquí explicamos cómo se calcula, de dónde salen los datos y qué límites tienen. Muestra lo que ya cambió: no es un pronóstico ni una recomendación.',
    fuentesH: 'De dónde salen los datos',
    tablaCols: ['Variable', 'Fuente', 'Resolución', 'Años'],
    fuentes: [
      {
        variable: 'Lluvia',
        fuente: 'MERRA-2 (NASA) vía POWER: lluvia corregida (PRECTOTCORR)',
        resolucion: '≈ 50 × 60 km',
        rango: 'lluvia',
        enlace: ['NASA POWER', 'https://power.larc.nasa.gov/'],
      },
      {
        variable: 'Lluvia por satélite (segunda fuente)',
        fuente:
          'GPM IMERG v07 (NASA), promedio mensual. Solo para comparar con POWER en la ficha («¿Coinciden dos fuentes de NASA?»)',
        resolucion: '≈ 10 km',
        rango: 'lluvia',
        enlace: ['GPM IMERG', 'https://gpm.nasa.gov/data/imerg'],
      },
      {
        variable: 'Temperatura',
        fuente: 'MERRA-2 (NASA) vía POWER: temperatura del aire a 2 m (T2M)',
        resolucion: '≈ 50 × 60 km',
        rango: 'temperatura',
        enlace: ['NASA POWER', 'https://power.larc.nasa.gov/'],
      },
      {
        variable: 'Copia local (plan B)',
        fuente:
          'Los mismos números que la API (NASA POWER y, para comparar, IMERG). La web la usa si la API no responde, y siempre para «sin El Niño» y la máquina del tiempo',
        resolucion: '≈ 50 × 60 km',
        rango: 'local',
        enlace: ['NASA POWER', 'https://power.larc.nasa.gov/'],
      },
      {
        variable: 'Vegetación (Caso 2)',
        fuente: 'MODIS MOD13A3 (NASA): índice de vegetación NDVI, pedido con AppEEARS',
        resolucion: '1 km',
        anios: '2001 y 2024',
        enlace: ['AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/'],
      },
      {
        variable: 'Árboles de la selva',
        fuente: 'MODIS MOD44B (NASA): % del suelo cubierto por árboles, pedido con AppEEARS',
        resolucion: '250 m',
        anios: '2001–2024',
        enlace: ['AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/'],
      },
    ],
    fuentesNota:
      'Cada número viene de una sola fuente y la ficha dice cuál: no mezclamos ni promediamos fuentes. No son estaciones de medición: cada valor es el promedio de una celda de satélite o de modelo.',
    calculoH: 'Cómo se calcula la tendencia',
    pasos: [
      [
        'Promedio por departamento',
        'Se promedian todas las celdas cuyo centro cae dentro del departamento, no el punto de la capital. Un año cuenta solo si tiene los 12 meses con dato.',
      ],
      [
        'Prueba de tendencia',
        'Mann-Kendall con prewhitening (TFPW) sobre los promedios anuales: dice si la serie sube o baja de forma consistente, descontando que un año se parece al siguiente.',
      ],
      [
        'Tamaño del cambio',
        'Pendiente de Sen (la mediana de las pendientes entre todos los pares de años) con su rango probable al 95 %. Se expresa por década y, en lluvia, también en % por década.',
      ],
      [
        'Corrección por mirar 25 zonas a la vez',
        'Con 25 departamentos, alguno saldría «significativo» solo por azar. Benjamini-Hochberg corrige el valor p dentro de cada variable y da el valor q.',
      ],
      [
        'Autocorrelación (lag1)',
        'Mide cuánto se parece un año al siguiente. Si es alta, la tendencia se interpreta con más cuidado.',
      ],
    ],
    semaforoH: 'Cómo leer el semáforo',
    estados: [
      [
        'Cambio real',
        'q menor que 0,05, un rango probable que no cruza el cero y autocorrelación de 0,5 o menos.',
      ],
      [
        'Posible casualidad',
        'Hay una tendencia, pero no pasa esas pruebas: con 24 años y años muy parecidos entre sí no se puede descartar la casualidad. No quiere decir que no haya cambio.',
      ],
      [
        'Pocos datos',
        'Menos de 20 años de datos o menos de 4 celdas en el departamento: no damos veredicto.',
      ],
    ],
    limitesH: 'Lo que debes tener en cuenta',
    limites: [
      [
        'La lluvia de IMERG',
        'Los satélites de IMERG cambian en 2014 (de TRMM a GPM) y su tendencia puede salir sesgada a la baja: con IMERG, la lluvia baja en los 25 departamentos. Por eso el mapa usa la lluvia de POWER, e IMERG aparece en la ficha como segunda fuente para ver si coinciden. Su semáforo nunca llega a «cambio real».',
      ],
      [
        'El Niño',
        'Años como 2017 (Niño Costero) mueven mucho la lluvia de la costa norte. La ficha deja quitar los años de El Niño para ver cuánto pesan.',
      ],
      [
        'El periodo importa',
        'Cambiar el año de inicio puede cambiar el signo de la lluvia en Apurímac, Loreto y Piura. La ficha siempre dice desde qué año se calcula.',
      ],
      [
        'La costa',
        'IMERG tiende a sobreestimar la lluvia en el desierto costero. Por eso se usa el promedio del departamento y no un solo píxel.',
      ],
      [
        'Departamentos pequeños',
        'Con menos de 4 celdas de POWER (Callao, Tumbes y Lambayeque) no damos veredicto. Lima y Callao comparten celda en POWER y sus valores coinciden.',
      ],
      [
        'Años completos',
        'El último año es 2024: IMERG v07 termina en septiembre de 2025, así que 2025 nunca estará completo.',
      ],
      [
        'Es un modelo, no una estación',
        'Los valores son promedios de satélites y modelos en celdas de 10 a 60 km. Pueden fallar en la montaña o con lluvias muy locales.',
      ],
    ],
    creditosH: 'Créditos',
    creditosP:
      'Hecho por el equipo NASA-CHALLENGE-UNAC para el NASA Space Apps Challenge 2026. Datos de la NASA:',
    creditosDatos: [
      ['GPM IMERG: NASA GES DISC', 'https://gpm.nasa.gov/data/imerg'],
      ['MERRA-2: NASA GMAO, entregado por NASA POWER', 'https://power.larc.nasa.gov/'],
      ['MODIS MOD13A3: NASA LP DAAC, vía AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/'],
    ],
    creditosCodigo:
      'Hecho con React, Vite, three.js, TanStack, Recharts, Tailwind CSS y shadcn/ui. Tipografías: Newsreader y Public Sans. Código abierto:',
    repos: REPOS,
    creditosNasa: 'Este proyecto no es un producto oficial de la NASA ni cuenta con su respaldo.',
    menuD: {
      fuentes: 'Satélites y bases de datos de la NASA',
      calculo: 'De la serie de años a la tendencia',
      semaforo: 'Qué significa cada color',
      limites: 'Hasta dónde llegan los datos',
      creditos: 'Equipo, datos y código abierto',
    },
  },
  en: {
    titulo: 'Methodology, sources and credits',
    intro:
      'Peru Trend Detective shows how much rainfall and temperature changed in each department and whether that change is real or could be chance. Here we explain how it is calculated, where the data comes from and what its limits are. It shows what has already changed: it is not a forecast or a recommendation.',
    fuentesH: 'Where the data comes from',
    tablaCols: ['Variable', 'Source', 'Resolution', 'Years'],
    fuentes: [
      {
        variable: 'Rainfall',
        fuente: 'MERRA-2 (NASA) via POWER: corrected precipitation (PRECTOTCORR)',
        resolucion: '≈ 50 × 60 km',
        rango: 'lluvia',
        enlace: ['NASA POWER', 'https://power.larc.nasa.gov/'],
      },
      {
        variable: 'Satellite rainfall (second source)',
        fuente:
          'GPM IMERG v07 (NASA), monthly mean. Only to compare with POWER in the report card ("Do two NASA sources agree?")',
        resolucion: '≈ 10 km',
        rango: 'lluvia',
        enlace: ['GPM IMERG', 'https://gpm.nasa.gov/data/imerg'],
      },
      {
        variable: 'Temperature',
        fuente: 'MERRA-2 (NASA) via POWER: air temperature at 2 m (T2M)',
        resolucion: '≈ 50 × 60 km',
        rango: 'temperatura',
        enlace: ['NASA POWER', 'https://power.larc.nasa.gov/'],
      },
      {
        variable: 'Local copy (plan B)',
        fuente:
          'The same numbers as the API (NASA POWER and, to compare, IMERG). The site uses it when the API does not answer, and always for "without El Niño" and the time machine',
        resolucion: '≈ 50 × 60 km',
        rango: 'local',
        enlace: ['NASA POWER', 'https://power.larc.nasa.gov/'],
      },
      {
        variable: 'Vegetation (Case 2)',
        fuente: 'MODIS MOD13A3 (NASA): NDVI vegetation index, requested with AppEEARS',
        resolucion: '1 km',
        anios: '2001 & 2024',
        enlace: ['AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/'],
      },
      {
        variable: 'Rainforest trees',
        fuente: 'MODIS MOD44B (NASA): % of the ground covered by trees, requested with AppEEARS',
        resolucion: '250 m',
        anios: '2001–2024',
        enlace: ['AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/'],
      },
    ],
    fuentesNota:
      'Each number comes from a single source and the report card says which: we never mix or average sources. These are not measuring stations: each value is the average of a satellite or model grid cell.',
    calculoH: 'How the trend is calculated',
    pasos: [
      [
        'Department average',
        "All grid cells whose center falls inside the department are averaged, not the capital's point. A year counts only if all 12 months have data.",
      ],
      [
        'Trend test',
        'Mann-Kendall with pre-whitening (TFPW) on the annual means: it tells whether the series rises or falls consistently, accounting for one year resembling the next.',
      ],
      [
        'Size of the change',
        "Sen's slope (the median of the slopes between every pair of years) with its 95 % likely range. Given per decade and, for rainfall, also as % per decade.",
      ],
      [
        'Correction for checking 25 areas at once',
        'With 25 departments, some would look "significant" by luck alone. Benjamini-Hochberg corrects the p-value within each variable and gives the q-value.',
      ],
      [
        'Autocorrelation (lag1)',
        'Measures how much one year resembles the next. When it is high, the trend is read with more care.',
      ],
    ],
    semaforoH: 'How to read the traffic light',
    estados: [
      [
        'Real change',
        'q below 0.05, a likely range that does not cross zero and autocorrelation of 0.5 or less.',
      ],
      [
        'Possible chance',
        "There is a trend, but it fails those tests: with 24 years that resemble each other, chance can't be ruled out. It does not mean there is no change.",
      ],
      [
        'Too little data',
        'Fewer than 20 years of data or fewer than 4 cells in the department: we give no verdict.',
      ],
    ],
    limitesH: 'What to keep in mind',
    limites: [
      [
        'IMERG rainfall',
        'IMERG satellites change in 2014 (from TRMM to GPM) and its trend can be biased downward: with IMERG, rainfall drops in all 25 departments. That is why the map uses POWER rainfall, and IMERG appears in the report card as a second source to check whether they agree. Its traffic light never reaches "real change".',
      ],
      [
        'El Niño',
        'Years like 2017 (Coastal Niño) move northern-coast rainfall a lot. The report card lets you remove El Niño years to see how much they weigh.',
      ],
      [
        'The period matters',
        'Changing the start year can flip the sign of rainfall in Apurímac, Loreto and Piura. The report card always says from which year it is calculated.',
      ],
      [
        'The coast',
        'IMERG tends to overestimate rainfall in the coastal desert. That is why the department average is used instead of a single pixel.',
      ],
      [
        'Small departments',
        'With fewer than 4 POWER cells (Callao, Tumbes and Lambayeque) we give no verdict. Lima and Callao share a POWER cell and their values match.',
      ],
      [
        'Complete years',
        'The last year is 2024: IMERG v07 ends in September 2025, so 2025 will never be complete.',
      ],
      [
        'A model, not a station',
        'Values are averages of satellites and models over 10 to 60 km cells. They can fail in the mountains or with very local rain.',
      ],
    ],
    creditosH: 'Credits',
    creditosP:
      'Made by the NASA-CHALLENGE-UNAC team for the NASA Space Apps Challenge 2026. NASA data:',
    creditosDatos: [
      ['GPM IMERG: NASA GES DISC', 'https://gpm.nasa.gov/data/imerg'],
      ['MERRA-2: NASA GMAO, delivered by NASA POWER', 'https://power.larc.nasa.gov/'],
      ['MODIS MOD13A3: NASA LP DAAC, via AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/'],
    ],
    creditosCodigo:
      'Built with React, Vite, three.js, TanStack, Recharts, Tailwind CSS and shadcn/ui. Typefaces: Newsreader and Public Sans. Open source:',
    repos: REPOS,
    creditosNasa: 'This project is not an official NASA product and is not endorsed by NASA.',
    menuD: {
      fuentes: 'NASA satellites and datasets',
      calculo: 'From yearly series to trend',
      semaforo: 'What each colour means',
      limites: 'How far the data goes',
      creditos: 'Team, data and open source',
    },
  },
}
