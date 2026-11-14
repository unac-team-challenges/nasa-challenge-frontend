/**
 * Datos de EJEMPLO (inventados) del prototipo v2, con la forma del contrato por zona.
 * Se reemplazan por los JSON reales del backend cuando existan las tendencias.
 */
import geo from './departamentos.json'

export type Variable = 'lluvia' | 'ndvi'
export type Estado = 'real' | 'posible_casualidad' | 'pocos_datos'

export interface Departamento {
  id: string
  nombre: string
  /** MultiPolygon: polígonos → anillos → [lon, lat] */
  polys: number[][][][]
}

export interface Zona {
  id: string
  base: number
  slope_per_decade: number
  p_value: number
  q_value: number | null
  ci_low: number
  ci_high: number
  n_years: number
  lag1: number
  status: Estado
}

export const DEPARTAMENTOS = geo as Departamento[]

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

// [base anual, pendiente por década, p_value, lag1]
type Fila = [number, number, number, number]
const LLUVIA: Record<string, Fila> = {
  '01': [1500, -12, 0.09, 0.21],
  '02': [700, -10, 0.12, 0.18],
  '03': [700, -13, 0.06, 0.2],
  '04': [150, -6, 0.18, 0.15],
  '05': [650, -15, 0.02, 0.22],
  '06': [900, 6, 0.41, 0.12],
  '07': [15, 1, 0.8, 0.1],
  '08': [800, -19, 0.008, 0.24],
  '09': [750, -11, 0.08, 0.19],
  '10': [1100, -7, 0.38, 0.14],
  '11': [20, 1, 0.7, 0.11],
  '12': [800, -14, 0.03, 0.23],
  '13': [250, 9, 0.22, 0.31],
  '14': [120, 21, 0.012, 0.36],
  '15': [120, 2, 0.61, 0.12],
  '16': [2800, -31, 0.006, 0.27],
  '17': [2200, -28, 0.003, 0.26],
  '18': [80, -3, 0.45, 0.1],
  '19': [900, -8, 0.29, 0.16],
  '20': [300, 45, 0.0004, 0.38],
  '21': [700, -22, 0.001, 0.29],
  '22': [1500, -18, 0.015, 0.25],
  '23': [60, -4, 0.52, 0.09],
  '24': [600, 38, 0.002, 0.37],
  '25': [1900, -26, 0.004, 0.26],
}
const NDVI: Record<string, Fila> = {
  '01': [0.82, -0.004, 0.3, 0.2],
  '02': [0.38, 0.006, 0.25, 0.2],
  '03': [0.42, 0.004, 0.4, 0.2],
  '04': [0.16, 0.008, 0.14, 0.2],
  '05': [0.4, 0.003, 0.5, 0.2],
  '06': [0.55, 0.005, 0.31, 0.2],
  '07': [0.08, -0.01, 0.3, 0.2],
  '08': [0.52, 0.002, 0.6, 0.2],
  '09': [0.4, 0.004, 0.45, 0.2],
  '10': [0.66, -0.006, 0.2, 0.2],
  '11': [0.14, 0.04, 0.002, 0.3],
  '12': [0.58, -0.005, 0.33, 0.2],
  '13': [0.24, 0.06, 0.0006, 0.3],
  '14': [0.22, 0.05, 0.001, 0.3],
  '15': [0.2, -0.03, 0.004, 0.3],
  '16': [0.85, -0.008, 0.09, 0.2],
  '17': [0.84, -0.02, 0.01, 0.3],
  '18': [0.12, 0.002, 0.7, 0.2],
  '19': [0.48, 0.001, 0.8, 0.2],
  '20': [0.26, 0.03, 0.006, 0.3],
  '21': [0.36, -0.006, 0.15, 0.2],
  '22': [0.78, -0.012, 0.03, 0.2],
  '23': [0.1, 0.003, 0.6, 0.2],
  '24': [0.4, 0.01, 0.2, 0.2],
  '25': [0.83, -0.015, 0.02, 0.2],
}
const LLUVIA_SIN_NINO: Record<string, [number, number]> = {
  '20': [11, 0.31],
  '24': [10, 0.29],
  '14': [5, 0.44],
  '21': [-19, 0.002],
}
const LLUVIA_NINO: Record<string, number> = { '20': 300, '24': 420, '14': 150, '21': -130 }
const POCOS: Record<Variable, Record<string, number>> = {
  lluvia: { '07': 9, '18': 8 },
  ndvi: { '07': 8 },
}
export const ANIOS_NINO = [2016, 2017, 2023]
export const ANIO_INICIO = 2000
/** Zonas probadas en la corrección de Benjamini-Hochberg (las que tienen 10 años o más). */
export function zonasProbadas(zonas: Record<string, Zona>) {
  return Object.values(zonas).filter((z) => z.n_years >= 10).length
}
export type Region = 'costa' | 'sierra' | 'selva'
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
export const ANIO_FIN = 2025

