import type { Rango, Variable, Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
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
  if (variable === 'vegetacion') return `${num(d.slope_per_decade, 3, idioma)} NDVI`
  return `${num(d.slope_per_decade, 2, idioma)} °C`
}

/** Une años con «y» / «and»: "2016, 2017 y 2023". */
export function listaAnios(anios: number[], idioma: Idioma) {
  if (anios.length < 2) return anios.join('')
  return `${anios.slice(0, -1).join(', ')} ${idioma === 'es' ? 'y' : 'and'} ${anios.at(-1)}`
}

/**
 * Número entero con separador de miles del idioma: 18.900 / 18,900 (en español, 4 cifras van
 * juntas: 2310). Es «es» y no «es-PE»: es-PE separa miles con coma, y la app escribe los decimales
 * con coma («0,5 °C»); «2,263 mm» se leería como dos coma algo.
 */
export function miles(v: number, idioma: Idioma) {
  return new Intl.NumberFormat(idioma === 'es' ? 'es' : 'en-US', {
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

/**
 * El titular del agricultor para una variable: cuánto cambió en todo el periodo, en palabras
 * («Desde 2001, llueve como un quinto menos que antes»). Solo afirma si el cambio es claro (real);
 * si no, dice que no se ve un cambio claro. Trae también el ritmo por década y, para el calor, los
 * metros de altura equivalentes. Lo usan la tendencia y «¿Y el calor?».
 */
export function titularCampo(d: Zona, variable: Variable, rango: Rango, idioma: Idioma) {
  const t = TEXTOS[idioma]
  if (variable === 'vegetacion') return titularVerdor(d, rango, idioma)
  const lluvia = variable === 'lluvia'
  const claro = d.status === 'real'
  const sube = d.slope_per_decade >= 0
  const { year_start: desde, year_end: hasta } = rango
  const cifra = cifraCampo(d, variable, idioma)
  // Cambio en todo el periodo: la lluvia en %, el calor en °C
  const total = cambioEnPeriodo(
    lluvia ? (d.pct_change_per_decade ?? 0) : d.slope_per_decade,
    desde,
    hasta,
  )
  const sinPct = lluvia && d.pct_change_per_decade == null
  const titular = !claro
    ? t.campoSinCambio[variable]
    : lluvia
      ? sinPct
        ? t.campoRitmo(cifra, sube, desde, hasta)
        : t.campoFrase.lluvia(desde, t.cuanto(fraccion(total), sube, 'antes'))
      : t.campoFrase.temperatura(desde, `${num(Math.abs(total), 1, idioma)} °C`, sube)
  return {
    claro,
    sube,
    titular,
    /** «Son unos 8 % menos cada 10 años…», o el periodo si no hay cambio claro */
    debajo:
      claro && !sinPct ? t.campoRitmo(cifra, sube, desde, hasta) : t.campoPeriodo(desde, hasta),
    /** Metros de altura equivalentes (solo calor con cambio claro) */
    metros: claro && !lluvia ? metrosEquivalentes(total) : null,
  }
}

/**
 * Cuánto cambió el verdor en el periodo frente a su verdor promedio (la recta de Sen en el año
 * central): «apenas» bajo 3 %, «un poco» bajo 10 %, «bastante» desde ahí. El NDVI no trae % y sus
 * pendientes son chicas (0,003–0,016 por década): sin esto, todo cambio sonaría igual.
 * null si no hay recta (sin `intercept`) o el verdor promedio no es positivo: sin con qué
 * comparar no se dice cuánto, y el titular queda sin el «apenas / un poco / bastante».
 */
export function nivelVerdor(
  d: Pick<Zona, 'slope_per_decade' | 'intercept'>,
  desde: number,
  hasta: number,
): 'apenas' | 'poco' | 'bastante' | null {
  if (d.intercept == null) return null
  const media = d.intercept + (d.slope_per_decade / 10) * ((desde + hasta) / 2)
  if (!(media > 0)) return null
  const pct = (Math.abs(cambioEnPeriodo(d.slope_per_decade, desde, hasta)) / media) * 100
  return pct < 3 ? 'apenas' : pct < 10 ? 'poco' : 'bastante'
}

/** El titular del verdor: «Desde 2001, el campo está un poco más verde que antes». */
function titularVerdor(d: Zona, rango: Rango, idioma: Idioma) {
  const t = TEXTOS[idioma]
  const claro = d.status === 'real'
  const sube = d.slope_per_decade >= 0
  const { year_start: desde, year_end: hasta } = rango
  return {
    claro,
    sube,
    titular: claro
      ? t.campoFrase.vegetacion(desde, nivelVerdor(d, desde, hasta), sube)
      : t.campoSinCambio.vegetacion,
    debajo: claro
      ? t.campoRitmoVerde(num(d.slope_per_decade, 3, idioma), sube, desde, hasta)
      : t.campoPeriodo(desde, hasta),
    metros: null,
  }
}
