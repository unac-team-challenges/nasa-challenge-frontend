/** Textos de la interfaz en español e inglés (del prototipo v2, con datos reales de NASA POWER). */
import type { Estado, Region, Variable } from '@/data/datos'
import { avisoZonaEn } from '@/i18n/avisoZona'

export type Idioma = 'es' | 'en'
export type Perfil = 'agricultor' | 'estudiante'

type PorVariable<T> = Record<Variable, T>
/** Respuesta a «¿hay más años malos?» (ver respuestaMalos en features/ficha/utils/serie.ts). */
type RespuestaMalos = 'si' | 'no' | 'masSinSeguro' | 'menosSinSeguro' | 'igual'
/** Cada cuánto viene un año malo (ver frecuencia). */
type Frecuencia =
  | { tipo: 'ninguno' }
  | { tipo: 'casiTodos' }
  | { tipo: 'dosDeTres' }
  | { tipo: 'unoSiUnoNo' }
  | { tipo: 'cada'; cada: number }
  | { tipo: 'cadaEntre'; de: number; a: number }
/** Cuánta lluvia faltó (ver cuantoFalto). */
type Falta = 'cuarto' | 'tercio' | 'mitad' | 'masMitad'

const es = {
  marca: 'Detective del Perú',
  inicio: 'Detective del Perú: inicio',
  inicioCorto: 'Inicio',
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
  texCas: 'Punteado: posible casualidad',
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
  // Modo «Vegetación» del mapa: de fondo, el NDVI por celda de todo el Perú; encima, los 5 recuadros medidos de cerca
  vegetacionBtn: 'Vegetación',
  vegConLugar: (lugar: string) => `vegetación medida: ${lugar}`,
  mapHVeg: 'Vegetación medida con satélite',
  mapSubVeg: 'MODIS, 2001–2024 · todo el Perú y 5 lugares',
  vegSube: 'Más vegetación',
  vegBaja: 'Menos árboles',
  vegIgual: 'Sin cambio claro',
  legVegNota:
    'Cada cuadro es el área medida (unos 25 km de lado), no el departamento. Tócalo para ver el antes y después.',
  vegIntroH: 'Vegetación: 5 lugares medidos',
  vegIntro:
    'El color de fondo es el verdor (NDVI) de todo el Perú, medido con los satélites MODIS. Los 5 cuadros son lugares estudiados de cerca: en la costa, el riego hace reverdecer el desierto; en la selva, la minería se lleva el bosque.',
  legVegMalla: (a: number, b: number) => `Fondo: verdor (NDVI) promedio ${a}–${b}`,
  legVegMallaNota:
    'Celdas de ~27 km, cada año con al menos 6 meses sin nubes. En la selva el NDVI se satura cerca de 0,85: muestra dónde hay vegetación, no cuánto bosque se pierde.',
  vegSinDato: (depto: string) => `${depto} no tiene vegetación medida. Elige uno de los 5 lugares:`,
  vegOtros: 'Otros lugares con vegetación medida',
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
  ninoToggle: 'Quitar los años de El Niño',
  /** Pie de la serie del estudiante (la leyenda ya dice qué es cada marca) */
  ninoCap: (sinNino: boolean, anios: string) =>
    sinNino ? `Sin los años de El Niño (${anios}).` : `Años de El Niño: ${anios}.`,
  ninoOn: 'Viendo la tendencia sin los años de El Niño.',
  clueH: 'Pista: sube aquí, baja allá',
  clue: (nombre: string, verbo: string, valor: string, estado: string) =>
    `Mientras tanto, en ${nombre} ${verbo} ${valor} por década (${estado}).`,
  clueBtn: (nombre: string) => `Ir a ${nombre}`,
  // Ficha: el mismo dato, contado para el agricultor o para el estudiante
  /** Confianza en palabras de campo: [título, explicación] */
  confCampo: {
    real: ['Cambio claro', 'Es poco probable que sea solo suerte.'],
    posible_casualidad: [
      'Puede ser casualidad',
      'Hay años buenos y años malos, pero todavía no se ve un cambio claro.',
    ],
    pocos_datos: ['Faltan datos', 'No hay datos suficientes aquí para decir algo.'],
  } as Record<Estado, [string, string]>,
  /** valor sin signo: "8 %" o "0,20 °C" */
  campoFrase: {
    lluvia: (valor: string, sube: boolean) =>
      `Cada 10 años llueve un ${valor} ${sube ? 'más' : 'menos'}`,
    temperatura: (valor: string, sube: boolean) =>
      `Cada 10 años hace ${valor} ${sube ? 'más de calor' : 'más de frío'}`,
  } as PorVariable<(valor: string, sube: boolean) => string>,
  /** Titular cuando el cambio no es claro: no se afirma ni dirección ni cifra */
  campoSinCambio: {
    lluvia: 'No se ve un cambio claro en la lluvia',
    temperatura: 'No se ve un cambio claro en el calor',
  } as PorVariable<string>,
  campoPeriodo: (a: number, b: number) => `Comparando los años de ${a} a ${b}`,
  medExtremos: {
    lluvia: ['Llueve menos', 'Llueve más'],
    temperatura: ['Más frío', 'Más calor'],
  } as PorVariable<[string, string]>,
  medIgual: 'Igual',
  medAria: (valor: string, a: string, b: string) =>
    `Cambio por década: ${valor}; rango probable entre ${a} y ${b}`,
  medCampoPie: 'La aguja marca el cambio. La zona clara, hasta dónde podría llegar.',
  medTecPie: (pct: boolean) =>
    `Pendiente de Sen y su IC 95 %${pct ? ', en % del promedio de cada departamento' : ''}, en la misma escala para los departamentos con datos.`,
  formula: 'Sen: la mediana de las pendientes entre todos los pares de años.',
  campoPeores: {
    lluvia: (anios: string) => `Los años más secos: ${anios}.`,
    temperatura: (anios: string) => `Los años más calurosos: ${anios}.`,
  } as PorVariable<(anios: string) => string>,
  anomH: 'Cada año frente a lo normal',
  anomEje: {
    lluvia: '% frente a lo normal',
    temperatura: '°C frente a lo normal',
  } as PorVariable<string>,
  /** [arriba, abajo] */
  anomLeyenda: {
    lluvia: ['Año lluvioso', 'Año seco'],
    temperatura: ['Año más caluroso', 'Año más frío'],
  } as PorVariable<[string, string]>,
  nino: 'El Niño',
  anomCap: (a: number, b: number, lluvia: boolean, sinNino: boolean) =>
    `Cada barra es un año comparado con lo normal: el promedio de ${a} a ${b}.` +
    (lluvia && sinNino ? ' Sin los años de El Niño.' : ''),
  anomTip: {
    lluvia: (valor: string, sube: boolean) =>
      `${valor} ${sube ? 'más' : 'menos'} lluvia que lo normal`,
    temperatura: (valor: string, sube: boolean) =>
      `${valor} ${sube ? 'más caluroso' : 'más frío'} que lo normal`,
  } as PorVariable<(valor: string, sube: boolean) => string>,
  anomTipValor: (v: string) => `${v} en el año`,
  serieH: 'La serie año por año',
  serieLeyenda: {
    puntos: 'Valor del año',
    tendencia: 'Tendencia (Sen)',
    banda: 'Rango probable (IC 95 %)',
  },
  serieTipTend: (v: string) => `Tendencia: ${v}`,
  serieTipRes: (v: string) => `${v} frente a la tendencia`,
  csvBtn: 'Descargar la serie (CSV)',
  dosEje: 'mm por década',
  dosTip: (v: string, a: string, b: string) => `${v} por década (entre ${a} y ${b})`,
  cmpUmbral: 'Área verde: píxeles con NDVI anual mayor que 0,3. Tendencia del NDVI con TFPW y Sen.',
  // Ficha del agricultor: años malos, El Niño, año normal, compartir y dónde seguir
  malosH: {
    lluvia: '¿Ahora hay más años de seca?',
    temperatura: '¿Ahora hay más años de calor fuerte?',
  } as PorVariable<string>,
  /** El titular: solo dice «sí» o «no» si la tendencia es un cambio claro y va hacia ese lado */
  malosRespuesta: {
    lluvia: {
      si: 'Sí, la seca está viniendo más seguido que antes.',
      no: 'No, al revés: ahora la seca viene menos seguido que antes.',
      masSinSeguro:
        'Han caído más años secos que antes, pero todavía no se puede decir que ya sea costumbre.',
      menosSinSeguro:
        'Han caído menos años secos que antes, pero todavía no se puede decir que vaya a seguir así.',
      igual: 'Más o menos como siempre: la seca no viene ni más ni menos seguido.',
    },
    temperatura: {
      si: 'Sí, los años de calor fuerte vienen más seguido que antes.',
      no: 'No, al revés: ahora los años de calor fuerte vienen menos seguido.',
      masSinSeguro:
        'Han caído más años de calor fuerte que antes, pero todavía no se puede decir que ya sea costumbre.',
      menosSinSeguro:
        'Han caído menos años de calor fuerte que antes, pero todavía no se puede decir que vaya a seguir así.',
      igual: 'Más o menos como siempre: el calor fuerte no viene ni más ni menos seguido.',
    },
  } as PorVariable<Record<RespuestaMalos, string>>,
  malosFrec: (f: Frecuencia) =>
    f.tipo === 'ninguno'
      ? 'Ni uno'
      : f.tipo === 'casiTodos'
        ? 'Casi todos los años'
        : f.tipo === 'dosDeTres'
          ? '2 de cada 3 años'
          : f.tipo === 'unoSiUnoNo'
            ? 'Un año sí y otro no'
            : f.tipo === 'cada'
              ? `Uno cada ${f.cada} años`
              : `Uno cada ${f.de} o ${f.a} años`,
  malosCuenta: (malos: number, n: number) => `${malos} de ${n} años`,
  malosRecuerdaLluvia: (anio: number, falta: Falta) =>
    `¿Te acuerdas de ${anio}? Ese año faltó ${
      {
        cuarto: 'como un cuarto',
        tercio: 'como un tercio',
        mitad: 'como la mitad',
        masMitad: 'más de la mitad',
      }[falta]
    } de la lluvia de siempre.`,
  /** grados sin signo: "0,6 °C" */
  malosRecuerdaCalor: (anio: number, grados: string) =>
    `¿Te acuerdas de ${anio}? Ese año hizo ${grados} más de calor que lo de siempre.`,
  malosDef: {
    lluvia: 'Año de seca: faltó una quinta parte de la lluvia de siempre, o más.',
    temperatura: 'Año de calor fuerte: 0,3 °C o más por encima de lo de siempre.',
  } as PorVariable<string>,
  malosPunto: { lluvia: 'Año de seca', temperatura: 'Año de calor fuerte' } as PorVariable<string>,
  malosOtro: {
    lluvia: 'Año normal o lluvioso',
    temperatura: 'Año normal o más fresco',
  } as PorVariable<string>,
  malosAntes: 'Antes',
  malosAhora: 'Ahora',
  malosBase: (a: number, b: number) =>
    `«Lo de siempre» es un año típico de ${a} a ${b}, sin contar los años de El Niño.`,
  malosLeer: 'Cada casilla es un año: «05» es 2005.',
  dosVeredicto: {
    coinciden: 'Sí coinciden',
    coincidenDebil: 'Apuntan a lo mismo',
    noCoinciden: 'No coinciden',
    dudoso: 'No está claro',
    pocos: 'No se pueden comparar',
  },
  ninoAquiH: '¿Qué trae El Niño aquí?',
  /** valor sin signo: "81 %" o "0,5 °C" */
  ninoAqui: {
    lluvia: (zona: string, anios: string, valor: string, sube: boolean) =>
      `En los años de El Niño (${anios}), en ${zona} llovió en promedio ${valor} ${sube ? 'más' : 'menos'} que lo esperado en esos años.`,
    temperatura: (zona: string, anios: string, valor: string, sube: boolean) =>
      `En los años de El Niño (${anios}), ${zona} estuvo en promedio ${valor} ${sube ? 'más caluroso' : 'más frío'} que lo esperado en esos años.`,
  } as PorVariable<(zona: string, anios: string, valor: string, sube: boolean) => string>,
  ninoSinAnios: 'Con los años de El Niño quitados, aquí no se puede ver lo que trae.',
  ninoEnfen: 'Ver el estado de alerta de El Niño (ENFEN)',
  normalH: 'Un año normal aquí',
  normalLluvia: (mm: string, bajo: string, alto: string) =>
    `${mm} de lluvia al año. La mitad de los años, entre ${bajo} y ${alto}.`,
  normalTemp: (c: string, bajo: string, alto: string) =>
    `${c} de temperatura promedio en el año. La mitad de los años, entre ${bajo} y ${alto}.`,
  normalAgua: (m3: string) => `Esa lluvia son unos ${m3} m³ de agua por hectárea.`,
  normalNota: 'Es el promedio de una zona amplia, no de tu chacra: tu campo puede ser distinto.',
  seguirH: 'Dónde seguir',
  seguirSenamhi: 'Pronósticos y avisos del tiempo (SENAMHI)',
  seguirEnfen: 'Comunicados oficiales sobre El Niño (ENFEN)',
  enlaceNueva: '(se abre en otra pestaña)',
  // Ficha del estudiante: robustez, ranking, ficha técnica, limitaciones, descargas, cita
  robH: '¿Se sostiene el resultado?',
  robCols: ['Caso', 'Pendiente', 'q', 'Estado'],
  robCaso: (a: number, b: number, sinNino: boolean) => `${a}–${b}${sinNino ? ', sin El Niño' : ''}`,
  robVer: {
    robusto: 'Robusto: «cambio real» en los 4 casos y siempre en el mismo sentido.',
    nunca: 'En ningún caso llega a «cambio real»: no hay base para afirmar una tendencia.',
    depende:
      'Depende del caso: el resultado cambia con el periodo o con El Niño. Tómalo con cuidado.',
    pocos: 'No hay datos suficientes para comparar casos.',
  },
  robSigno: 'Ojo: el sentido del cambio se invierte entre casos.',
  robActual: 'el que estás viendo',
  robFuente:
    'Calculado con la copia local de NASA POWER, la única que trae los 4 casos; la ficha de arriba puede venir de la API.',
  rankH: 'Frente a los demás departamentos',
  rankPuesto: (p: number, n: number, nombre: string) =>
    `${nombre} está en el puesto ${p} de ${n} departamentos con datos (1 = el que más sube).`,
  rankCap:
    'Punto: pendiente de Sen por década. Línea: su IC 95 %. Ordenados de mayor a menor. Toca uno para ir a su ficha.',
  rankAria: 'Pendiente de cada departamento con su IC 95 %',
  rankLista: 'Ver como lista (teclado y lector de pantalla)',
  tecCorreccion: 'Corrección por pruebas múltiples',
  tecCorreccionV: (m: number) => `Benjamini-Hochberg entre ${m} zonas, α = 0,05`,
  tecCriterio: 'Criterio de «cambio real»',
  tecCriterioV: 'q < 0,05, IC 95 % que no cruza el cero y |lag1| ≤ 0,5',
  tecGenerado: 'Datos generados el',
  limH: 'Limitaciones',
  lim: (n: number) => [
    `Series cortas: con ${n} años, la prueba tiene poca potencia y un cambio real puede no detectarse.`,
    'Resolución gruesa: cada celda de NASA POWER mide unos 50 km; el promedio no representa un punto exacto.',
    'Es un reanálisis (modelo con observaciones), no una estación meteorológica.',
    'La autocorrelación se corrige con TFPW, pero no todas las dependencias entre años.',
    'Describe lo que ya cambió: no es un pronóstico.',
  ],
  llevarH: 'Llévatelo',
  csvTablaBtn: 'Tabla de los 25 departamentos (CSV)',
  figSvg: 'Figura (SVG)',
  figPng: 'Figura (PNG)',
  citarH: 'Cómo citar',
  citarCopiar: 'Copiar',
  citarCopiado: 'Copiado',
  citarEnlace: 'Enlace a esta vista exacta',
  reproH: 'Reprodúcelo',
  reproApi: 'La API devuelve estos mismos números:',
  reproSinApi: 'Esta sesión usa la copia local; con la API del proyecto, la consulta es:',
  reproRepos: 'Código del cálculo (backend) y de esta página (frontend):',
  // Posibles causas y consecuencias (fuentes en features/ficha/data/causas.ts)
  causasH: 'Posibles causas y consecuencias',
  causasCausa: '¿Por qué puede estar pasando?',
  causasConsec: '¿Qué puede traer?',
  causasNota:
    'Nuestros datos muestran qué cambió, no por qué. Las causas y consecuencias vienen de los estudios citados.',
  causasFuente: 'Fuente',
  causasRefs: 'Referencias',
  causasContexto:
    'Contexto de la zona, no una explicación: el cambio de aquí puede ser casualidad, así que no lo atribuimos a nada.',
  causasNada:
    'No encontramos estudios que expliquen este caso con seguridad, así que no lo afirmamos.',
  verdeH: 'No todo cambio es el clima',
  verdeSub: 'La costa que reverdece',
  verdeCampo: (valle: string, a: number, b: number) =>
    `En ${valle} hay ${b - a} km² más de campo verde que en 2001. Se explica sobre todo por el riego, no por la lluvia.`,
  /** Recuadros sin causa documentada (Olmos): solo las cifras, sin atribuir el cambio */
  verdeNeutro: (valle: string, a: number, b: number, pct: number) =>
    `En ${valle}, el área con vegetación pasó de ${a} km² en 2001 a ${b} km² en 2024 (${pct >= 0 ? '+' : '−'}${Math.abs(pct)} %).`,
  verdeEst: (valle: string, a: number, b: number, pct: number) =>
    `En ${valle}, el área con NDVI anual mayor que 0,3 pasó de ${a} km² en 2001 a ${b} km² en 2024 (${pct >= 0 ? '+' : '−'}${Math.abs(pct)} %). El aumento se explica sobre todo por la expansión del riego, un cambio de uso del suelo, y no por la tendencia de la lluvia; las fuentes citadas no cuantifican cuánto pesa cada factor.`,
  verdeCausa: {
    '13': 'El agua viene del río Santa, que el Proyecto Especial Chavimochic lleva por canal hasta estos valles.',
    '11': 'El riego sale sobre todo de pozos, y su expansión ha generado escasez de agua subterránea en Ica y Villacurí.',
  } as Record<string, string>,
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
  zonaLbl: 'Departamento',
  zonaElegir: 'O elige uno de la lista',
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
  inicioCorto: 'Home',
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
  texCas: 'Dotted: possibly chance',
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
  vegetacionBtn: 'Vegetation',
  vegConLugar: (lugar) => `measured vegetation: ${lugar}`,
  mapHVeg: 'Vegetation measured by satellite',
  mapSubVeg: 'MODIS, 2001–2024 · all of Peru and 5 places',
  vegSube: 'More vegetation',
  vegBaja: 'Fewer trees',
  vegIgual: 'No clear change',
  legVegNota:
    'Each square is the measured area (about 25 km wide), not the department. Tap it to see before and after.',
  vegIntroH: 'Vegetation: 5 measured places',
  vegIntro:
    'The background colour is the greenness (NDVI) of all of Peru, measured by the MODIS satellites. The 5 squares are places studied up close: on the coast, irrigation turns the desert green; in the rainforest, mining takes the forest away.',
  legVegMalla: (a, b) => `Background: mean greenness (NDVI) ${a}–${b}`,
  legVegMallaNota:
    'Cells of ~27 km, each year with at least 6 cloud-free months. In the rainforest NDVI saturates near 0.85: it shows where vegetation is, not how much forest is lost.',
  vegSinDato: (depto) => `${depto} has no measured vegetation. Pick one of the 5 places:`,
  vegOtros: 'Other places with measured vegetation',
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
  },
  campoSinCambio: {
    lluvia: 'No clear change in rainfall',
    temperatura: 'No clear change in heat',
  },
  campoPeriodo: (a, b) => `Comparing the years ${a} to ${b}`,
  medExtremos: {
    lluvia: ['Less rain', 'More rain'],
    temperatura: ['Cooler', 'Warmer'],
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
  },
  anomH: 'Each year compared with normal',
  anomEje: { lluvia: '% vs normal', temperatura: '°C vs normal' },
  anomLeyenda: {
    lluvia: ['Rainy year', 'Dry year'],
    temperatura: ['Hotter year', 'Cooler year'],
  },
  nino: 'El Niño',
  anomCap: (a, b, lluvia, sinNino) =>
    `Each bar is a year compared with normal: the average from ${a} to ${b}.` +
    (lluvia && sinNino ? ' Without the El Niño years.' : ''),
  anomTip: {
    lluvia: (valor, sube) => `${valor} ${sube ? 'more' : 'less'} rain than normal`,
    temperatura: (valor, sube) => `${valor} ${sube ? 'hotter' : 'cooler'} than normal`,
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
    lluvia: 'Are there more drought years now?',
    temperatura: 'Are there more scorching years now?',
  },
  malosRespuesta: {
    lluvia: {
      si: 'Yes, drought is coming more often than before.',
      no: 'No, the other way round: drought is coming less often than before.',
      masSinSeguro:
        'There have been more dry years than before, but we can’t say yet that it’s the new normal.',
      menosSinSeguro:
        'There have been fewer dry years than before, but we can’t say yet that it will stay that way.',
      igual: 'Pretty much as always: drought isn’t coming more or less often.',
    },
    temperatura: {
      si: 'Yes, scorching years are coming more often than before.',
      no: 'No, the other way round: scorching years are coming less often.',
      masSinSeguro:
        'There have been more scorching years than before, but we can’t say yet that it’s the new normal.',
      menosSinSeguro:
        'There have been fewer scorching years than before, but we can’t say yet that it will stay that way.',
      igual: 'Pretty much as always: scorching years aren’t coming more or less often.',
    },
  },
  malosFrec: (f) =>
    f.tipo === 'ninguno'
      ? 'Not one'
      : f.tipo === 'casiTodos'
        ? 'Almost every year'
        : f.tipo === 'dosDeTres'
          ? '2 out of 3 years'
          : f.tipo === 'unoSiUnoNo'
            ? 'Every other year'
            : f.tipo === 'cada'
              ? `One every ${f.cada} years`
              : `One every ${f.de} or ${f.a} years`,
  malosCuenta: (malos, n) => `${malos} of ${n} years`,
  malosRecuerdaLluvia: (anio, falta) =>
    `Remember ${anio}? That year about ${
      { cuarto: 'a quarter', tercio: 'a third', mitad: 'half', masMitad: 'more than half' }[falta]
    } of the usual rain was missing.`,
  malosRecuerdaCalor: (anio, grados) =>
    `Remember ${anio}? That year was ${grados} hotter than usual.`,
  malosDef: {
    lluvia: 'Drought year: a fifth or more of the usual rain was missing.',
    temperatura: 'Scorching year: 0.3 °C or more above usual.',
  },
  malosPunto: { lluvia: 'Drought year', temperatura: 'Scorching year' },
  malosOtro: { lluvia: 'Normal or rainy year', temperatura: 'Normal or cooler year' },
  malosAntes: 'Before',
  malosAhora: 'Now',
  malosBase: (a, b) =>
    `“Usual” is a typical year from ${a} to ${b}, leaving out the El Niño years.`,
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
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall con prewhitening da p = ${p}; corregido entre ${m} zonas, q = ${q} (menor que 0,05). Pendiente de Sen: ${val} por década.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} y q = ${q} tras corregir entre ${m} zonas. No cumple todas las condiciones de «cambio real».`,
    few: (z: string) => `En ${z} hay muy pocas celdas con datos. No sacamos conclusiones.`,
  },
  en: {
    estudianteUp: (p: string, q: string, m: number, val: string) =>
      `Mann-Kendall with pre-whitening gives p = ${p}; corrected across ${m} areas, q = ${q} (below 0.05). Sen's slope: ${val} per decade.`,
    estudianteCas: (p: string, q: string, m: number) =>
      `p = ${p} and q = ${q} after correcting across ${m} areas. It does not meet all the conditions of a real change.`,
    few: (z: string) => `${z} has very few cells with data. We draw no conclusion.`,
  },
}

