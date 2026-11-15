import type { Variable } from '@/data/datos'
import { claveMapa } from '@/lib/direccion'

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

/**
 * Color de una anomalía según la dirección del dato (lluvia: azul = más; temperatura: ocre = más calor).
 * Nunca menos de 40 % de color, para que no quede casi blanco.
 */
export function colorAnomalia(a: number, max: number, variable: Variable = 'lluvia'): string {
  const clave = claveMapa(a, variable)
  const fuerte = cssVar(`--map-${clave}`)
  const suave = cssVar(`--${clave}-soft`)
  return hexMix(suave, fuerte, 0.4 + 0.6 * Math.min(1, Math.abs(a) / max))
}

export function pct(a: number): string {
  const s = Math.round(Math.abs(a) * 100)
  return (a > 0 ? '+' : a < 0 ? '−' : '') + s + ' %'
}
