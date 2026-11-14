/** Textos de la interfaz en español e inglés (del prototipo v2). */
import type { Estado, Region, Variable } from '../data/ejemplo'

export type Idioma = 'es' | 'en'
export type Perfil = 'publico' | 'agricultor' | 'municipalidad' | 'estudiante'

type PorVariable<T> = Record<Variable, T>

const es = {
  marca: 'Detective del Perú',
  inicio: 'Detective del Perú: inicio',
  cambiarIdioma: 'Cambiar idioma',
  cambiarTema: 'Cambiar tema',
  variableLbl: 'Variable',
  perfilLbl: 'Perfil',
  varRain: 'Lluvia',
  varVeg: 'Vegetación',
  heroH: '¿Qué está cambiando en tu zona del Perú?',
  heroLead:
    'Datos de satélites de la NASA de 2000 a 2025. En el mapa, cada departamento sube si llueve más y se hunde si llueve menos.',
  stripesCap:
    'El Perú año por año: cada franja es la lluvia de un año frente al promedio 2000–2025.',
  stripeTitle: (y: number, p: string) => `${y}: ${p} frente al promedio`,
  whoH: '¿Quién eres? Así te lo explicamos',
  perfiles: {
    publico: ['Público general', 'Lo esencial, en frases cortas'],
    agricultor: ['Agricultor', 'Lluvia y años secos, en palabras de campo'],
    municipalidad: ['Municipalidad', 'Cifras claras para planificar'],
    estudiante: ['Estudiante', 'Con el detalle de cómo se calcula'],
  } satisfies Record<Perfil, [string, string]>,
  exploreBtn: 'Explorar el mapa',
  heroCase: 'Abrir el Expediente 1',
  sample: 'Prototipo con datos de ejemplo',
  heroCap: 'Arrastra para girar el Perú. Altura: cambio de la lluvia por década, 2000–2025.',
  ocean: 'Océano Pacífico',
  mapaAria: 'Mapa del Perú en 3D: cada departamento sube o se hunde según cuánto cambió la lluvia',
  // Explorador
  explorador: 'Explorador',
  mapH: { lluvia: 'Lluvia anual', ndvi: 'Vegetación (NDVI)' } as PorVariable<string>,
  mapSub: 'Cambio por década, 2000–2025',
  legSum: 'Cómo leer el mapa',
  legCols: {
    lluvia: [
      ['Sube', 'llueve más'],
      ['Igual', 'sin cambio'],
      ['Se hunde', 'llueve menos'],
    ],
    ndvi: [
      ['Sube', 'más verde'],
      ['Igual', 'sin cambio'],
      ['Se hunde', 'menos verde'],
    ],
  } as PorVariable<[string, string][]>,
  noChange: 'sin cambio',
  texReal: 'Pleno: cambio real',
  texCas: 'Rayado: posible casualidad',
  texFew: 'Contorno: pocos datos',
  scaleTrend: (v: string) => `Columna más alta: ${v} por década`,
  varDef: {
    lluvia: 'Lluvia: milímetros al año, promedio del departamento (GPM IMERG).',
    ndvi: 'Vegetación (NDVI): índice de 0 a 1; más alto es más verde (MODIS).',
  } as PorVariable<string>,
  spinOn: 'Pausar giro',
  spinOff: 'Girar el mapa',
  recenter: 'Volver a la vista inicial',
  showReport: 'Mostrar el informe',
  hideReport: 'Ocultar el informe',
  railHint: 'Toca una zona',
  // Ficha
  kind: (r: Region) => `Departamento de la ${r}`,
  unitAxis: 'mm/año',
  src: {
    lluvia: 'GPM IMERG V07, lluvia anual promedio del departamento',
    ndvi: 'MODIS MOD13A3, NDVI anual promedio del departamento',
  } as PorVariable<string>,
  status: {
    real: 'Cambio real',
    posible_casualidad: 'Posible casualidad',
    pocos_datos: 'Pocos datos',
  } as Record<Estado, string>,
  perDecade: { lluvia: 'por década', ndvi: 'de NDVI por década' } as PorVariable<string>,
  range: (a: string, b: string) => `Rango probable: entre ${a} y ${b}`,
  fewExpl: (n: number) =>
    `Tiene ${n} años con datos de 26. Necesitamos al menos 10 para medir una tendencia, así que no sacamos conclusiones.`,
  chartCap: (lluvia: boolean, sinNino: boolean) =>
    'Puntos: valor de cada año. Línea gruesa: tendencia (pendiente de Sen). Zona sombreada: rango probable.' +
    (lluvia
      ? sinNino
        ? ' Sin los años de El Niño (2016, 2017 y 2023).'
        : ' Franjas: años de El Niño (2016, 2017 y 2023).'
      : ''),
  ninoToggle: 'Quitar los años de El Niño',
  ninoOn: 'Viendo la tendencia sin los años de El Niño.',
  clueH: 'Pista: sube aquí, baja allá',
  clue: (nombre: string, verbo: string, valor: string, estado: string) =>
    `Mientras tanto, en ${nombre} ${verbo} ${valor} por década (${estado}).`,
  clueBtn: (nombre: string) => `Ir a ${nombre}`,
  verb: {
    lluvia: ['la lluvia sube', 'la lluvia baja'],
    ndvi: ['la vegetación sube', 'la vegetación baja'],
  } as PorVariable<[string, string]>,
  howH: 'Cómo lo sabemos',
  howMethod: 'Método',
  howMethodV: 'Mann-Kendall con prewhitening (TFPW) sobre promedios anuales',
  howSlope: 'Pendiente',
  howSlopeV: (v: string) => `Sen, ${v} por década`,
  howN: 'Años con datos',
  howLag: 'Autocorrelación (lag1)',
  howSrc: 'Fuente',
  lagExpl:
    'Mide cuánto se parece un año al siguiente. Si es alta, la prueba lo corrige para no exagerar la tendencia.',
  bhExpl: (q: string, m: number) =>
    `Tiene p menor que 0,05, pero al revisar ${m} zonas a la vez alguna puede salir significativa por azar. Tras corregir (Benjamini-Hochberg), q = ${q}: posible casualidad.`,
  qExpl: (m: number) =>
    `q es el valor p corregido por revisar ${m} zonas a la vez. Si q es menor que 0,05, decimos «cambio real».`,
  disclaimer: 'Muestra lo que ya cambió. No es un pronóstico ni una recomendación.',
  tapH: 'Toca un departamento',
  tapP: {
    lluvia: 'Verás cuánto cambió su lluvia desde el año 2000 y si el cambio es real o casualidad.',
    ndvi: 'Verás cuánto cambió su vegetación desde el año 2000 y si el cambio es real o casualidad.',
  } as PorVariable<string>,
  emptyCase: 'Abrir el Expediente 1',
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
  varRain: 'Rainfall',
  varVeg: 'Vegetation',
  heroH: 'What is changing in your part of Peru?',
  heroLead:
    'NASA satellite data from 2000 to 2025. On the map, each department rises where it rains more and sinks where it rains less.',
  stripesCap:
    "Peru year by year: each stripe is one year's rainfall compared with the 2000–2025 average.",
  stripeTitle: (y, p) => `${y}: ${p} vs average`,
  whoH: "Who are you? We'll explain it your way",
  perfiles: {
    publico: ['General public', 'The essentials, in short sentences'],
    agricultor: ['Farmer', 'Rain and dry years, in plain words'],
    municipalidad: ['Local government', 'Clear figures for planning'],
    estudiante: ['Student', 'With the details of how it is calculated'],
  },
  exploreBtn: 'Explore the map',
  heroCase: 'Open Case file 1',
  sample: 'Prototype with sample data',
  heroCap: 'Drag to turn Peru. Height: rainfall change per decade, 2000–2025.',
  ocean: 'Pacific Ocean',
  mapaAria: 'Map of Peru in 3D: each department rises or sinks by how much rainfall changed',
  explorador: 'Explorer',
  mapH: { lluvia: 'Annual rainfall', ndvi: 'Vegetation (NDVI)' },
  mapSub: 'Change per decade, 2000–2025',
  legSum: 'How to read the map',
  legCols: {
    lluvia: [
      ['Rises', 'more rain'],
      ['Flat', 'no change'],
      ['Sinks', 'less rain'],
    ],
    ndvi: [
      ['Rises', 'greener'],
      ['Flat', 'no change'],
      ['Sinks', 'less green'],
    ],
  },
  noChange: 'no change',
  texReal: 'Solid: real change',
  texCas: 'Striped: possibly chance',
  texFew: 'Outline: not enough data',
  scaleTrend: (v) => `Tallest column: ${v} per decade`,
  varDef: {
    lluvia: 'Rainfall: millimetres per year, department average (GPM IMERG).',
    ndvi: 'Vegetation (NDVI): index from 0 to 1; higher means greener (MODIS).',
  },
  spinOn: 'Pause rotation',
  spinOff: 'Rotate the map',
  recenter: 'Back to the starting view',
  showReport: 'Show the report',
  hideReport: 'Hide the report',
  railHint: 'Tap an area',
  kind: (r) =>
    `${({ costa: 'Coastal', sierra: 'Highland', selva: 'Rainforest' } as Record<Region, string>)[r]} department`,
  unitAxis: 'mm/yr',
  src: {
    lluvia: 'GPM IMERG V07, department average annual rainfall',
    ndvi: 'MODIS MOD13A3, department average annual NDVI',
  },
  status: {
    real: 'Real change',
    posible_casualidad: 'Possibly chance',
    pocos_datos: 'Not enough data',
  },
  perDecade: { lluvia: 'per decade', ndvi: 'NDVI per decade' },
  range: (a, b) => `Likely range: ${a} to ${b}`,
  fewExpl: (n) =>
    `It has ${n} years of data out of 26. We need at least 10 to measure a trend, so we draw no conclusion.`,
  chartCap: (lluvia, sinNino) =>
    "Dots: each year's value. Thick line: trend (Sen's slope). Shaded area: likely range." +
    (lluvia
      ? sinNino
        ? ' El Niño years (2016, 2017 and 2023) removed.'
        : ' Bands: El Niño years (2016, 2017 and 2023).'
      : ''),
  ninoToggle: 'Remove El Niño years',
  ninoOn: 'Showing the trend without El Niño years.',
  clueH: 'Clue: up here, down there',
  clue: (nombre, verbo, valor, estado) =>
    `Meanwhile, in ${nombre} ${verbo} by ${valor} per decade (${estado}).`,
  clueBtn: (nombre) => `Go to ${nombre}`,
  verb: {
    lluvia: ['rainfall rises', 'rainfall falls'],
    ndvi: ['vegetation rises', 'vegetation falls'],
  },
  howH: 'How we know',
  howMethod: 'Method',
  howMethodV: 'Mann-Kendall with pre-whitening (TFPW) on annual means',
  howSlope: 'Slope',
  howSlopeV: (v) => `Sen, ${v} per decade`,
  howN: 'Years with data',
  howLag: 'Autocorrelation (lag1)',
  howSrc: 'Source',
  lagExpl:
    'How much one year resembles the next. When it is high, the test corrects for it so the trend is not overstated.',
  bhExpl: (q, m) =>
    `Its p is below 0.05, but when ${m} areas are checked at once, some can look significant by chance. After correcting (Benjamini-Hochberg), q = ${q}: possibly chance.`,
  qExpl: (m) =>
    `q is the p-value corrected for checking ${m} areas at once. When q is below 0.05 we call it a real change.`,
  disclaimer: 'Shows what has already changed. It is not a forecast or a recommendation.',
  tapH: 'Tap a department',
  tapP: {
    lluvia:
      "You'll see how much its rainfall changed since 2000 and whether the change is real or chance.",
    ndvi: "You'll see how much its vegetation changed since 2000 and whether the change is real or chance.",
  },
  emptyCase: 'Open Case file 1',
  vistaMapa: 'Map view',
  mapa2dAria: 'Map of Peru in 2D',
  noGl: "Your browser can't show 3D. Here is the 2D map with the same data.",
  tipVal: (nombre, v, u, estado) => `${nombre}, ${v} ${u}, ${estado.toLowerCase()}`,
}

