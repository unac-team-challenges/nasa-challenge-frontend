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
