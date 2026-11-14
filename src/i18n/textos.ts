/** Textos de la interfaz en español e inglés (del prototipo v2, con datos reales de NASA POWER). */
import type { Estado, Periodo, Region, Variable } from '../data/datos'

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
  periodoLbl: 'Periodo',
  variables: { lluvia: 'Lluvia', temperatura: 'Temperatura' } as PorVariable<string>,
  periodos: { largo: 'Desde 1981', reciente: 'Desde 2001' } as Record<Periodo, string>,
  heroH: '¿Qué está cambiando en tu zona del Perú?',
  heroLead:
    'Datos de la NASA de 1981 a 2024. En el mapa, cada departamento sube si llueve más y se hunde si llueve menos.',
  stripesCap: (a: number, b: number) =>
    `El Perú año por año: cada franja es la lluvia de un año frente al promedio ${a}–${b}.`,
  stripeTitle: (y: number, p: string) => `${y}: ${p} frente al promedio`,
  whoH: '¿Quién eres? Así te lo explicamos',
  perfiles: {
    publico: ['Público general', 'Lo esencial, en frases cortas'],
    agricultor: ['Agricultor', 'Lluvia y años secos, en palabras de campo'],
    municipalidad: ['Municipalidad', 'Cifras claras para planificar'],
    estudiante: ['Estudiante', 'Con el detalle de cómo se calcula'],
  } satisfies Record<Perfil, [string, string]>,
  exploreBtn: 'Explorar el mapa',
  fuenteReal: 'Datos de NASA POWER (MERRA-2), 25 departamentos',
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
    lluvia: 'Lluvia: milímetros al año, promedio de las celdas del departamento (NASA POWER).',
    temperatura: 'Temperatura del aire a 2 m: °C, promedio anual del departamento (NASA POWER).',
  } as PorVariable<string>,
  spinOn: 'Pausar giro',
  spinOff: 'Girar el mapa',
  recenter: 'Volver a la vista inicial',
  showReport: 'Mostrar el informe',
  hideReport: 'Ocultar el informe',
  railHint: 'Toca una zona',
  // Ficha
  kind: (r: Region) => `Departamento de la ${r}`,
  unitAxis: { lluvia: 'mm/año', temperatura: '°C' } as PorVariable<string>,
  src: (variable: Variable, celdas: number) =>
    celdas === 0
      ? 'NASA POWER (MERRA-2): ninguna celda de ~50 km cae dentro del departamento'
      : `NASA POWER (MERRA-2), ${variable === 'lluvia' ? 'lluvia' : 'temperatura'} anual promedio de ${celdas} ${celdas === 1 ? 'celda' : 'celdas'} de ~50 km`,
  status: {
    real: 'Cambio real',
    posible_casualidad: 'Posible casualidad',
    pocos_datos: 'Pocos datos',
  } as Record<Estado, string>,
  perDecade: 'por década',
  pctDecade: (p: string) => `${p} por década frente a su promedio`,
  range: (a: string, b: string) => `Rango probable: entre ${a} y ${b}`,
  fewCeldas: (n: number) =>
    n === 0
      ? 'Ninguna celda de NASA POWER (de unos 50 km) cae dentro de este departamento, así que no tiene serie propia. No sacamos conclusiones.'
      : `Solo ${n} ${n === 1 ? 'celda' : 'celdas'} de NASA POWER (de unos 50 km) ${n === 1 ? 'cae' : 'caen'} en este departamento. Necesitamos al menos 4 para medir una tendencia confiable, así que no sacamos conclusiones.`,
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
  howCeldas: 'Celdas de POWER',
  howLag: 'Autocorrelación (lag1)',
  howMotivo: 'Por qué no es «cambio real»',
  howSrc: 'Fuente',
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
  heroLead:
    'NASA data from 1981 to 2024. On the map, each department rises where it rains more and sinks where it rains less.',
  stripesCap: (a, b) =>
    `Peru year by year: each stripe is one year's rainfall compared with the ${a}–${b} average.`,
  stripeTitle: (y, p) => `${y}: ${p} vs average`,
  whoH: "Who are you? We'll explain it your way",
  perfiles: {
    publico: ['General public', 'The essentials, in short sentences'],
    agricultor: ['Farmer', 'Rain and dry years, in plain words'],
    municipalidad: ['Local government', 'Clear figures for planning'],
    estudiante: ['Student', 'With the details of how it is calculated'],
  },
  exploreBtn: 'Explore the map',
  fuenteReal: 'NASA POWER (MERRA-2) data, 25 departments',
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
    lluvia: 'Rainfall: millimetres per year, average of the department cells (NASA POWER).',
    temperatura: 'Air temperature at 2 m: °C, department annual average (NASA POWER).',
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
  src: (variable, celdas) =>
    celdas === 0
      ? 'NASA POWER (MERRA-2): no ~50 km cell falls inside the department'
      : `NASA POWER (MERRA-2), annual ${variable === 'lluvia' ? 'rainfall' : 'temperature'} averaged over ${celdas} ~50 km ${celdas === 1 ? 'cell' : 'cells'}`,
  status: {
    real: 'Real change',
    posible_casualidad: 'Possibly chance',
    pocos_datos: 'Not enough data',
  },
  perDecade: 'per decade',
  pctDecade: (p) => `${p} per decade vs its average`,
  range: (a, b) => `Likely range: ${a} to ${b}`,
  fewCeldas: (n) =>
    n === 0
      ? 'No NASA POWER cell (about 50 km wide) falls inside this department, so it has no series of its own. We draw no conclusion.'
      : `Only ${n} NASA POWER ${n === 1 ? 'cell' : 'cells'} (about 50 km wide) ${n === 1 ? 'falls' : 'fall'} in this department. We need at least 4 to measure a reliable trend, so we draw no conclusion.`,
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
  howCeldas: 'POWER cells',
  howLag: 'Autocorrelation (lag1)',
  howMotivo: 'Why it is not a real change',
  howSrc: 'Source',
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
    noun: { lluvia: 'la lluvia', temperatura: 'la temperatura' } as PorVariable<string>,
    more: {
      lluvia: 'llueve cada vez más',
      temperatura: 'hace cada vez más calor',
    } as PorVariable<string>,
    less: {
      lluvia: 'llueve cada vez menos',
      temperatura: 'hace cada vez más frío',
    } as PorVariable<string>,
    farmMore: { lluvia: 'más lluvia', temperatura: 'más calor' } as PorVariable<string>,
    farmLess: { lluvia: 'menos lluvia', temperatura: 'menos calor' } as PorVariable<string>,
    publicoUp: (z: string, v: string, desde: number) =>
      `Desde ${desde}, en ${z} ${v}. El cambio no parece casualidad.`,
    publicoCas: (z: string, n: string) =>
      `En ${z} ${n} sube y baja de un año a otro. Con estos datos no podemos asegurar que haya una tendencia.`,
    agricultorUp: (z: string, x: string, desde: number) =>
      `Los años en ${z} vienen con ${x} que en ${desde}, y es una tendencia sostenida.`,
    agricultorCas: (z: string) =>
      `En ${z} hay años buenos y años malos, pero no se ve una tendencia clara.`,
    municipalidadUp: (z: string, n: string, val: string, mas: boolean, a: number, b: number) =>
      `Evidencia para planificar: ${n} en ${z} ${mas ? 'aumentó' : 'disminuyó'} ${val} por década entre ${a} y ${b}.`,
    municipalidadCas: (z: string, N: string) =>
      `${N} en ${z} varió, pero el cambio no es significativo. No conviene usarlo como evidencia de tendencia.`,
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall con prewhitening da p = ${p}; corregido entre ${m} zonas, q = ${q} (menor que 0,05). Pendiente de Sen: ${val} por década.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} y q = ${q} tras corregir entre ${m} zonas. No cumple todas las condiciones de «cambio real».`,
    few: (z: string) => `En ${z} hay muy pocas celdas con datos. No sacamos conclusiones.`,
  },
  en: {
    noun: { lluvia: 'rainfall', temperatura: 'temperature' } as PorVariable<string>,
    more: {
      lluvia: 'it rains more and more',
      temperatura: 'it is getting warmer',
    } as PorVariable<string>,
    less: {
      lluvia: 'it rains less and less',
      temperatura: 'it is getting cooler',
    } as PorVariable<string>,
    farmMore: { lluvia: 'more rain', temperatura: 'more heat' } as PorVariable<string>,
    farmLess: { lluvia: 'less rain', temperatura: 'less heat' } as PorVariable<string>,
    publicoUp: (z: string, v: string, desde: number) =>
      `Since ${desde}, in ${z} ${v}. The change does not look like chance.`,
    publicoCas: (z: string, n: string) =>
      `In ${z}, ${n} goes up and down from year to year. With this data we can't say there is a trend.`,
    agricultorUp: (z: string, x: string, desde: number) =>
      `Years in ${z} bring ${x} than in ${desde}, and it is a steady trend.`,
    agricultorCas: (z: string) => `${z} has good years and bad years, but no clear trend.`,
    municipalidadUp: (z: string, n: string, val: string, mas: boolean, a: number, b: number) =>
      `Evidence for planning: ${n} in ${z} ${mas ? 'rose' : 'fell'} by ${val} per decade between ${a} and ${b}.`,
    municipalidadCas: (z: string, N: string) =>
      `${N} in ${z} varied, but the change is not significant. It should not be used as evidence of a trend.`,
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall with pre-whitening gives p = ${p}; corrected across ${m} areas, q = ${q} (below 0.05). Sen's slope: ${val} per decade.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} and q = ${q} after correcting across ${m} areas. It does not meet all the conditions of a real change.`,
    few: (z: string) => `${z} has very few cells with data. We draw no conclusion.`,
  },
}