export const TEXTOS: Record<Idioma, Textos> = { es, en }

/** Orden de los perfiles en la portada. */
export const ORDEN_PERFILES: Perfil[] = ['agricultor', 'municipalidad', 'estudiante', 'publico']

/** Frase simple de la ficha según el perfil (solo cambian los textos, no los datos). */
export const FRASES = {
  es: {
    noun: { lluvia: 'la lluvia', ndvi: 'la vegetación' } as PorVariable<string>,
    more: {
      lluvia: 'llueve cada vez más',
      ndvi: 'la vegetación está cada vez más verde',
    } as PorVariable<string>,
    less: {
      lluvia: 'llueve cada vez menos',
      ndvi: 'hay cada vez menos vegetación',
    } as PorVariable<string>,
    farmNoun: { lluvia: 'lluvia', ndvi: 'verde en los campos' } as PorVariable<string>,
    publicoUp: (z: string, v: string) =>
      `Desde el año 2000, en ${z} ${v}. El cambio no parece casualidad.`,
    publicoCas: (z: string, n: string) =>
      `En ${z} ${n} sube y baja de un año a otro. Con estos datos no podemos asegurar que haya una tendencia.`,
    agricultorUp: (z: string, x: string, mas: boolean) =>
      `Los años en ${z} vienen con ${mas ? 'más' : 'menos'} ${x} que a inicios de los 2000, y es una tendencia sostenida.`,
    agricultorCas: (z: string) =>
      `En ${z} hay años buenos y años malos, pero no se ve una tendencia clara.`,
    municipalidadUp: (z: string, n: string, val: string, mas: boolean) =>
      `Evidencia para planificar: ${n} en ${z} ${mas ? 'aumentó' : 'disminuyó'} ${val} por década entre 2000 y 2025.`,
    municipalidadCas: (z: string, N: string) =>
      `${N} en ${z} varió, pero el cambio no es significativo. No conviene usarlo como evidencia de tendencia.`,
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall con prewhitening da p = ${p}; corregido entre ${m} zonas, q = ${q} (menor que 0,05). Pendiente de Sen: ${val} por década.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} y q = ${q} tras corregir entre ${m} zonas. Como q no es menor que 0,05, la tendencia no es significativa.`,
    few: (z: string) => `En ${z} hay pocos años con datos confiables. No sacamos conclusiones.`,
  },
  en: {
    noun: { lluvia: 'rainfall', ndvi: 'vegetation' } as PorVariable<string>,
    more: {
      lluvia: 'it rains more and more',
      ndvi: 'vegetation is getting greener',
    } as PorVariable<string>,
    less: {
      lluvia: 'it rains less and less',
      ndvi: 'there is less and less vegetation',
    } as PorVariable<string>,
    farmNoun: { lluvia: 'rain', ndvi: 'green in the fields' } as PorVariable<string>,
    publicoUp: (z: string, v: string) =>
      `Since 2000, in ${z} ${v}. The change does not look like chance.`,
    publicoCas: (z: string, n: string) =>
      `In ${z}, ${n} goes up and down from year to year. With this data we can't say there is a trend.`,
    agricultorUp: (z: string, x: string, mas: boolean) =>
      `Years in ${z} bring ${mas ? 'more' : 'less'} ${x} than in the early 2000s, and it is a steady trend.`,
    agricultorCas: (z: string) => `${z} has good years and bad years, but no clear trend.`,
    municipalidadUp: (z: string, n: string, val: string, mas: boolean) =>
      `Evidence for planning: ${n} in ${z} ${mas ? 'rose' : 'fell'} by ${val} per decade between 2000 and 2025.`,
    municipalidadCas: (z: string, N: string) =>
      `${N} in ${z} varied, but the change is not significant. It should not be used as evidence of a trend.`,
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall with pre-whitening gives p = ${p}; corrected across ${m} areas, q = ${q} (below 0.05). Sen's slope: ${val} per decade.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} and q = ${q} after correcting across ${m} areas. Since q is not below 0.05, the trend is not significant.`,
    few: (z: string) => `${z} has few years of reliable data. We draw no conclusion.`,
  },
}
