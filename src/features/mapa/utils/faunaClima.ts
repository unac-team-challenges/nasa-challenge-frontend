import { NOMBRE, type Estado, type Variable, type Zona } from '@/data/datos'
import { FAUNA_CLIMA, TEXTOS, type Idioma } from '@/i18n/textos'
import { nivelNdvi } from '@/features/mapa/utils/tarjeta'
import { fmtAnomalia, fmtValor } from '@/utils/formato'

/**
 * Línea de clima que cierra el globo de un personaje: lo que dicen los datos de la NASA del
 * departamento donde vive, según lo que la persona está viendo en el mapa (lluvia o temperatura,
 * con su año si lo eligió, o el verdor NDVI en el modo Vegetación).
 * Devuelve null si la escena todavía no tiene datos de esa zona.
 */
export function lineaClima(
  dept: string,
  zona: Zona | undefined,
  variable: Variable,
  idioma: Idioma,
  anio: { numero: number; valor: number | undefined } | null,
  /** NDVI medio del departamento: se pasa solo en el modo Vegetación (null si no hay medida) */
  ndvi?: number | null,
): string | null {
  const t = FAUNA_CLIMA[idioma]
  const nombre = NOMBRE[dept] ?? dept
  if (ndvi !== undefined) {
    if (ndvi == null || !Number.isFinite(ndvi)) return null
    const valor = idioma === 'es' ? ndvi.toFixed(2).replace('.', ',') : ndvi.toFixed(2)
    return t.verdor(nombre, valor, TEXTOS[idioma].ndviNivel[nivelNdvi(ndvi)].toLowerCase())
  }
  if (!zona) return null
  const estado: Estado = zona.status
  if (estado === 'pocos_datos') return t.pocos(nombre)
  if (anio && anio.valor != null)
    return t.anio(variable, nombre, anio.numero, fmtAnomalia(anio.valor, variable, idioma))
  return t.tendencia(variable, nombre, fmtValor(zona.slope_per_decade, variable, idioma), estado)
}
