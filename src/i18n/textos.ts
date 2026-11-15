/** Textos de la interfaz en español e inglés (del prototipo v2, con datos reales de NASA POWER). */
import type { Estado, Region, Variable } from '@/data/datos'

export type Idioma = 'es' | 'en'
export type Perfil = 'agricultor' | 'estudiante'

export type PorVariable<T> = Record<Variable, T>
/** Si hay más, menos o igual de años malos ahora que antes (ver compararMalos). */
export type Veredicto = 'mas' | 'menos' | 'igual'

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
  /** Notas del color, una idea por viñeta */
  /** Qué dice la altura, según quién mira: [tendencia, año a año] */
  legAltura: {
    agricultor: ['Altura: cuánto cambió por década', 'Altura: ese año frente a lo normal'],
    estudiante: ['Altura: pendiente de Sen por década', 'Altura: anomalía frente a la media'],
  } as Record<Perfil, [string, string]>,
  /** Rótulos de las columnas para el perfil estudiante: [tendencia, año a año] */
  legColsEst: [
    [
      ['Sube', 'pendiente > 0'],
      ['Igual', 'pendiente ≈ 0'],
      ['Se hunde', 'pendiente < 0'],
    ],
    [
      ['Sube', 'anomalía > 0'],
      ['Igual', 'anomalía ≈ 0'],
      ['Se hunde', 'anomalía < 0'],
    ],
  ] as [[string, string][], [string, string][]],
  legMax: (v: string) => `máx. ${v}`,
  legSeguro: 'Qué tan seguro es',
  legCuadros: 'Los 5 cuadros: su tendencia',
  // Modo «Vegetación» del mapa: de fondo, el NDVI por celda de todo el Perú; encima, los 5 recuadros medidos de cerca
  vegetacionBtn: 'Vegetación',
  vegConLugar: (lugar: string) => `vegetación medida: ${lugar}`,
  mapHVeg: 'Vegetación medida con satélite',
  mapSubVeg: 'MODIS, 2001–2024 · todo el Perú y 5 lugares',
  vegSube: 'Más vegetación',
  vegBaja: 'Menos árboles',
  vegIgual: 'Sin cambio claro',
  vegIntroH: 'Vegetación: 5 lugares medidos',
  vegIntro:
    'El color de fondo es el verdor (NDVI) de todo el Perú, medido con los satélites MODIS. Los 5 cuadros son lugares estudiados de cerca: en la costa, el riego hace reverdecer el desierto; en la selva, la minería se lleva el bosque.',
  legVegMalla: (a: number, b: number) => `Fondo: verdor (NDVI) promedio ${a}–${b}`,
  vegSinDato: (depto: string) => `${depto} no tiene vegetación medida. Elige uno de los 5 lugares:`,
  vegOtros: 'Otros lugares con vegetación medida',
  // Relieve, bosque y ficha del modo Vegetación
  legVegAltura: 'Altura: más verde, más alta',
  ndviMedio: 'NDVI medio',
  ndviNivel: [
    'Desierto o suelo desnudo',
    'Vegetación escasa',
    'Vegetación moderada',
    'Vegetación densa',
    'Bosque denso',
  ],
  vegTarjetaMeta: (a: number, b: number, n: number) =>
    n ? `MODIS ${a}–${b} · ${n} celdas de ~27 km` : `MODIS ${a}–${b} · celda más cercana`,
  regionNombre: ['Costa', 'Sierra', 'Selva'],
  altitudMedia: (m: number) => `altitud media ${String(m).replace(/\B(?=(\d{3})+$)/g, ' ')} m`,
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
    lluvia: '¿Los años secos vienen más seguido?',
    temperatura: '¿Los años calurosos vienen más seguido?',
  } as PorVariable<string>,
  malosResumen: {
    lluvia: (v: Veredicto, antes: number, ahora: number) =>
      v === 'mas'
        ? `Ahora hay más años secos que antes (${ahora} frente a ${antes}).`
        : v === 'menos'
          ? `Ahora hay menos años secos que antes (${ahora} frente a ${antes}).`
          : `Más o menos igual que antes (${ahora} frente a ${antes}).`,
    temperatura: (v: Veredicto, antes: number, ahora: number) =>
      v === 'mas'
        ? `Ahora hay más años calurosos que antes (${ahora} frente a ${antes}).`
        : v === 'menos'
          ? `Ahora hay menos años calurosos que antes (${ahora} frente a ${antes}).`
          : `Más o menos igual que antes (${ahora} frente a ${antes}).`,
  } as PorVariable<(v: Veredicto, antes: number, ahora: number) => string>,
  malosDef: {
    lluvia: 'Año seco: llovió 20 % o más por debajo de lo normal de los primeros años del periodo.',
    temperatura:
      'Año caluroso: 0,3 °C o más por encima de lo normal de los primeros años del periodo.',
  } as PorVariable<string>,
  malosPunto: { lluvia: 'Año seco', temperatura: 'Año caluroso' } as PorVariable<string>,
  malosOtro: 'Otro año',
  malosAntes: 'Antes',
  malosAhora: 'Ahora',
  malosDe: (n: number) => `de ${n} años`,
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

