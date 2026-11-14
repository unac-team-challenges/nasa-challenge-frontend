/**
 * Consultas a la API con respaldo (plan B del stack):
 *   1. Si hay API y responde con las tendencias (`stats`), se usan sus datos.
 *   2. Si no hay API, no responde, tarda o todavía no trae `stats`, se usa la copia local
 *      de datos reales (src/data/power.json, mismo método que el pipeline de Josue).
 * Así la app ya "habla" con el backend y la demo nunca se cae.
 */
import type { Estado, Variable, Zona } from '../data/datos'
import { api, hayApi } from './cliente'

/** Campos de tendencia que la ficha necesita (contrato, `stats`). */
interface StatsApi {
  slope_per_decade: number
  ci_low: number
  ci_high: number
  p_value?: number | null
  q_value?: number | null
  lag1?: number | null
  n_years: number
  status: Estado
  pct_change_per_decade?: number | null
  year_start?: number | null
  year_end?: number | null
  celdas?: number
  motivo?: string
}

/** La lluvia puede llegar en mm/día (GPM IMERG en el backend); la interfaz usa mm/año. */
function factorUnidad(variable: Variable, unidad?: string) {
  return variable === 'lluvia' && unidad && /d[ií]a/i.test(unidad) ? 365 : 1
}

function tieneStats(x: unknown): x is { stats: StatsApi } {
  const s = (x as { stats?: Partial<StatsApi> } | null)?.stats
  return (
    !!s &&
    typeof s.slope_per_decade === 'number' &&
    typeof s.ci_low === 'number' &&
    typeof s.ci_high === 'number' &&
    typeof s.n_years === 'number' &&
    (s.status === 'real' || s.status === 'posible_casualidad' || s.status === 'pocos_datos')
  )
}

function aZona(id: string, s: StatsApi, factor: number): Zona {
  return {
    id,
    celdas: s.celdas ?? 0,
    n_years: s.n_years,
    status: s.status,
    motivo: s.motivo ?? '',
    slope_per_decade: s.slope_per_decade * factor,
    ci_low: s.ci_low * factor,
    ci_high: s.ci_high * factor,
    pct_change_per_decade: s.pct_change_per_decade ?? null,
    p_value: s.p_value ?? null,
    q_value: s.q_value ?? null,
    lag1: s.lag1 ?? null,
    year_start: s.year_start ?? null,
    year_end: s.year_end ?? null,
  }
}

/**
 * Zonas desde la API. Devuelve null si hay que usar la copia local
 * (sin API, error, demora, o respuesta sin tendencias para alguna de las 25 zonas).
 */
export async function zonasDeApi(variable: Variable): Promise<Record<string, Zona> | null> {
  if (!hayApi) return null
  try {
    const [zonas, vars] = await Promise.all([
      api.GET('/api/zonas', { params: { query: { variable } } }),
      api.GET('/api/variables'),
    ])
    const lista = zonas.data as unknown[] | undefined
    if (!lista || lista.length !== 25 || !lista.every(tieneStats)) return null
    const unidad = vars.data?.find((v) => v.id === variable)?.unidad
    const f = factorUnidad(variable, unidad)
    return Object.fromEntries(
      (lista as ({ id: string } & { stats: StatsApi })[]).map((z) => [
        z.id,
        aZona(z.id, z.stats, f),
      ]),
    )
  } catch {
    return null
  }
}

/** Serie anual de una zona desde la API (solo se usa cuando las zonas también vinieron de la API). */
export async function serieDeApi(
  id: string,
  variable: Variable,
): Promise<{ y: number; v: number }[] | null> {
  if (!hayApi) return null
  try {
    const r = await api.GET('/api/zonas/{id}', {
      params: { path: { id }, query: { variable } },
    })
    if (!r.data?.serie?.length) return null
    const f = factorUnidad(variable, r.data.unidad)
    return r.data.serie.map((p) => ({ y: p.anio, v: p.valor * f }))
  } catch {
    return null
  }
}
