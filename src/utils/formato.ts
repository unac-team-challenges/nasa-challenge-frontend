import type { Variable } from '@/data/datos'
import type { Idioma } from '@/i18n/textos'

export function num(v: number, decimales: number, idioma: Idioma) {
  const s = Math.abs(v).toFixed(decimales)
  return idioma === 'es' ? s.replace('.', ',') : s
}

/** Cambio por década con signo: "−44 mm" (lluvia) o "+0,21 °C" (temperatura). */
export function fmtValor(v: number, variable: Variable, idioma: Idioma) {
  const signo = v > 0 ? '+' : v < 0 ? '−' : ''
  return variable === 'temperatura'
    ? signo + num(v, 2, idioma) + ' °C'
    : signo + Math.round(Math.abs(v)) + ' mm'
}

/** Porcentaje con signo: "−14 %". */
export function fmtPct(v: number) {
  const signo = v > 0 ? '+' : v < 0 ? '−' : ''
  return signo + Math.round(Math.abs(v)) + ' %'
}

export function fmtP(p: number | null, idioma: Idioma) {
  if (p == null) return '—'
  if (p < 0.001) return idioma === 'es' ? '< 0,001' : '< 0.001'
  return num(p, 3, idioma)
}

export const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Anomalía de un año: "+35 %" (lluvia) o "+0,4 °C" (temperatura). */
export function fmtAnomalia(a: number, variable: Variable, idioma: Idioma) {
  const signo = a > 0 ? '+' : a < 0 ? '−' : ''
  return variable === 'temperatura'
    ? signo + num(a, 1, idioma) + ' °C'
    : signo + Math.round(Math.abs(a) * 100) + ' %'
}