/** Posibles causas y consecuencias, por id de entrada (features/ficha/data/causas.ts). */
export const CAUSAS_TEXTOS: Record<
  Idioma,
  Record<string, { campo: string; estudiante: string }>
> = {
  es: {
    ninoNorte: {
      campo:
        'Los El Niño fuertes traen lluvias muy fuertes a la costa norte: por eso aquí la lluvia cambia tanto de un año a otro.',
      estudiante:
        'Lavado y Espinoza (2014), con 155 estaciones (1965–2007), muestran que los El Niño extraordinarios de 1983 y 1998 dominan la variabilidad de la lluvia (primer modo, 37 % de la varianza), con lluvias intensas en la vertiente norte del Pacífico. Sulca et al. (2018) precisan que es El Niño del Pacífico oriental el que moja la costa norte, al correr hacia el sur la zona de lluvias del Pacífico. Una tendencia aquí depende mucho de qué años de El Niño caen en el periodo.',
    },
    ninoSur: {
      campo: 'En los años de El Niño fuerte suele llover menos en la sierra sur y el altiplano.',
      estudiante:
        'El mismo estudio asocia los El Niño fuertes con menos lluvia en los Andes del sur y la cuenca del Titicaca; Sulca et al. (2018) encuentran condiciones más secas en el altiplano con El Niño del Pacífico oriental y en los Andes tropicales con el del Pacífico central. Compara la tendencia con y sin los años de El Niño en la tabla de robustez.',
    },
    bosque: {
      campo:
        'Donde se pierde bosque suele llover menos: se ha medido con satélites en la Amazonía y otras selvas. Aquí es una posible explicación, no una prueba.',
      estudiante:
        'Smith et al. (2023) comparan, con satélites (2003–2017), zonas deforestadas con zonas vecinas de bosque en la Amazonía, el Congo y el sudeste asiático: la lluvia baja tras la deforestación, y baja más cuanto mayor es el área perdida. El efecto es robusto a escalas mayores de 50 km y las estaciones en tierra no lo detectan. Para esta zona es una hipótesis; nuestros datos no la prueban.',
    },
    calentamientoAndes: {
      campo:
        'En los Andes la temperatura viene subiendo desde hace décadas, y es una de las causas del retroceso de los glaciares.',
      estudiante:
        'Vuille et al. (2018) relacionan el retroceso glaciar de los Andes tropicales con el aumento observado de la temperatura del aire en altura.',
    },
    calentamientoRegion: {
      campo:
        'Puede ser parte del calentamiento del planeta: en la región hay cada vez más calor extremo. Para esta zona no está probado.',
      estudiante:
        'El IPCC (2022, cap. 12) evalúa como probable que en varias subregiones de Sudamérica hayan aumentado los extremos cálidos y disminuido los fríos, y que el calentamiento global ha hecho perder a los glaciares andinos entre el 30 % y más del 50 % de su área desde los años 1980. Nuestra pendiente es local: atribuirla al calentamiento global exige un estudio de atribución.',
    },
    inundaciones: {
      campo:
        'Cuando llueve mucho en la costa norte vienen inundaciones: en 2017, El Niño costero causó una emergencia por lluvias e inundaciones en Piura y el norte.',
      estudiante:
        'La OPS (2017) documenta la emergencia por las lluvias e inundaciones de El Niño costero de 2017 en el norte del país, incluida Piura.',
    },
    glaciares: {
      campo:
        'Con más calor los glaciares se derriten: el Perú ya perdió el 56 % de su superficie de glaciares en casi 60 años. Al principio eso da más agua a los ríos, pero con los años habrá menos en época seca.',
      estudiante:
        'El inventario nacional de 2023 (INAIGEM), con imágenes de 2020, registra la pérdida del 56 % de la superficie glaciar en 58 años; esos glaciares abastecen de agua, directa o indirectamente, al 62 % de la población. Vuille et al. (2018) explican que el deshielo aumenta por un tiempo el caudal de estiaje, pero que la reducción proyectada de los glaciares lo bajará a largo plazo.',
    },
    cultivosCalor: {
      campo: 'Más calor puede afectar las cosechas y la producción de alimentos.',
      estudiante:
        'El IPCC (2022, cap. 12) concluye con confianza alta que los cambios en la lluvia y las temperaturas extremas ya afectan la producción agrícola de la región, y cuenta entre sus riesgos clave la inseguridad alimentaria por sequías.',
    },
    menosAgua: {
      campo: 'Si llueve menos, hay menos agua para el riego, los pastos y el consumo.',
      estudiante:
        'El IPCC (2022, cap. 12) incluye entre los riesgos clave de la región la inseguridad hídrica por la menor cobertura de nieve, el retroceso de glaciares y la variabilidad de la lluvia, y proyecta mayor escasez de agua (confianza alta).',
    },
  },
  en: {
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

/** Repositorios del proyecto (metodología y ficha del estudiante). */
export const REPOS: Enlace[] = [
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
