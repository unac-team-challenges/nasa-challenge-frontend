/** Textos de la interfaz en español e inglés (del prototipo v2, con datos reales de NASA POWER). */
import type { Estado, Periodo, Region, Variable } from '../data/datos'

export type Idioma = 'es' | 'en'
export type Perfil = 'agricultor' | 'estudiante'

type PorVariable<T> = Record<Variable, T>

const es = {
  marca: 'Detective del Perú',
  inicio: 'Detective del Perú: inicio',
  cambiarIdioma: 'Cambiar idioma',
  cambiarTema: 'Cambiar tema',
  variableLbl: 'Variable',
  perfilLbl: 'Perfil',
  periodoLbl: 'Periodo',
  variables: { lluvia: 'Lluvia', temperatura: 'Temperatura' } as PorVariable<string>,
  periodos: { largo: 'Desde 1981', reciente: 'Desde 2001' } as Record<Periodo, string>,
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
  mapSub: (a: number, b: number) => `Cambio por década, ${a}–${b}`,
  legSum: 'Cómo leer el mapa',
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
  status: {
    real: 'Cambio real',
    posible_casualidad: 'Posible casualidad',
    pocos_datos: 'Pocos datos',
  } as Record<Estado, string>,
  perDecade: 'por década',
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
  timeTrend: 'Tendencia',
  timeBackTrend: 'Ver la tendencia',
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
  // Mapa 2D
  vistaMapa: 'Vista del mapa',
  mapa2dAria: 'Mapa del Perú en 2D',
  noGl: 'Tu navegador no muestra 3D. Te mostramos el mapa en 2D con los mismos datos.',
  tipVal: (nombre: string, v: string, u: string, estado: string) =>
    `${nombre}, ${v} ${u}, ${estado.toLowerCase()}`,
}

type Textos = typeof es

