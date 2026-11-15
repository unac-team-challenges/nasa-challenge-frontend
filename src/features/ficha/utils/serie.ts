import type { Variable, Zona } from '@/data/datos'

export interface Punto {
  y: number
  v: number
}

/** Promedio de la serie: «lo normal» de la zona en el periodo. */
export function promedio(pts: Punto[]) {
  return pts.length ? pts.reduce((a, p) => a + p.v, 0) / pts.length : 0
}

/**
 * Filas del gráfico de la serie: el valor de cada año, la recta de Sen (`intercept + pendiente × año`,
 * la que calculó el pipeline) y la banda del rango probable (IC 95 %). La banda es el rango de la
 * pendiente girando sobre el año central, no un IC del valor: se abre hacia los extremos.
 * Sin `intercept` (zona sin cifras) la recta pasa por (año central, promedio).
 */
export function filasSerie(
  pts: Punto[],
  d: Pick<Zona, 'slope_per_decade' | 'ci_low' | 'ci_high' | 'intercept'>,
) {
  if (pts.length < 2) return []
  const xc = (pts[0].y + pts[pts.length - 1].y) / 2
  const yc = promedio(pts)
  const sen = (y: number) =>
    d.intercept != null
      ? d.intercept + (d.slope_per_decade / 10) * y
      : yc + (d.slope_per_decade / 10) * (y - xc)
  // Centro de la banda: la propia recta de Sen en el año central.
  const pivote = sen(xc)
  const gira = (s: number, y: number) => pivote + (s / 10) * (y - xc)
  return pts.map((p) => {
    const a = gira(d.ci_low, p.y)
    const b = gira(d.ci_high, p.y)
    return {
      y: p.y,
      v: p.v,
      tendencia: sen(p.y),
      banda: [Math.min(a, b), Math.max(a, b)] as [number, number],
    }
  })
}

/**
 * Cada año frente a lo normal (el promedio de la serie, o `media` si se da otra línea base). Lluvia: en % del promedio, que se entiende
 * mejor que los milímetros; temperatura: en °C.
 */
export function anomalias(pts: Punto[], variable: Variable, media = promedio(pts)) {
  return pts.map((p) => ({
    y: p.y,
    v: p.v,
    a: variable === 'lluvia' ? (media ? ((p.v - media) / media) * 100 : 0) : p.v - media,
  }))
}

/** Años más secos o más calurosos (los de mayor anomalía en contra de lo que preocupa al campo). */
export function peoresAnios(pts: Punto[], variable: Variable, cuantos = 3) {
  const filas = anomalias(pts, variable)
  // Lluvia: preocupan los años secos (anomalía más negativa). Temperatura: los más calurosos.
  const orden =
    variable === 'lluvia' ? (x: number, y: number) => x - y : (x: number, y: number) => y - x
  return filas
    .slice()
    .sort((p, q) => orden(p.a, q.a))
    .slice(0, cuantos)
    .map((f) => f.y)
}

/** La serie como CSV (año y valor), para que el estudiante la abra en una hoja de cálculo. */
export function serieCsv(pts: Punto[], variable: Variable) {
  const cabecera = variable === 'lluvia' ? 'anio,lluvia_mm' : 'anio,temperatura_c'
  return [cabecera, ...pts.map((p) => `${p.y},${+p.v.toFixed(3)}`)].join('\n')
}

/** Primer año de cada racha de años seguidos (2015, 2016 → 2015): ahí va la etiqueta «El Niño». */
export function iniciosDeRacha(anios: number[]) {
  return anios.filter((y) => !anios.includes(y - 1))
}

/**
 * La tendencia como la marca el medidor. Lluvia: en % de su propio promedio (la misma cuenta que
 * pct_change_per_decade), así un departamento muy lluvioso no aplasta la escala de los demás.
 * Temperatura: en °C. Devuelve también si quedó en %.
 */
export function medida(
  z: Pick<Zona, 'slope_per_decade' | 'ci_low' | 'ci_high' | 'pct_change_per_decade'>,
  variable: Variable,
) {
  const f =
    variable === 'lluvia' && z.pct_change_per_decade != null && z.slope_per_decade !== 0
      ? z.pct_change_per_decade / z.slope_per_decade
      : null
  const k = f ?? 1
  return { v: z.slope_per_decade * k, lo: z.ci_low * k, hi: z.ci_high * k, pct: f != null }
}

