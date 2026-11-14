/**
 * Datos REALES de NASA POWER por departamento (src/data/power.json, generado con
 * scripts/datos_power.py con el mismo método y umbral que el pipeline de Josue).
 * Cuando la API del backend sirva las tendencias, este módulo se cambia por la consulta.
 */
import geo from './departamentos.json'
import power from './power.json'

export type Variable = 'lluvia' | 'temperatura'
export type Periodo = 'largo' | 'reciente'
export type Estado = 'real' | 'posible_casualidad' | 'pocos_datos'
export type Region = 'costa' | 'sierra' | 'selva'

export interface Departamento {
  id: string
  nombre: string
  /** MultiPolygon: polígonos → anillos → [lon, lat] */
  polys: number[][][][]
}

/** Contrato por zona (campos del pipeline). Las zonas con pocos_datos pueden no traer cifras. */
export interface Zona {
  id: string
  celdas: number
  n_years: number
  status: Estado
  motivo: string
  slope_per_decade: number
  ci_low: number
  ci_high: number
  pct_change_per_decade: number | null
  p_value: number | null
  q_value: number | null
  lag1: number | null
  year_start: number | null
  year_end: number | null
}

interface ZonaCruda {
  id: string
  celdas: number
  n_years: number
  status: string
  motivo: string
  slope_per_decade?: number
  ci_low?: number
  ci_high?: number
  pct_change_per_decade?: number
  p_value?: number
  q_value?: number
  lag1?: number
  year_start?: number
  year_end?: number
}
interface BloqueVariable {
  unidad: string
  parametro: string
  periodos: Record<Periodo, Record<string, ZonaCruda>>
  sin_nino: Record<Periodo, Record<string, ZonaCruda>>
  series: Record<string, [number, number][]>
}
const DATOS = power as unknown as {
  generado: string
  anios_nino: number[]
  periodos: Record<Periodo, { year_start: number; year_end: number }>
  variables: Record<Variable, BloqueVariable>
}

export const DEPARTAMENTOS = geo as Departamento[]
export const PERIODOS = DATOS.periodos
export const ANIOS_NINO = DATOS.anios_nino
export const GENERADO = DATOS.generado

export const NOMBRE: Record<string, string> = {
  '01': 'Amazonas',
  '02': 'Áncash',
  '03': 'Apurímac',
  '04': 'Arequipa',
  '05': 'Ayacucho',
  '06': 'Cajamarca',
  '07': 'Callao',
  '08': 'Cusco',
  '09': 'Huancavelica',
  '10': 'Huánuco',
  '11': 'Ica',
  '12': 'Junín',
  '13': 'La Libertad',
  '14': 'Lambayeque',
  '15': 'Lima',
  '16': 'Loreto',
  '17': 'Madre de Dios',
  '18': 'Moquegua',
  '19': 'Pasco',
  '20': 'Piura',
  '21': 'Puno',
  '22': 'San Martín',
  '23': 'Tacna',
  '24': 'Tumbes',
  '25': 'Ucayali',
}

export const REGION: Record<string, Region> = {
  '04': 'costa',
  '07': 'costa',
  '11': 'costa',
  '13': 'costa',
  '14': 'costa',
  '15': 'costa',
  '18': 'costa',
  '20': 'costa',
  '23': 'costa',
  '24': 'costa',
  '02': 'sierra',
  '03': 'sierra',
  '05': 'sierra',
  '06': 'sierra',
  '08': 'sierra',
  '09': 'sierra',
  '10': 'sierra',
  '12': 'sierra',
  '19': 'sierra',
  '21': 'sierra',
  '01': 'selva',
  '16': 'selva',
  '17': 'selva',
  '22': 'selva',
  '25': 'selva',
}

function normalizar(z: ZonaCruda): Zona {
  return {
    id: z.id,
    celdas: z.celdas,
    n_years: z.n_years,
    status: z.status as Estado,
    motivo: z.motivo,
    slope_per_decade: z.slope_per_decade ?? 0,
    ci_low: z.ci_low ?? 0,
    ci_high: z.ci_high ?? 0,
    pct_change_per_decade: z.pct_change_per_decade ?? null,
    p_value: z.p_value ?? null,
    q_value: z.q_value ?? null,
    lag1: z.lag1 ?? null,
    year_start: z.year_start ?? null,
    year_end: z.year_end ?? null,
  }
}

/** Estadística por zona de una variable y periodo (con o sin los años de El Niño). */
export function zonasDe(variable: Variable, periodo: Periodo, sinNino = false) {
  const b = DATOS.variables[variable]
  const fuente = sinNino ? b.sin_nino[periodo] : b.periodos[periodo]
  return Object.fromEntries(Object.entries(fuente).map(([id, z]) => [id, normalizar(z)])) as Record<
    string,
    Zona
  >
}

/** Zonas que entraron en la corrección de Benjamini-Hochberg. */
export function zonasProbadas(zonas: Record<string, Zona>) {
  return Object.values(zonas).filter((z) => z.p_value != null).length
}

/** Años de El Niño dentro de un periodo. */
export function ninoEn(periodo: Periodo) {
  const { year_start, year_end } = PERIODOS[periodo]
  return ANIOS_NINO.filter((y) => y >= year_start && y <= year_end)
}

/** Serie anual real de una zona en un periodo. */
export function serie(id: string, variable: Variable, periodo: Periodo, sinNino = false) {
  const { year_start, year_end } = PERIODOS[periodo]
  return (DATOS.variables[variable].series[id] ?? [])
    .filter(([y]) => y >= year_start && y <= year_end && !(sinNino && ANIOS_NINO.includes(y)))
    .map(([y, v]) => ({ y, v }))
}

/** Anomalía nacional de cada año (promedio de las zonas con datos), para las franjas. */
export function anomaliasPeru(variable: Variable, periodo: Periodo) {
  const { year_start, year_end } = PERIODOS[periodo]
  const zonas = zonasDe(variable, periodo)
  const ids = Object.keys(zonas).filter((id) => zonas[id].status !== 'pocos_datos')
  const porZona = ids.map((id) => {
    const pts = serie(id, variable, periodo)
    const media = pts.reduce((a, p) => a + p.v, 0) / pts.length || 1
    // Lluvia: diferencia relativa; temperatura: diferencia en grados
    return Object.fromEntries(
      pts.map((p) => [p.y, variable === 'lluvia' ? (p.v - media) / media : p.v - media]),
    )
  })
  const filas: { y: number; a: number }[] = []
  for (let y = year_start; y <= year_end; y++)
    filas.push({ y, a: porZona.reduce((s, z) => s + (z[y] ?? 0), 0) / porZona.length })
  return { filas, max: Math.max(...filas.map((f) => Math.abs(f.a))) || 1 }
}