export type Textos = typeof es

/** Un mapa con solo el español: `en` lo agrega cargarIdioma(), por eso el tipo ya lo declara. */
const sinEn = <T>(mapa: { es: T }) => mapa as Record<Idioma, T>

// Solo el español viaja en el código; el inglés (en.ts) se agrega en cargarIdioma(). Hasta entonces
// `en` no existe: la web no cambia a inglés ni dibuja con él antes de que termine la carga.
export const TEXTOS = { es } as Record<Idioma, Textos>

/** Orden de los perfiles en la portada: el público son agricultores y estudiantes (decisión del equipo, 14 nov). */
export const ORDEN_PERFILES: Perfil[] = ['agricultor', 'estudiante']

/** Frase simple de la ficha según el perfil (solo cambian los textos, no los datos). */
const frasesEs = {
  estudianteUp: (p: string, q: string, m: number, val: string) =>
    `Mann-Kendall con prewhitening da p = ${p}; corregido entre ${m} zonas, q = ${q} (menor que 0,05). Pendiente de Sen: ${val} por década.`,
  estudianteCas: (p: string, q: string, m: number) =>
    `p = ${p} y q = ${q} tras corregir entre ${m} zonas. No cumple todas las condiciones de «cambio real».`,
  few: (z: string) => `En ${z} hay muy pocas celdas con datos. No sacamos conclusiones.`,
}
export type Frases = typeof frasesEs
export const FRASES = { es: frasesEs } as Record<Idioma, Frases>

/** Posibles causas y consecuencias, por id de entrada (features/ficha/data/causas.ts). */
export const CAUSAS_TEXTOS = sinEn<Record<string, { campo: string; estudiante: string }>>({
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
})

/** Nombre y dato de cada personaje de la fauna del mapa 3D (src/features/mapa/escena/fauna.ts), por especie. */
export const FAUNA_TEXTOS = sinEn<Record<string, [string, string]>>({
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
})

// ---- Páginas: etiquetas para buscadores y redes (META) y la página de metodología ----

type Pagina = 'inicio' | 'explorar' | 'metodologia'

export const META = sinEn<Record<Pagina, { titulo: string; descripcion: string }>>({
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
})

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

export interface Metodologia {
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

export const METODOLOGIA = sinEn<Metodologia>({
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
})

/**
 * Baja el inglés (chunk aparte) y lo deja en los mapas de arriba. El español ya está. main.tsx la espera
 * antes de dibujar si la URL pide inglés, y el botón de idioma antes de cambiar; las pruebas, en setup.
 */
export async function cargarIdioma(idioma: Idioma) {
  if (idioma === 'es' || TEXTOS.en) return
  const en = await import('@/i18n/en')
  TEXTOS.en = en.textos
  FRASES.en = en.frases
  CAUSAS_TEXTOS.en = en.causas
  FAUNA_TEXTOS.en = en.fauna
  META.en = en.meta
  METODOLOGIA.en = en.metodologia
}