/**
 * Escala común del medidor: el mayor |valor| entre las pendientes y rangos de todas las zonas con
 * datos, para que la aguja de un departamento se pueda comparar con la de otro.
 */
export function escalaTendencia(zonas: Zona[], variable: Variable) {
  const vals = zonas
    .filter((z) => z.status !== 'pocos_datos')
    .map((z) => medida(z, variable))
    .flatMap((m) => [m.v, m.lo, m.hi].map(Math.abs))
  return Math.max(...vals, 1e-9)
}

/**
 * Qué es un «año malo» para el campo, frente a lo normal: lluvia, un año seco (20 % o más por
 * debajo del promedio); temperatura, un año caluroso (0,3 °C o más por encima).
 */
export const UMBRAL_MALO = { lluvia: -20, temperatura: 0.3 } as const

export function esMalo(anomalia: number, variable: Variable) {
  return variable === 'lluvia'
    ? anomalia <= UMBRAL_MALO.lluvia
    : anomalia >= UMBRAL_MALO.temperatura
}

/** Mediana: el valor del medio, al que no lo arrastra un año fuera de lo común. */
export function mediana(vals: number[]) {
  const v = [...vals].sort((x, y) => x - y)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

/**
 * Los años malos en dos mitades del periodo (antes / ahora), para ver si vienen más seguido.
 * «Lo de siempre» es una línea base fija de la primera mitad: medido contra todo el periodo, una
 * tendencia haría que los años recientes salgan «malos» por construcción. Es la mediana de esa
 * mitad sin los años de El Niño (`nino`): en la costa norte el Niño de 1983 o 1998 multiplica la
 * lluvia y, con el promedio, un año típico salía «seco». Cada mitad trae sus años con su anomalía
 * frente a esa base y si fue malo.
 */
export function aniosMalosPorMitad(pts: Punto[], variable: Variable, nino: number[] = []) {
  if (pts.length < 4) return null
  const corte = Math.floor((pts[0].y + pts[pts.length - 1].y) / 2)
  const primera = pts.filter((p) => p.y <= corte)
  const sinNino = primera.filter((p) => !nino.includes(p.y))
  const base = mediana((sinNino.length ? sinNino : primera).map((p) => p.v))
  const filas = anomalias(pts, variable, base)
  const mitad = (f: typeof filas) => ({
    desde: f[0].y,
    hasta: f[f.length - 1].y,
    anios: f.map((x) => ({ ...x, malo: esMalo(x.a, variable) })),
    malos: f.filter((x) => esMalo(x.a, variable)).length,
  })
  return {
    antes: mitad(filas.filter((f) => f.y <= corte)),
    ahora: mitad(filas.filter((f) => f.y > corte)),
  }
}

/**
 * ¿Hay más años malos ahora que antes? Compara la proporción de cada mitad (no los conteos: sin
 * los años de El Niño las mitades pueden tener distinto largo); 0,15 ≈ 2 años de cada 12.
 */
export function compararMalos(
  antes: { malos: number; anios: unknown[] },
  ahora: { malos: number; anios: unknown[] },
): 'mas' | 'menos' | 'igual' {
  const d = ahora.malos / ahora.anios.length - antes.malos / antes.anios.length
  return d >= 0.15 ? 'mas' : d <= -0.15 ? 'menos' : 'igual'
}

/**
 * La respuesta del titular. Solo se afirma («sí» / «no») si la tendencia de la zona es un cambio
 * real y va hacia el mismo lado (menos lluvia = más años secos; más calor = más años calurosos).
 * Si no, se dice lo que pasó sin llamarlo costumbre: así no contradice a la tarjeta de confianza,
 * que en ese caso dice que todavía no se ve un cambio claro.
 */
export type RespuestaMalos = 'si' | 'no' | 'masSinSeguro' | 'menosSinSeguro' | 'igual'

export function respuestaMalos(
  veredicto: 'mas' | 'menos' | 'igual',
  d: Pick<Zona, 'status' | 'slope_per_decade'>,
  variable: Variable,
): RespuestaMalos {
  if (veredicto === 'igual') return 'igual'
  // Hacia dónde empuja la tendencia: +1 = más años malos, −1 = menos
  const empuja = Math.sign(d.slope_per_decade) * (variable === 'lluvia' ? -1 : 1)
  const seguro = d.status === 'real' && empuja === (veredicto === 'mas' ? 1 : -1)
  if (veredicto === 'mas') return seguro ? 'si' : 'masSinSeguro'
  return seguro ? 'no' : 'menosSinSeguro'
}

/**
 * Cada cuánto viene un año malo, como se dice en el campo: «ni uno», «casi todos los años»,
 * «2 de cada 3», «un año sí y otro no», «uno cada N años» o, si cae a medio camino, «uno cada 2 o
 * 3 años» (5 de 12 no es «un año sí y otro no»: no se redondea a favor de nada).
 */
export type Frecuencia =
  | { tipo: 'ninguno' }
  | { tipo: 'casiTodos' }
  | { tipo: 'dosDeTres' }
  | { tipo: 'unoSiUnoNo' }
  | { tipo: 'cada'; cada: number }
  | { tipo: 'cadaEntre'; de: number; a: number }

export function frecuencia(malos: number, anios: number): Frecuencia {
  if (!malos) return { tipo: 'ninguno' }
  const r = anios / malos
  if (r < 1.25) return { tipo: 'casiTodos' }
  if (r < 1.75) return { tipo: 'dosDeTres' }
  if (r < 2.25) return { tipo: 'unoSiUnoNo' }
  const resto = r - Math.floor(r)
  if (resto >= 0.25 && resto <= 0.75)
    return { tipo: 'cadaEntre', de: Math.floor(r), a: Math.floor(r) + 1 }
  return { tipo: 'cada', cada: Math.round(r) }
}

/**
 * El año malo para recordar: el peor de la mitad reciente (el que el agricultor tiene fresco) o,
 * si ahí no hubo ninguno, el peor de antes. null si no hubo años malos.
 */
type AnioMalo = { y: number; a: number; malo: boolean }

export function anioParaRecordar(
  mitades: { antes: { anios: AnioMalo[] }; ahora: { anios: AnioMalo[] } },
  variable: Variable,
) {
  const peor = (anios: AnioMalo[]) =>
    anios
      .filter((x) => x.malo)
      .sort((p, q) => (variable === 'lluvia' ? p.a - q.a : q.a - p.a))[0] ?? null
  return peor(mitades.ahora.anios) ?? peor(mitades.antes.anios)
}

/** Cuánta lluvia faltó, en palabras: un año 30 % bajo lo de siempre es «como un tercio». */
export type Falta = 'cuarto' | 'tercio' | 'mitad' | 'masMitad'

export function cuantoFalto(pct: number): Falta {
  const p = Math.abs(pct)
  return p < 29 ? 'cuarto' : p < 42 ? 'tercio' : p < 58 ? 'mitad' : 'masMitad'
}

/**
 * Cuánto se apartan de lo esperado, en promedio, los años de El Niño de la serie (lluvia en %,
 * temperatura en °C). Lo esperado es la recta de Sen de la zona: esos años caen al final de la
 * serie y, contra el promedio, se mezclarían con la tendencia. Sin `intercept`, el promedio.
 * null si la serie no tiene años de El Niño (o se quitaron).
 */
export function efectoNino(
  pts: Punto[],
  variable: Variable,
  nino: number[],
  d?: Pick<Zona, 'slope_per_decade' | 'intercept'>,
) {
  const media = promedio(pts)
  const esperado = (y: number) =>
    d?.intercept != null ? d.intercept + (d.slope_per_decade / 10) * y : media
  const enNino = pts
    .filter((p) => nino.includes(p.y))
    .map((p) => {
      const e = esperado(p.y)
      return {
        y: p.y,
        a: variable === 'lluvia' ? (e ? ((p.v - e) / e) * 100 : 0) : p.v - e,
      }
    })
  if (!enNino.length) return null
  return {
    anios: enNino.map((f) => f.y),
    promedio: enNino.reduce((s, f) => s + f.a, 0) / enNino.length,
  }
}

/** Cuantil con interpolación lineal (q entre 0 y 1). */
function cuantil(ordenados: number[], q: number) {
  const i = (ordenados.length - 1) * q
  const a = Math.floor(i)
  const b = Math.ceil(i)
  return ordenados[a] + (ordenados[b] - ordenados[a]) * (i - a)
}

/** Un año normal: el promedio y entre qué valores cae la mitad central de los años. */
export function anioNormal(pts: Punto[]) {
  const v = pts.map((p) => p.v).sort((x, y) => x - y)
  return { promedio: promedio(pts), bajo: cuantil(v, 0.25), alto: cuantil(v, 0.75) }
}

/** 1 mm de lluvia sobre una hectárea son 10 m³ de agua. */
export const m3PorHectarea = (mm: number) => mm * 10