function ruido(id: string, y: number) {
  const s = Math.sin(parseInt(id, 10) * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s) - 0.5
}

/** Estadística por zona con Benjamini-Hochberg, igual que el prototipo. */
export function calcularZonas(variable: Variable, sinNino = false): Record<string, Zona> {
  const fuente = variable === 'ndvi' ? NDVI : LLUVIA
  const filas = Object.keys(NOMBRE).map((id) => {
    let [base, slope, p, lag1] = fuente[id]
    if (variable === 'lluvia' && sinNino && LLUVIA_SIN_NINO[id]) [slope, p] = LLUVIA_SIN_NINO[id]
    return { id, base, slope, p, lag1, n: POCOS[variable][id] ?? 26, q: null as number | null }
  })
  const probadas = filas.filter((r) => r.n >= 10).sort((a, b) => a.p - b.p)
  let corrida = 1
  for (let i = probadas.length - 1; i >= 0; i--) {
    corrida = Math.min(corrida, (probadas[i].p * probadas.length) / (i + 1))
    probadas[i].q = Math.min(1, corrida)
  }
  const out: Record<string, Zona> = {}
  for (const r of filas) {
    const status: Estado =
      r.n < 10 ? 'pocos_datos' : (r.q ?? 1) < 0.05 ? 'real' : 'posible_casualidad'
    const margen =
      status === 'real'
        ? Math.abs(r.slope) * 0.38
        : Math.abs(r.slope) + (variable === 'ndvi' ? 0.012 : Math.max(3, r.base * 0.01))
    out[r.id] = {
      id: r.id,
      base: r.base,
      slope_per_decade: r.slope,
      p_value: r.p,
      q_value: r.q,
      ci_low: r.slope - margen,
      ci_high: r.slope + margen,
      n_years: r.n,
      lag1: r.lag1,
      status,
    }
  }
  return out
}

/** Serie anual de ejemplo de una zona. */
export function serie(id: string, variable: Variable, sinNino = false): { y: number; v: number }[] {
  const pts: { y: number; v: number }[] = []
  for (let y = ANIO_INICIO; y <= ANIO_FIN; y++) {
    if (sinNino && variable === 'lluvia' && ANIOS_NINO.includes(y)) continue
    let v: number
    if (variable === 'ndvi') {
      const [base, slope] = NDVI[id]
      v = base + (slope / 10) * (y - 2012.5) + 0.035 * ruido(id, y)
    } else {
      const [base, slope] = LLUVIA[id]
      const sinNino = LLUVIA_SIN_NINO[id] ? LLUVIA_SIN_NINO[id][0] : slope
      v = base + (sinNino / 10) * (y - 2012.5) + base * 0.16 * ruido(id, y)
      if (LLUVIA_NINO[id] && ANIOS_NINO.includes(y))
        v += LLUVIA_NINO[id] * (y === 2017 ? 1.25 : y === 2023 ? 1 : 0.6)
    }
    pts.push({ y, v: Math.max(0, v) })
  }
  return pts
}

/** Anomalía nacional de cada año (promedio de las zonas con datos), para las franjas. */
export function anomaliasPeru(variable: Variable) {
  const ids = Object.keys(NOMBRE).filter((id) => !POCOS[variable][id])
  const porZona = ids.map((id) => {
    const pts = serie(id, variable)
    const media = pts.reduce((a, p) => a + p.v, 0) / pts.length || 1
    return Object.fromEntries(pts.map((p) => [p.y, (p.v - media) / media]))
  })
  const filas: { y: number; a: number }[] = []
  for (let y = ANIO_INICIO; y <= ANIO_FIN; y++)
    filas.push({ y, a: porZona.reduce((s, z) => s + z[y], 0) / porZona.length })
  return { filas, max: Math.max(...filas.map((f) => Math.abs(f.a))) || 1 }
}
