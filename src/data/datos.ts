/**
 * Datos REALES de NASA POWER por departamento (src/data/power.json, generado con
 * scripts/datos_power.py con el mismo método y umbral que el pipeline de Josue).
 * Cuando la API del backend sirva las tendencias, este módulo se cambia por la consulta.
 */
import geo from '@/data/departamentos.json'
import vegetacion from '@/data/vegetacion.json'

export type Variable = 'lluvia' | 'temperatura' | 'vegetacion'
export type Periodo = 'largo' | 'reciente'
export type Estado = 'real' | 'posible_casualidad' | 'pocos_datos'
export type Region = 'costa' | 'sierra' | 'selva'
/** Años que cubre una tendencia (de la API o de la copia local). */
export type Rango = { year_start: number; year_end: number }

export const VARIABLES: Variable[] = ['lluvia', 'temperatura', 'vegetacion']
/** Fuente de la copia local (src/data/power.json). */
export const FUENTE_LOCAL = 'NASA POWER (MERRA-2)'
/** Fuente de la copia local de vegetación (src/data/vegetacion.json). */
export const FUENTE_VEGETACION = 'MODIS MOD13A3 v061 (NDVI) vía AppEEARS'
/** Fuente de la copia local de una variable. */
export const fuenteLocal = (v: Variable) => (v === 'vegetacion' ? FUENTE_VEGETACION : FUENTE_LOCAL)

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
  /** Intercepto de la recta de Sen en años calendario: valor ≈ intercept + slope/10 × año. */
  intercept: number | null
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
  intercept?: number
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
interface DatosPower {
  generado: string
  anios_nino: number[]
  periodos: Record<Periodo, Rango>
  variables: Record<'lluvia' | 'temperatura', BloqueVariable>
}
type Datos = Omit<DatosPower, 'variables'> & { variables: Record<Variable, BloqueVariable> }
/** NDVI de MODIS (2001–2024): no existe antes de 2001 ni depende de El Niño, así que sus dos periodos y
 *  sus dos variantes son la misma serie. */
const VEG = vegetacion as unknown as Pick<BloqueVariable, 'unidad' | 'parametro' | 'series'> & {
  periodos: { reciente: Record<string, ZonaCruda> }
}
let DATOS: Datos | null = null
const datos = () => {
  if (!DATOS) throw new Error('cargarPower() no terminó: la copia local aún no está en memoria')
  return DATOS
}

/**
 * La copia local (power.json, 90 KB) va en su propio chunk: así no viaja dentro del código de la web
 * y el navegador la guarda aparte (cambia mucho menos que el código). La web espera esta carga antes
 * de dibujar (main.tsx; en las pruebas, testing/setup.ts) y las funciones de abajo siguen siendo
 * síncronas. PERIODOS, ANIOS_NINO y GENERADO son enlaces vivos: valen cuando la carga termina.
 */
export async function cargarPower() {
  if (DATOS) return
  const power = (await import('@/data/power.json')).default as unknown as DatosPower
  DATOS = {
    ...power,
    variables: {
      ...power.variables,
      vegetacion: {
        ...VEG,
        periodos: { reciente: VEG.periodos.reciente, largo: VEG.periodos.reciente },
        sin_nino: { reciente: VEG.periodos.reciente, largo: VEG.periodos.reciente },
      },
    } as Record<Variable, BloqueVariable>,
  }
  PERIODOS = DATOS.periodos
  ANIOS_NINO = DATOS.anios_nino
  GENERADO = DATOS.generado
}

export const DEPARTAMENTOS = geo as Departamento[]
export let PERIODOS = {} as Record<Periodo, Rango>
export let ANIOS_NINO: number[] = []
export let GENERADO = ''

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
    intercept: z.intercept ?? null,
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
  const b = datos().variables[variable]
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

/** Años de El Niño dentro de un rango. */
export function ninoEn({ year_start, year_end }: Rango) {
  return ANIOS_NINO.filter((y) => y >= year_start && y <= year_end)
}

/** Serie anual real de una zona dentro de un rango de años. */
export function serie(id: string, variable: Variable, rango: Rango, sinNino = false) {
  const { year_start, year_end } = rango
  return (datos().variables[variable].series[id] ?? [])
    .filter(([y]) => y >= year_start && y <= year_end && !(sinNino && ANIOS_NINO.includes(y)))
    .map(([y, v]) => ({ y, v }))
}

/** Anomalía de cada año frente al promedio de la zona en el rango (lluvia: fracción; temperatura: °C). */
function anomaliasPorZona(variable: Variable, periodo: Periodo, rango: Rango) {
  const zonas = zonasDe(variable, periodo)
  const porId: Record<string, Record<number, number>> = {}
  for (const id of Object.keys(zonas)) {
    if (zonas[id].status === 'pocos_datos') continue
    const pts = serie(id, variable, rango)
    if (!pts.length) continue
    const media = pts.reduce((a, p) => a + p.v, 0) / pts.length || 1
    porId[id] = Object.fromEntries(
      pts.map((p) => [p.y, variable === 'lluvia' ? (p.v - media) / media : p.v - media]),
    )
  }
  return porId
}

const CACHE_PERU: Partial<Record<string, { filas: { y: number; a: number }[]; max: number }>> = {}

/** Anomalía nacional de cada año (promedio de las zonas con datos), para las franjas. */
export function anomaliasPeru(variable: Variable, periodo: Periodo, rango: Rango) {
  const clave = `${variable}-${periodo}-${rango.year_start}-${rango.year_end}`
  const guardada = CACHE_PERU[clave]
  if (guardada) return guardada
  const porZona = Object.values(anomaliasPorZona(variable, periodo, rango))
  const filas: { y: number; a: number }[] = []
  for (let y = rango.year_start; y <= rango.year_end; y++) {
    const conDato = porZona.filter((z) => z[y] != null)
    // Un año sin datos (el rango de la API puede pasar la copia local) no se pinta
    if (conDato.length) filas.push({ y, a: conDato.reduce((s, z) => s + z[y], 0) / conDato.length })
  }
  return (CACHE_PERU[clave] = { filas, max: Math.max(...filas.map((f) => Math.abs(f.a))) || 1 })
}

export interface Anomalias {
  /** id → año → anomalía (lluvia: fracción del promedio; temperatura: °C) */
  porId: Record<string, Record<number, number>>
  /** Escala para alturas y colores (percentil 95 de |anomalía|, para que un año extremo no aplaste al resto) */
  max: number
}

const CACHE_ANOM: Partial<Record<string, Anomalias>> = {}

/** Máquina del tiempo: cómo fue cada año en cada departamento frente a su propio promedio. */
export function anomaliasAnio(variable: Variable, periodo: Periodo, rango: Rango): Anomalias {
  const clave = `${variable}-${periodo}-${rango.year_start}-${rango.year_end}`
  const guardada = CACHE_ANOM[clave]
  if (guardada) return guardada
  const porId = anomaliasPorZona(variable, periodo, rango)
  const todos = Object.values(porId)
    .flatMap((z) => Object.values(z).map(Math.abs))
    .sort((x, y) => x - y)
  const max = todos[Math.floor(todos.length * 0.95)] || 1
  return (CACHE_ANOM[clave] = { porId, max })
}

/** Parámetro de NASA POWER de cada variable (PRECTOTCORR, T2M), para la ficha técnica. */
export function parametroDe(variable: Variable) {
  return datos().variables[variable].parametro
}
