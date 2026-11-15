/**
 * Consultas a la API con respaldo (plan B del stack):
 *   1. Si hay API y responde con las tendencias (`stats`), se usan sus datos.
 *   2. Si no hay API, no responde, tarda o todavía no trae `stats`, se usa la copia local
 *      de datos reales (src/data/power.json, mismo método que el pipeline de Josue).
 * Así la app ya "habla" con el backend y la demo nunca se cae.
 */
import { VARIABLES, type Estado, type Rango, type Variable, type Zona } from '@/data/datos'
import { api, hayApi } from '@/api/cliente'
import type { components } from '@/api/schema'

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
  /** Por qué interpretar con cuidado (p. ej., el cambio de satélites de IMERG en 2014) */
  aviso?: string | null
}

/** La lluvia (POWER o IMERG) llega en mm/día; la interfaz usa mm/año. */
function factorUnidad(variable: Variable | 'lluvia_imerg', unidad?: string) {
  const lluvia = variable === 'lluvia' || variable === 'lluvia_imerg'
  return lluvia && unidad && /d[ií]a/i.test(unidad) ? 365 : 1
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

function aZona(id: string, celdas: number | undefined, s: StatsApi, factor: number): Zona {
  return {
    id,
    celdas: celdas ?? 0,
    n_years: s.n_years,
    status: s.status,
    motivo: s.aviso ?? '',
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

/** Lo que la API sirve de una variable: tendencias por zona, años que cubren y de dónde salen. */
export interface DatosApi {
  zonas: Record<string, Zona>
  rango: Rango
  fuente: string
}

/** Una variable desde la API, o null si le falta algo (tendencias, zonas o rango de años). */
async function variableDeApi(
  variable: Variable,
  info: { unidad: string; fuente: string; anio_inicio?: number | null; anio_fin?: number | null },
): Promise<DatosApi | null> {
  if (info.anio_inicio == null || info.anio_fin == null) return null
  const r = await api.GET('/api/zonas', { params: { query: { variable } } })
  // Pendiente: validación manual hasta que el contrato traiga `stats`; luego, tipos generados
  const lista = r.data as unknown[] | undefined
  if (!lista || lista.length !== 25 || !lista.every(tieneStats)) return null
  const f = factorUnidad(variable, info.unidad)
  return {
    zonas: Object.fromEntries(
      (lista as { id: string; celdas?: number; stats: StatsApi }[]).map((z) => [
        z.id,
        aZona(z.id, z.celdas, z.stats, f),
      ]),
    ),
    rango: { year_start: info.anio_inicio, year_end: info.anio_fin },
    fuente: info.fuente,
  }
}

/**
 * Las dos variables desde la API, pedidas a la vez. Una variable que no viene completa
 * va con la copia local (null). Devuelve null si ninguna sirve (sin API, error o demora).
 */
export async function datosDeApi(): Promise<Record<Variable, DatosApi | null> | null> {
  if (!hayApi) return null
  try {
    const vars = (await api.GET('/api/variables')).data
    const datos = Object.fromEntries(
      await Promise.all(
        VARIABLES.map(async (v) => {
          const info = vars?.find((x) => x.id === v)
          return [v, info ? await variableDeApi(v, info).catch(() => null) : null] as const
        }),
      ),
    ) as Record<Variable, DatosApi | null>
    return VARIABLES.some((v) => datos[v]) ? datos : null
  } catch {
    return null
  }
}

/** Serie anual y aviso de una zona desde la API (solo cuando sus tendencias también vienen de la API). */
export async function detalleDeApi(
  id: string,
  variable: Variable,
): Promise<{ serie: { y: number; v: number }[]; nota: string | null } | null> {
  if (!hayApi) return null
  try {
    const r = await api.GET('/api/zonas/{id}', {
      params: { path: { id }, query: { variable } },
    })
    if (!r.data?.serie?.length) return null
    const f = factorUnidad(variable, r.data.unidad)
    return {
      serie: r.data.serie.map((p) => ({ y: p.anio, v: p.valor * f })),
      nota: r.data.nota ?? null,
    }
  } catch {
    return null
  }
}

/** Cifras del Caso 2 de un valle según `/api/vegetacion` (km² con NDVI > 0,3 y Sen del NDVI por década). */
export interface ValleApi {
  areaAntes: number
  areaDespues: number
  sen: number
  /** `stats.aviso` (p. ej. Olmos: caja movida y peso de El Niño), en español; null si no tiene */
  aviso: string | null
}

/**
 * Vegetación de los valles desde la API, por ubigeo del departamento ("13", "11").
 * Un valle sin 2001 o 2024 en su `serie`, o sin tendencia, no entra: se queda la copia de caso2.ts.
 */
export async function vegetacionDeApi(): Promise<Record<string, ValleApi> | null> {
  if (!hayApi) return null
  try {
    const r = await api.GET('/api/vegetacion')
    if (!r.data) return null
    const valles: Record<string, ValleApi> = {}
    for (const z of r.data) {
      const antes = z.serie.find((p) => p.anio === 2001)
      const despues = z.serie.find((p) => p.anio === 2024)
      if (antes && despues && typeof z.stats.slope_per_decade === 'number')
        valles[z.ubigeo] = {
          areaAntes: Math.round(antes.area_verde_km2),
          areaDespues: Math.round(despues.area_verde_km2),
          sen: z.stats.slope_per_decade,
          aviso: z.stats.aviso ?? null,
        }
    }
    return Object.keys(valles).length ? valles : null
  } catch {
    return null
  }
}

/** Árboles de un recuadro de selva según `/api/cobertura-arboles` (MODIS MOD44B), 2001 frente a 2024. */
export interface SelvaApi {
  /** % del suelo cubierto por árboles */
  pctAntes: number
  pctDespues: number
  /** km² con 30 % o más de árboles (bosque) */
  bosqueAntes: number
  bosqueDespues: number
  /** Tendencia del % de árboles, en puntos por década, con su rango probable */
  sen: number
  ciLow: number
  ciHigh: number
  status: Estado
  /** `stats.aviso` (p. ej. el quiebre de 2009 en La Pampa), en español; null si no tiene */
  aviso: string | null
}

/**
 * Cobertura de árboles de la selva desde la API, por ubigeo del departamento ("17", "16").
 * Un recuadro sin 2001 o 2024 en su `serie`, o sin tendencia completa, no entra: queda la copia de selva.ts.
 */
export async function coberturaDeApi(): Promise<Record<string, SelvaApi> | null> {
  if (!hayApi) return null
  try {
    const r = await api.GET('/api/cobertura-arboles')
    if (!r.data) return null
    const selva: Record<string, SelvaApi> = {}
    for (const z of r.data) {
      const antes = z.serie.find((p) => p.anio === 2001)
      const despues = z.serie.find((p) => p.anio === 2024)
      if (antes && despues && tieneStats(z))
        selva[z.ubigeo] = {
          pctAntes: antes.arboles_pct,
          pctDespues: despues.arboles_pct,
          bosqueAntes: Math.round(antes.area_bosque_km2),
          bosqueDespues: Math.round(despues.area_bosque_km2),
          sen: z.stats.slope_per_decade,
          ciLow: z.stats.ci_low,
          ciHigh: z.stats.ci_high,
          status: z.stats.status,
          aviso: z.stats.aviso ?? null,
        }
    }
    return Object.keys(selva).length ? selva : null
  } catch {
    return null
  }
}

/** Tendencia de una zona en la segunda fuente de lluvia (GPM IMERG), ya en mm/año. */
export interface TendenciaImerg {
  slope_per_decade: number
  ci_low: number
  ci_high: number
  status: Estado
  n_years: number
}

/**
 * La lluvia de IMERG desde la API (`lluvia_imerg`, segunda fuente para comparar con POWER),
 * o null si la API no la tiene (backend viejo) o falla. La unidad sale de /api/variables.
 */
export async function imergDeApi(): Promise<Record<string, TendenciaImerg> | null> {
  if (!hayApi) return null
  try {
    const [r, vars] = await Promise.all([
      api.GET('/api/zonas', { params: { query: { variable: 'lluvia_imerg' } } }),
      api.GET('/api/variables'),
    ])
    const lista = r.data as unknown[] | undefined
    if (!lista || lista.length !== 25 || !lista.every(tieneStats)) return null
    const f = factorUnidad('lluvia_imerg', vars.data?.find((v) => v.id === 'lluvia_imerg')?.unidad)
    return Object.fromEntries(
      (lista as { id: string; stats: StatsApi }[]).map(({ id, stats: s }) => [
        id,
        {
          slope_per_decade: s.slope_per_decade * f,
          ci_low: s.ci_low * f,
          ci_high: s.ci_high * f,
          status: s.status,
          n_years: s.n_years,
        },
      ]),
    )
  } catch {
    return null
  }
}

/** Malla de NASA POWER (T2M anual por celda), del contrato `/api/celdas`. */
export type Malla = components['schemas']['Malla']

/** Malla de temperatura desde la API, o null sin API, con error o vacía (se usa la copia local). */
export async function celdasDeApi(): Promise<Malla | null> {
  if (!hayApi) return null
  try {
    const r = await api.GET('/api/celdas', { params: { query: { variable: 'temperatura' } } })
    return r.data?.celdas.length ? r.data : null
  } catch {
    return null
  }
}
