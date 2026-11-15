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