const en: Textos = {
  marca: 'Peru Trend Detective',
  inicio: 'Peru Trend Detective: home',
  cambiarIdioma: 'Change language',
  cambiarTema: 'Change theme',
  variableLbl: 'Variable',
  perfilLbl: 'Profile',
  periodoLbl: 'Period',
  variables: { lluvia: 'Rainfall', temperatura: 'Temperature' },
  periodos: { largo: 'Since 1981', reciente: 'Since 2001' },
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
  mapSub: (a, b) => `Change per decade, ${a}–${b}`,
  legSum: 'How to read the map',
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
  status: {
    real: 'Real change',
    posible_casualidad: 'Possibly chance',
    pocos_datos: 'Not enough data',
  },
  perDecade: 'per decade',
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
  timeTrend: 'Trend',
  timeBackTrend: 'Back to the trend',
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
  vistaMapa: 'Map view',
  mapa2dAria: 'Map of Peru in 2D',
  noGl: "Your browser can't show 3D. Here is the 2D map with the same data.",
  tipVal: (nombre, v, u, estado) => `${nombre}, ${v} ${u}, ${estado.toLowerCase()}`,
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

/** Nombre y dato de cada personaje de la fauna del mapa 3D (src/mapa/fauna.ts), por especie. */
export const FAUNA_TEXTOS: Record<Idioma, Record<string, [string, string]>> = {
  es: {
    alpaca: ['Alpaca · Puno', 'Puno cría la mayor cantidad de alpacas del Perú. Las borlas de lana en las orejas son una tradición andina para marcar a cada animal.'],
    vicuna: ['Vicuña · Ayacucho', 'Animal nacional: está en el escudo del Perú. La Reserva Pampa Galeras ayudó a salvarla de la extinción.'],
    condor: ['Cóndor andino · Arequipa', 'Planea sobre el Cañón del Colca aprovechando el aire caliente; sus alas pasan los 3 metros.'],
    pastora: ['Pastora andina · Cusco', 'Pollera y montera: ropa tradicional de las comunidades quechuas del Cusco.'],
    caballito: ['Caballito de totora · La Libertad', 'Los pescadores de Huanchaco usan estas balsas de junco desde tiempos preincas.'],
    agricultor: ['Agricultor · Ica', 'El riego convierte el desierto de Ica en viñedos para el pisco y campos de espárragos.'],
    pinguino: ['Pingüino de Humboldt · Ica', 'Vive en las islas Ballestas, en el agua fría de la corriente de Humboldt. Es una especie vulnerable.'],
    lobo: ['Lobo marino · Callao', 'Forma colonias en las islas Palomino, frente al Callao.'],
    pelicano: ['Pelícano peruano · costa norte', 'Pesca anchoveta en el mar frío de la corriente de Humboldt.'],
    delfin: ['Delfín rosado · Loreto', 'Vive en los ríos amazónicos, como los de la Reserva Pacaya Samiria.'],
    guacamayo: ['Guacamayo escarlata · Madre de Dios', 'Cientos se reúnen en las collpas, paredes de arcilla junto a los ríos de Tambopata.'],
    jaguar: ['Jaguar · Ucayali', 'El felino más grande de América vive en la selva amazónica.'],
    gallito: ['Gallito de las rocas · San Martín', 'Ave nacional del Perú; vive en los bosques nublados.'],
    mono: ['Mono choro de cola amarilla · Amazonas', 'Solo existe en el Perú y está en peligro crítico de extinción.'],
    oso: ['Oso de anteojos · Cajamarca', 'El único oso de Sudamérica; las manchas claras de su cara son distintas en cada uno.'],
    cocodrilo: ['Cocodrilo americano · Tumbes', 'El único cocodrilo del Perú vive en los manglares y ríos de Tumbes.'],
    caballo: ['Caballo peruano de paso · Lima', 'Su andar suave, el «paso llano», es patrimonio cultural de la nación.'],
  },
  en: {
    alpaca: ['Alpaca · Puno', 'Puno raises more alpacas than any other region of Peru. The wool tassels on their ears are an Andean tradition to mark each animal.'],
    vicuna: ['Vicuña · Ayacucho', "National animal, shown on Peru's coat of arms. The Pampa Galeras reserve helped save it from extinction."],
    condor: ['Andean condor · Arequipa', 'It soars over the Colca Canyon on warm air currents; its wingspan exceeds 3 metres.'],
    pastora: ['Andean shepherdess · Cusco', "Pollera skirt and montera hat: traditional clothing of Cusco's Quechua communities."],
    caballito: ['Reed boat · La Libertad', "Huanchaco's fishermen have used these reed boats since pre-Inca times."],
    agricultor: ['Farmer · Ica', "Irrigation turns Ica's desert into vineyards for pisco and asparagus fields."],
    pinguino: ['Humboldt penguin · Ica', 'It lives on the Ballestas Islands, in the cold Humboldt Current. It is a vulnerable species.'],
    lobo: ['Sea lion · Callao', 'It forms colonies on the Palomino Islands, off Callao.'],
    pelicano: ['Peruvian pelican · north coast', 'It fishes for anchovy in the cold Humboldt Current.'],
    delfin: ['Pink river dolphin · Loreto', 'It lives in Amazonian rivers, such as those of the Pacaya Samiria reserve.'],
    guacamayo: ['Scarlet macaw · Madre de Dios', "Hundreds gather at the clay licks along Tambopata's rivers."],
    jaguar: ['Jaguar · Ucayali', 'The largest cat in the Americas lives in the Amazon rainforest.'],
    gallito: ['Andean cock-of-the-rock · San Martín', "Peru's national bird; it lives in cloud forests."],
    mono: ['Yellow-tailed woolly monkey · Amazonas', 'Found only in Peru and critically endangered.'],
    oso: ['Spectacled bear · Cajamarca', "South America's only bear; its pale face markings differ in every individual."],
    cocodrilo: ['American crocodile · Tumbes', "Peru's only crocodile lives in Tumbes' mangroves and rivers."],
    caballo: ['Peruvian Paso horse · Lima', "Its smooth gait, the 'paso llano', is part of Peru's national heritage."],
  },
}
