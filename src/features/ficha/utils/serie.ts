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
 * Filas del gráfico de la serie: el valor de cada año, la recta de Sen (pivote en el año central
 * con el promedio) y la banda del rango probable (IC 95 %), que se abre hacia los extremos.
 */
export function filasSerie(pts: Punto[], d: Pick<Zona, 'slope_per_decade' | 'ci_low' | 'ci_high'>) {
  if (pts.length < 2) return []
  const xc = (pts[0].y + pts[pts.length - 1].y) / 2
  const yc = promedio(pts)
  const recta = (s: number, y: number) => yc + (s / 10) * (y - xc)
  return pts.map((p) => {
    const a = recta(d.ci_low, p.y)
    const b = recta(d.ci_high, p.y)
    return {
      y: p.y,
      v: p.v,
      tendencia: recta(d.slope_per_decade, p.y),
      banda: [Math.min(a, b), Math.max(a, b)] as [number, number],
    }
  })
}

/**
 * Cada año frente a lo normal (el promedio de la serie). Lluvia: en % del promedio, que se entiende
 * mejor que los milímetros; temperatura: en °C.
 */
export function anomalias(pts: Punto[], variable: Variable) {
  const media = promedio(pts)
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

/**
 * Los años malos en dos mitades del periodo (antes / ahora), para ver si vienen más seguido.
 * Cada mitad trae sus años con su anomalía y si fue malo.
 */
export function aniosMalosPorMitad(pts: Punto[], variable: Variable) {
  const filas = anomalias(pts, variable)
  if (filas.length < 4) return null
  const corte = Math.floor((filas[0].y + filas[filas.length - 1].y) / 2)
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
 * Cuánto se apartan de lo normal, en promedio, los años de El Niño de la serie (lluvia en %,
 * temperatura en °C). null si la serie no tiene años de El Niño (o se quitaron).
 */
export function efectoNino(pts: Punto[], variable: Variable, nino: number[]) {
  const enNino = anomalias(pts, variable).filter((f) => nino.includes(f.y))
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
