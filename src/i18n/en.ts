/** Textos de la interfaz en inglés. Va en su propio chunk: solo se baja si se usa el inglés (cargarIdioma en textos.ts). */
import { avisoZonaEn } from '@/i18n/avisoZona'
import { REPOS, type Frases, type Metodologia, type Textos } from '@/i18n/textos'
import type { Region } from '@/data/datos'

export const textos: Textos = {
  marca: 'Peru Trend Detective',
  inicio: 'Peru Trend Detective: home',
  inicioCorto: 'Home',
  lema: 'Climate trends from NASA data',
  cambiarIdioma: 'Change language',
  cambiarTema: 'Change theme',
  variableLbl: 'Variable',
  perfilLbl: 'Profile',
  periodoLbl: 'Period',
  variables: { lluvia: 'Rainfall', temperatura: 'Temperature', vegetacion: 'Vegetation' },
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
  mapH: {
    lluvia: 'Annual rainfall',
    temperatura: 'Mean temperature',
    vegetacion: 'Vegetation (NDVI)',
  },
  mapSub: 'Change per decade',
  mapSubAnio: 'Each department vs its own average',
  mapModoTendencia: (a, b) => `trend ${a}–${b}`,
  mapModoAnio: (y) => `${y} only`,
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
    vegetacion: [
      ['Rises', 'greener'],
      ['Flat', 'no change'],
      ['Sinks', 'less green'],
    ],
  },
  noChange: 'no change',
  texReal: 'Solid: real change',
  texCas: 'Dotted: possibly chance',
  texFew: 'Outline: not enough data',
  calorCosa: {
    lluvia: 'annual rainfall',
    temperatura: 'mean temperature',
    vegetacion: 'greenness (NDVI)',
  },
  calorMedia: (cosa, a, b) => `Colour: ${cosa} ${a}–${b} in each cell`,
  calorAnio: (cosa, anio) => `Colour: ${cosa} of ${anio} in each cell`,
  legAltura: {
    agricultor: ['Height: how much it changed per decade', 'Height: that year vs normal'],
    estudiante: ['Height: Sen slope per decade', 'Height: anomaly vs the mean'],
  },
  legColsEst: [
    [
      ['Rises', 'slope > 0'],
      ['Flat', 'slope ≈ 0'],
      ['Sinks', 'slope < 0'],
    ],
    [
      ['Rises', 'anomaly > 0'],
      ['Flat', 'anomaly ≈ 0'],
      ['Sinks', 'anomaly < 0'],
    ],
  ],
  legMax: (v) => `max. ${v}`,
  legSeguro: 'How sure it is',
  legCuadros: 'The 5 squares: their trend',
  vegetacionBtn: 'Measured places',
  vegConLugar: (lugar) => `measured vegetation: ${lugar}`,
  mapHVeg: 'Vegetation measured by satellite',
  mapSubVeg: 'MODIS, 2001–2024 · all of Peru and 5 places',
  vegSube: 'More vegetation',
  vegBaja: 'Fewer trees',
  vegIgual: 'No clear change',
  vegIntroH: 'Vegetation: 5 measured places',
  vegIntro:
    'The background colour is the greenness (NDVI) of all of Peru, measured by the MODIS satellites. The 5 squares are places studied up close: on the coast, irrigation turns the desert green; in the rainforest, mining takes the forest away.',
  legVegMalla: (a, b) => `Background: mean greenness (NDVI) ${a}–${b}`,
  vegSinDato: (depto) => `${depto} has no measured vegetation. Pick one of the 5 places:`,
  vegOtros: 'Other places with measured vegetation',
  legVegAltura: 'Height: greener, taller',
  ndviMedio: 'mean NDVI',
  ndviNivel: [
    'Desert or bare soil',
    'Sparse vegetation',
    'Moderate vegetation',
    'Dense vegetation',
    'Dense forest',
  ],
  vegTarjetaMeta: (a, b, n) =>
    n ? `MODIS ${a}–${b} · ${n} cells of ~27 km` : `MODIS ${a}–${b} · nearest cell`,
  regionNombre: ['Coast', 'Andes', 'Rainforest'],
  altitudMedia: (m) => `mean altitude ${m.toLocaleString('en-US')} m`,
  spinOn: 'Pause rotation',
  spinOff: 'Rotate the map',
  recenter: 'Back to the starting view',
  showReport: 'Show the report',
  hideReport: 'Hide the report',
  railHint: 'Tap an area',
  kind: (r) =>
    `${({ costa: 'Coastal', sierra: 'Highland', selva: 'Rainforest' } as Record<Region, string>)[r]} department`,
  unitAxis: { lluvia: 'mm/yr', temperatura: '°C', vegetacion: 'NDVI' },
  src: (variable, celdas, fuente, local) =>
    celdas === 0
      ? `${fuente}: no ${local ? '~50 km ' : ''}cell falls inside the department`
      : `${fuente}, annual ${variable === 'lluvia' ? 'rainfall' : variable === 'vegetacion' ? 'greenness (NDVI)' : 'temperature'} averaged over ${celdas} ${local ? (variable === 'vegetacion' ? '~27 km ' : '~50 km ') : ''}${celdas === 1 ? 'cell' : 'cells'}`,
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
  ninoToggle: 'Remove El Niño years',
  ninoCap: (sinNino, anios) =>
    sinNino ? `Without the El Niño years (${anios}).` : `El Niño years: ${anios}.`,
  ninoOn: 'Showing the trend without El Niño years.',
  clueH: 'Clue: up here, down there',
  clue: (nombre, verbo, valor, estado) =>
    `Meanwhile, in ${nombre} ${verbo} by ${valor} per decade (${estado}).`,
  clueBtn: (nombre) => `Go to ${nombre}`,
  confCampo: {
    real: ['Clear change', 'It is unlikely to be just luck.'],
    posible_casualidad: [
      'May be chance',
      'There are good years and bad years, but no clear change yet.',
    ],
    pocos_datos: ['Not enough data', 'There is not enough data here to say anything.'],
  },
  campoFrase: {
    lluvia: (valor, sube) => `Every 10 years it rains ${valor} ${sube ? 'more' : 'less'}`,
    temperatura: (valor, sube) => `Every 10 years it gets ${valor} ${sube ? 'warmer' : 'cooler'}`,
    vegetacion: (valor, sube) => `Every 10 years greenness ${sube ? 'rises' : 'falls'} ${valor}`,
  },
  campoSinCambio: {
    lluvia: 'No clear change in rainfall',
    temperatura: 'No clear change in heat',
    vegetacion: 'No clear change in greenness',
  },
  campoPeriodo: (a, b) => `Comparing the years ${a} to ${b}`,
  medExtremos: {
    lluvia: ['Less rain', 'More rain'],
    temperatura: ['Cooler', 'Warmer'],
    vegetacion: ['Less green', 'Greener'],
  },
  medIgual: 'Same',
  medAria: (valor, a, b) => `Change per decade: ${valor}; likely range between ${a} and ${b}`,
  medCampoPie: 'The needle marks the change. The light area, how far it could go.',
  medTecPie: (pct) =>
    `Sen’s slope and its 95 % CI${pct ? ', as % of each department’s average' : ''}, on the same scale for the departments with data.`,
  formula: 'Sen: the median of the slopes between every pair of years.',
  campoPeores: {
    lluvia: (anios) => `The driest years: ${anios}.`,
    temperatura: (anios) => `The hottest years: ${anios}.`,
    vegetacion: (anios) => `The years with least greenness: ${anios}.`,
  },
  anomH: 'Each year compared with normal',
  anomEje: { lluvia: '% vs normal', temperatura: '°C vs normal', vegetacion: 'NDVI vs normal' },
  anomLeyenda: {
    lluvia: ['Rainy year', 'Dry year'],
    temperatura: ['Hotter year', 'Cooler year'],
    vegetacion: ['Greener year', 'Less green year'],
  },
  nino: 'El Niño',
  anomCap: (a, b, lluvia, sinNino) =>
    `Each bar is a year compared with normal: the average from ${a} to ${b}.` +
    (lluvia && sinNino ? ' Without the El Niño years.' : ''),
  anomTip: {
    lluvia: (valor, sube) => `${valor} ${sube ? 'more' : 'less'} rain than normal`,
    temperatura: (valor, sube) => `${valor} ${sube ? 'hotter' : 'cooler'} than normal`,
    vegetacion: (valor, sube) => `${valor} ${sube ? 'more' : 'less'} greenness than normal`,
  },
  anomTipValor: (v) => `${v} in the year`,
  serieH: 'The series year by year',
  serieLeyenda: {
    puntos: 'Value of the year',
    tendencia: 'Trend (Sen)',
    banda: 'Likely range (95 % CI)',
  },
  serieTipTend: (v) => `Trend: ${v}`,
  serieTipRes: (v) => `${v} vs the trend`,
  csvBtn: 'Download the series (CSV)',
  dosEje: 'mm per decade',
  dosTip: (v, a, b) => `${v} per decade (between ${a} and ${b})`,
  cmpUmbral: 'Green area: pixels with annual NDVI above 0.3. NDVI trend with TFPW and Sen.',
  malosH: {
    lluvia: 'Are dry years coming more often?',
    temperatura: 'Are hot years coming more often?',
    vegetacion: 'Are low-greenness years coming more often?',
  },
  malosResumen: {
    lluvia: (v, antes, ahora) =>
      v === 'mas'
        ? `There are more dry years now than before (${ahora} vs ${antes}).`
        : v === 'menos'
          ? `There are fewer dry years now than before (${ahora} vs ${antes}).`
          : `About the same as before (${ahora} vs ${antes}).`,
    temperatura: (v, antes, ahora) =>
      v === 'mas'
        ? `There are more hot years now than before (${ahora} vs ${antes}).`
        : v === 'menos'
          ? `There are fewer hot years now than before (${ahora} vs ${antes}).`
          : `About the same as before (${ahora} vs ${antes}).`,
    vegetacion: (v, antes, ahora) =>
      v === 'mas'
        ? `There are more low-greenness years now than before (${ahora} vs ${antes}).`
        : v === 'menos'
          ? `There are fewer low-greenness years now than before (${ahora} vs ${antes}).`
          : `About the same as before (${ahora} vs ${antes}).`,
  },
  malosDef: {
    lluvia: 'Dry year: 20 % or more below the normal rainfall of the first years of the period.',
    temperatura: 'Hot year: 0.3 °C or more above the normal of the first years of the period.',
    vegetacion:
      'Low-greenness year: NDVI below the normal of the first years of the period by 0.01 or by how much this department usually varies, whichever is larger.',
  },
  malosPunto: { lluvia: 'Dry year', temperatura: 'Hot year', vegetacion: 'Low-greenness year' },
  malosOtro: 'Other year',
  malosAntes: 'Before',
  malosAhora: 'Now',
  malosDe: (n) => `of ${n} years`,
  malosLeer: 'Each box is a year: “05” is 2005.',
  dosVeredicto: {
    coinciden: 'They agree',
    coincidenDebil: 'They point the same way',
    noCoinciden: 'They disagree',
    dudoso: 'Not clear',
    pocos: 'Cannot compare',
  },
  ninoAquiH: 'What does El Niño bring here?',
  ninoAqui: {
    lluvia: (zona, anios, valor, sube) =>
      `In El Niño years (${anios}), ${zona} had on average ${valor} ${sube ? 'more' : 'less'} rain than expected for those years.`,
    temperatura: (zona, anios, valor, sube) =>
      `In El Niño years (${anios}), ${zona} was on average ${valor} ${sube ? 'hotter' : 'cooler'} than expected for those years.`,
    vegetacion: (zona, anios, valor, sube) =>
      `In El Niño years (${anios}), ${zona} had on average ${valor} ${sube ? 'more' : 'less'} greenness than expected for those years.`,
  },
  ninoSinAnios: 'With the El Niño years removed, we cannot show what it brings here.',
  ninoEnfen: 'See the El Niño alert status (ENFEN)',
  normalH: 'A normal year here',
  normalLluvia: (mm, bajo, alto) =>
    `${mm} of rain a year. Half of the years, between ${bajo} and ${alto}.`,
  normalTemp: (c, bajo, alto) =>
    `${c} average temperature over the year. Half of the years, between ${bajo} and ${alto}.`,
  normalAgua: (m3) => `That rain is about ${m3} m³ of water per hectare.`,
  normalNota: 'It is the average of a wide area, not of your field: your farm may differ.',
  seguirH: 'Where to follow up',
  seguirSenamhi: 'Weather forecasts and warnings (SENAMHI)',
  seguirEnfen: 'Official El Niño communiqués (ENFEN)',
  enlaceNueva: '(opens in a new tab)',
  robH: 'Does the result hold?',
  robCols: ['Case', 'Slope', 'q', 'Status'],
  robCaso: (a, b, sinNino) => `${a}–${b}${sinNino ? ', without El Niño' : ''}`,
  robVer: {
    robusto: 'Robust: “real change” in all 4 cases and always in the same direction.',
    nunca: 'No case reaches “real change”: there is no basis to claim a trend.',
    depende:
      'It depends on the case: the result changes with the period or El Niño. Use with care.',
    pocos: 'Not enough data to compare cases.',
  },
  robSigno: 'Careful: the direction of change flips between cases.',
  robActual: 'the one you are viewing',
  robFuente:
    'Computed with the local copy of NASA POWER, the only one with all 4 cases; the report above may come from the API.',
  rankH: 'Compared with the other departments',
  rankPuesto: (p, n, nombre) =>
    `${nombre} ranks ${p} of ${n} departments with data (1 = the largest increase).`,
  rankCap:
    'Dot: Sen’s slope per decade. Line: its 95 % CI. Sorted from largest to smallest. Tap one to open its report.',
  rankAria: 'Slope of each department with its 95 % CI',
  rankLista: 'View as a list (keyboard and screen reader)',
  tecCorreccion: 'Multiple-testing correction',
  tecCorreccionV: (m) => `Benjamini-Hochberg across ${m} areas, α = 0.05`,
  tecCriterio: '“Real change” criterion',
  tecCriterioV: 'q < 0.05, 95 % CI not crossing zero and |lag1| ≤ 0.5',
  tecGenerado: 'Data generated on',
  limH: 'Limitations',
  lim: (n) => [
    `Short series: with ${n} years the test has low power and a real change may go undetected.`,
    'Coarse resolution: each NASA POWER cell is about 50 km; the average is not an exact point.',
    'It is a reanalysis (a model with observations), not a weather station.',
    'Autocorrelation is corrected with TFPW, but not every dependence between years.',
    'It describes what has already changed: it is not a forecast.',
  ],
  llevarH: 'Take it with you',
  csvTablaBtn: 'Table of the 25 departments (CSV)',
  figSvg: 'Figure (SVG)',
  figPng: 'Figure (PNG)',
  citarH: 'How to cite',
  citarCopiar: 'Copy',
  citarCopiado: 'Copied',
  citarEnlace: 'Link to this exact view',
  reproH: 'Reproduce it',
  reproApi: 'The API returns these same numbers:',
  reproSinApi: 'This session uses the local copy; with the project API, the query is:',
  reproRepos: 'Code of the calculation (backend) and of this page (frontend):',
  causasH: 'Possible causes and consequences',
  causasCausa: 'Why might this be happening?',
  causasConsec: 'What can it bring?',
  causasNota:
    'Our data show what changed, not why. The causes and consequences come from the cited studies.',
  causasFuente: 'Source',
  causasRefs: 'References',
  causasContexto:
    'Context for the area, not an explanation: the change here may be chance, so we do not attribute it to anything.',
  causasNada: 'We found no studies that reliably explain this case, so we do not claim one.',
  verdeH: 'Not every change is the climate',
  verdeSub: 'The coast that turns green',
  verdeCampo: (valle, a, b) =>
    `${valle} has ${b - a} km² more green farmland than in 2001. It is explained mostly by irrigation, not by the rain.`,
  verdeNeutro: (valle, a, b, pct) =>
    `In ${valle}, the vegetated area grew from ${a} km² in 2001 to ${b} km² in 2024 (${pct >= 0 ? '+' : '−'}${Math.abs(pct)} %).`,
  verdeEst: (valle, a, b, pct) =>
    `In ${valle}, the area with annual NDVI above 0.3 went from ${a} km² in 2001 to ${b} km² in 2024 (${pct >= 0 ? '+' : '−'}${Math.abs(pct)} %). The increase is explained mostly by the expansion of irrigation, a land-use change, and not by the rainfall trend; the cited sources do not quantify how much each factor weighs.`,
  verdeCausa: {
    '13': 'The water comes from the Santa River, which the Chavimochic Special Project carries by canal to these valleys.',
    '11': 'Irrigation comes mostly from wells, and its expansion has caused groundwater scarcity in Ica and Villacurí.',
  },
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
    vegetacion: ['greenness rises', 'greenness falls'],
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
  zonaLbl: 'Department',
  zonaElegir: 'Or pick one from the list',
  tapP: {
    lluvia: "You'll see how much its rainfall changed and whether the change is real or chance.",
    temperatura:
      "You'll see how much its temperature changed and whether the change is real or chance.",
    vegetacion:
      "You'll see how much its greenness changed and whether the change is real or chance.",
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
  legTimeNote: (y) => `Year ${y}: each department vs its own average`,
  tipTime: (nombre, v, y) => `${nombre} in ${y}: ${v} vs its average`,
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

export const frases: Frases = {
  estudianteUp: (p: string, q: string, m: number, val: string) =>
    `Mann-Kendall with pre-whitening gives p = ${p}; corrected across ${m} areas, q = ${q} (below 0.05). Sen's slope: ${val} per decade.`,
  estudianteCas: (p: string, q: string, m: number) =>
    `p = ${p} and q = ${q} after correcting across ${m} areas. It does not meet all the conditions of a real change.`,
  few: (z: string) => `${z} has very few cells with data. We draw no conclusion.`,
}

export const causas: Record<string, { campo: string; estudiante: string }> = {
  ninoNorte: {
    campo:
      'Strong El Niño events bring very heavy rain to the northern coast: that is why rainfall here changes so much from year to year.',
    estudiante:
      'Lavado and Espinoza (2014), using 155 stations (1965–2007), show that the extraordinary El Niño events of 1983 and 1998 dominate rainfall variability (first mode, 37 % of variance), with intense rain on the northern Pacific slope. Sulca et al. (2018) specify that it is the eastern Pacific El Niño that wets the northern coast, by shifting the Pacific rain belt south. A trend here depends heavily on which El Niño years fall in the period.',
  },
  ninoSur: {
    campo:
      'In strong El Niño years it usually rains less in the southern highlands and the Altiplano.',
    estudiante:
      'The same study links strong El Niño events with less rain in the southern Andes and the Titicaca basin; Sulca et al. (2018) find drier conditions over the Altiplano with eastern Pacific El Niño and over the tropical Andes with central Pacific El Niño. Compare the trend with and without El Niño years in the robustness table.',
  },
  bosque: {
    campo:
      'Where forest is lost it tends to rain less: it has been measured by satellite in the Amazon and other rainforests. Here it is a possible explanation, not proof.',
    estudiante:
      'Smith et al. (2023) compare, by satellite (2003–2017), deforested areas with nearby forest in the Amazon, the Congo and Southeast Asia: rainfall drops after deforestation, and drops more the larger the area lost. The effect is robust at scales above 50 km, and ground stations do not detect it. For this area it is a hypothesis; our data do not prove it.',
  },
  calentamientoAndes: {
    campo:
      'In the Andes the temperature has been rising for decades, and it is one of the causes of glacier retreat.',
    estudiante:
      'Vuille et al. (2018) link glacier retreat in the tropical Andes with the observed rise in high-elevation air temperature.',
  },
  calentamientoRegion: {
    campo:
      'It may be part of the planet warming: in the region there is more and more extreme heat. For this area it is not proven.',
    estudiante:
      'The IPCC (2022, ch. 12) assesses as likely that warm extremes have increased and cold extremes decreased in several South American subregions, and that global warming has caused Andean glaciers to lose 30% to more than 50% of their area since the 1980s. Our slope is local: attributing it to global warming requires an attribution study.',
  },
  inundaciones: {
    campo:
      'When it rains a lot on the northern coast, floods follow: in 2017 the coastal El Niño caused an emergency from rains and floods in Piura and the north.',
    estudiante:
      'PAHO (2017) documents the emergency caused by the rains and floods of the 2017 coastal El Niño in northern Peru, including Piura.',
  },
  glaciares: {
    campo:
      'With more heat glaciers melt: Peru has already lost 56 % of its glacier surface in almost 60 years. At first that gives rivers more water, but over the years there will be less in the dry season.',
    estudiante:
      'The 2023 national inventory (INAIGEM), based on 2020 imagery, records the loss of 56 % of the glacier surface in 58 years; these glaciers supply water, directly or indirectly, to 62 % of the population. Vuille et al. (2018) explain that melt temporarily increases dry-season flow, but projected glacier shrinkage will reduce it in the long term.',
  },
  cultivosCalor: {
    campo: 'More heat can affect harvests and food production.',
    estudiante:
      'The IPCC (2022, ch. 12) concludes with high confidence that changes in rainfall and extreme temperatures are already affecting agricultural production in the region, and lists food insecurity due to droughts among its key risks.',
  },
  menosAgua: {
    campo: 'If it rains less, there is less water for irrigation, pastures and drinking.',
    estudiante:
      "The IPCC (2022, ch. 12) lists water insecurity from declining snow cover, shrinking glaciers and rainfall variability among the region's key risks, and projects increasing water scarcity (high confidence).",
  },
}

export const fauna: Record<string, [string, string]> = {
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
  mono: ['Yellow-tailed woolly monkey · Amazonas', 'Found only in Peru and critically endangered.'],
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
}

export const meta: Record<
  'inicio' | 'explorar' | 'metodologia',
  { titulo: string; descripcion: string }
> = {
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
}

export const metodologia: Metodologia = {
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
}
