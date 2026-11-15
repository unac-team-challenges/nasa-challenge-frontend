import type { Variable, Zona } from '@/data/datos'
import type { Idioma } from '@/i18n/textos'
import { num } from '@/utils/formato'

/**
 * La cifra de la tendencia sin signo, como la lee el agricultor: lluvia en % de su promedio
 * (se entiende mejor que los mm); temperatura en °C.
 */
export function cifraCampo(d: Zona, variable: Variable, idioma: Idioma) {
  if (variable === 'lluvia')
    return d.pct_change_per_decade != null
      ? `${Math.round(Math.abs(d.pct_change_per_decade))} %`
      : `${Math.round(Math.abs(d.slope_per_decade))} mm`
  return `${num(d.slope_per_decade, 2, idioma)} °C`
}

/** Une años con «y» / «and»: "2016, 2017 y 2023". */
export function listaAnios(anios: number[], idioma: Idioma) {
  if (anios.length < 2) return anios.join('')
  return `${anios.slice(0, -1).join(', ')} ${idioma === 'es' ? 'y' : 'and'} ${anios.at(-1)}`
}

/** Número entero con separador de miles del idioma: 2 310 / 2,310. */
export function miles(v: number, idioma: Idioma) {
  return new Intl.NumberFormat(idioma === 'es' ? 'es-PE' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(v)
}

/**
 * Un cambio en %, en las palabras con que se habla en la chacra: «casi igual», «un poco», «como un cuarto»,
 * «casi el doble». Hacia abajo llega a «menos de la mitad»; hacia arriba, a «más del triple».
 */
export type Fraccion =
  | 'igual'
  | 'poquito'
  | 'poco'
  | 'quinto'
  | 'cuarto'
  | 'tercio'
  | 'mitad'
  | 'masMitad'
  | 'casiDoble'
  | 'doble'
  | 'masDoble'
  | 'triple'
  | 'masTriple'

export function fraccion(pct: number): Fraccion {
  const p = Math.abs(pct)
  if (p < 3) return 'igual'
  if (p < 7) return 'poquito'
  if (p < 15) return 'poco'
  if (p < 22) return 'quinto'
  if (p < 29) return 'cuarto'
  if (p < 42) return 'tercio'
  if (p < 58) return 'mitad'
  if (pct < 0) return 'masMitad'
  if (p < 85) return 'casiDoble'
  if (p < 125) return 'doble'
  if (p < 175) return 'masDoble'
  if (p < 250) return 'triple'
  return 'masTriple'
}

/** Cuánto cambió en todo el periodo: la pendiente por década por las décadas que cubre. */
export const cambioEnPeriodo = (porDecada: number, desde: number, hasta: number) =>
  (porDecada * (hasta - desde)) / 10

/**
 * El aire se enfría unos 6,5 °C por cada 1000 m que se sube (gradiente medio de la atmósfera).
 * Un calentamiento de 0,5 °C se siente como tener la chacra unos 80 m más abajo en el cerro.
 * Redondeado a decenas: es una comparación, no una medida.
 */
export const GRADIENTE_C_POR_KM = 6.5

export const metrosEquivalentes = (grados: number) =>
  Math.round(((Math.abs(grados) / GRADIENTE_C_POR_KM) * 1000) / 10) * 10
