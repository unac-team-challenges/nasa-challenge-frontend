import type { Variable } from '../data/ejemplo'

/** Lee un token de color del tema (variables CSS de :root). */
export function cssVar(nombre: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
}

/** Mezcla dos colores hex: t = 0 da a, t = 1 da b. */
export function hexMix(a: string, b: string, t: number): string {
  const p = (h: string) => {
    const s = h.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16))
  }
  const A = p(a)
  const B = p(b)
  return (
    '#' +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * t)
        .toString(16)
        .padStart(2, '0'),
    ).join('')
  )
}

export function esTemaClaro(): boolean {
  const n = parseInt(cssVar('--bg').replace('#', ''), 16)
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 128
}

/** Color de una anomalía: azul (o verde en NDVI) si sube, ocre si baja; nunca menos de 40 % de color. */
export function colorAnomalia(a: number, max: number, ndvi = false): string {
  const sube = a >= 0
  const fuerte = cssVar(sube ? (ndvi ? '--map-green' : '--map-up') : '--map-down')
  const suave = cssVar(sube ? (ndvi ? '--green-soft' : '--up-soft') : '--down-soft')
  return hexMix(suave, fuerte, 0.4 + 0.6 * Math.min(1, Math.abs(a) / max))
}

export function pct(a: number): string {
  const s = Math.round(Math.abs(a) * 100)
  return (a > 0 ? '+' : a < 0 ? '−' : '') + s + ' %'
}

/** Token del color de dirección: azul (o verde en NDVI) si sube, ocre si baja. */
export function colorDireccion(pendiente: number, variable: Variable) {
  return pendiente >= 0 ? (variable === 'ndvi' ? '--green' : '--up') : '--down'
}
