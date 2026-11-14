import type { Variable } from '../data/ejemplo'
import type { Idioma } from '../i18n/textos'

export function num(v: number, decimales: number, idioma: Idioma) {
  const s = Math.abs(v).toFixed(decimales)
  return idioma === 'es' ? s.replace('.', ',') : s
}

/** Cambio por década con signo: "+45 mm" o "+0,06". */
export function fmtValor(v: number, variable: Variable, idioma: Idioma) {
  const signo = v > 0 ? '+' : v < 0 ? '−' : ''
  return variable === 'ndvi' ? signo + num(v, 2, idioma) : signo + Math.round(Math.abs(v)) + ' mm'
}

export function fmtP(p: number | null, idioma: Idioma) {
  if (p == null) return '—'
  if (p < 0.001) return idioma === 'es' ? '< 0,001' : '< 0.001'
  return num(p, 3, idioma)
}

export const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
