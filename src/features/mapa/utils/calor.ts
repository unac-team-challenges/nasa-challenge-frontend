/**
 * Mapa de calor de temperatura: la T2M de cada celda de NASA POWER (~0,5° × 0,625°) como una
 * imagen de 1 píxel por celda. El 3D la usa de textura y el 2D de <image>; los dos la estiran con
 * interpolación bilineal y la recortan con los polígonos de los departamentos.
 */
import type { Malla } from '@/api/consultas'
import { cssVar, hexMix } from '@/utils/color'

export interface Calor {
  /** Píxeles: una columna por longitud y una fila por latitud (fila 0 = norte). */
  w: number
  h: number
  /** Caja de los bordes de las celdas, en grados. */
  lonMin: number
  latMin: number
  spanLon: number
  spanLat: number
  anio0: number
  anios: number
  /** Celda i → índice de su píxel. */
  pix: Int32Array
  /** T2M de la celda i en el año anio0 + k: serie[i * anios + k] (NaN si falta). */
  serie: Float32Array
  /** Media de cada celda en todo el periodo. */
  media: Float32Array
  /** Escala fija de color (percentiles 2 y 98 de todos los años: un extremo no aplasta al resto).
   * La misma para la media y para cada año, así los años se comparan entre sí. */
  min: number
  max: number
  /** Unidad de los valores ('°C' o 'mm/año') y tokens de color de la rampa de la variable. */
  unidad: string
  paradas: string[]
}

/** Percentil p (0–1) de los valores finitos. */
export function percentil(xs: ArrayLike<number>, p: number): number {
  const v = Float32Array.from(xs).filter(Number.isFinite).sort()
  return v.length ? v[Math.min(v.length - 1, Math.floor(p * v.length))] : NaN
}

export function prepararCalor(m: Malla, paradas = PARADAS_CALOR): Calor {
  const { dlat, dlon, celdas } = m
  const anios = m.anio_fin - m.anio_inicio + 1
  let lonMin = Infinity
  let lonMax = -Infinity
  let latMin = Infinity
  let latMax = -Infinity
  for (const c of celdas) {
    lonMin = Math.min(lonMin, c.lon)
    lonMax = Math.max(lonMax, c.lon)
    latMin = Math.min(latMin, c.lat)
    latMax = Math.max(latMax, c.lat)
  }
  const w = Math.round((lonMax - lonMin) / dlon) + 1
  const h = Math.round((latMax - latMin) / dlat) + 1
  const n = celdas.length
  const pix = new Int32Array(n)
  const serie = new Float32Array(n * anios).fill(NaN)
  const media = new Float32Array(n)
  celdas.forEach((c, i) => {
    pix[i] = Math.round((latMax - c.lat) / dlat) * w + Math.round((c.lon - lonMin) / dlon)
    let suma = 0
    let k = 0
    c.t2m.forEach((t, j) => {
      if (t == null || j >= anios) return
      serie[i * anios + j] = t
      suma += t
      k++
    })
    media[i] = k ? suma / k : NaN
  })
  return {
    w,
    h,
    lonMin: lonMin - dlon / 2,
    latMin: latMin - dlat / 2,
    spanLon: w * dlon,
    spanLat: h * dlat,
    anio0: m.anio_inicio,
    anios,
    pix,
    serie,
    media,
    min: percentil(serie, 0.02),
    max: percentil(serie, 0.98),
    unidad: m.unidad,
    paradas,
  }
}

/** ¿Hay malla para ese año? (fuera de ella, el mapa vuelve a pintar por departamento) */
export function tieneAnio(c: Calor, anio: number | null | undefined): boolean {
  return anio == null || (anio >= c.anio0 && anio < c.anio0 + c.anios)
}

/** T2M de cada celda en un año (°C; NaN si ese año le falta). */
export function valoresAnio(c: Calor, anio: number): Float32Array {
  const j = anio - c.anio0
  return c.media.map((_, i) => c.serie[i * c.anios + j])
}

/**
 * Píxeles sin celda (borde de la costa, Callao, fuera de Perú) toman la media de sus vecinos con
 * dato, anillo a anillo hasta llenar todo. Sin huecos, ni la interpolación ni las paredes de las
 * columnas leen un píxel vacío (negro). El polígono recorta lo que sobra: nunca se muestra como dato.
 */
export function rellenarBordes(campo: Float32Array, w: number, h: number) {
  for (let quedan = true; quedan;) {
    quedan = false
    let cambio = false
    const antes = campo.slice()
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (Number.isFinite(antes[y * w + x])) continue
        let suma = 0
        let k = 0
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            const yy = y + dy
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
            const v = antes[yy * w + xx]
            if (Number.isFinite(v)) {
              suma += v
              k++
            }
          }
        if (k) {
          campo[y * w + x] = suma / k
          cambio = true
        } else quedan = true
      }
    if (!cambio) break // campo sin ningún dato
  }
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

/** 256 colores RGB entre paradas hex repartidas por igual. */
export function lutRampa(paradas: string[]): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 3)
  const tramos = paradas.length - 1
  for (let k = 0; k < 256; k++) {
    const t = (k / 255) * tramos
    const i = Math.min(tramos - 1, Math.floor(t))
    lut.set(rgb(hexMix(paradas[i], paradas[i + 1], t - i)), k * 3)
  }
  return lut
}

/**
 * Frío → calor, repartidas por igual entre min y max: azul (Andes, altiplano) → neutro → amarillo →
 * naranja → rojo (selva). Tokens --frio-* y --calor-*, los mismos de la leyenda.
 */
export const PARADAS_CALOR = [
  '--frio-2',
  '--frio-1',
  '--calor-0',
  '--calor-1',
  '--calor-2',
  '--calor-3',
  '--calor-4',
  '--calor-5',
]

/** Lluvia: seco ocre → verde oliva → turquesa → azul → azul profundo → violeta (más lluvia = más oscuro). */
export const PARADAS_LLUVIA = [
  '--lluvia-0',
  '--lluvia-1',
  '--lluvia-2',
  '--lluvia-3',
  '--lluvia-4',
  '--lluvia-5',
  '--lluvia-6',
]

/**
 * Pinta la malla en `cv` (1 px por celda): la media del periodo o la T2M de un año, siempre con la
 * misma rampa y escala (la de su variable). Los colores se leen del tema actual.
 */
export function dibujarCalor(cv: HTMLCanvasElement, c: Calor, anio: number | null) {
  const valores = anio == null ? c.media : valoresAnio(c, anio)
  const { min: lo, max: hi } = c
  const lut = lutRampa(c.paradas.map(cssVar))
  const campo = new Float32Array(c.w * c.h).fill(NaN)
  c.pix.forEach((p, i) => (campo[p] = valores[i]))
  rellenarBordes(campo, c.w, c.h)
  if (cv.width !== c.w) cv.width = c.w
  if (cv.height !== c.h) cv.height = c.h
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const img = ctx.createImageData(c.w, c.h)
  campo.forEach((v, p) => {
    if (!Number.isFinite(v)) return // transparente
    const k = Math.round(Math.min(1, Math.max(0, (v - lo) / (hi - lo || 1))) * 255) * 3
    img.data.set(lut.subarray(k, k + 3), p * 4)
    img.data[p * 4 + 3] = 255
  })
  ctx.putImageData(img, 0, 0)
}

/** Píxeles por celda de las variantes 3D: el punteado necesita más resolución que el dato. */
const ESCALA_3D = 24

/**
 * Variante opaca del calor para el 3D (sin transparencia, así las columnas no se ven cortadas):
 * 'real' = el calor tal cual; 'punteado' = velo leve y puntos del panel (posible casualidad);
 * 'apagado' = velo del panel (pocos datos). Mismo criterio que el 2D.
 */
export function varianteCalor(
  dest: HTMLCanvasElement,
  base: HTMLCanvasElement,
  tipo: 'real' | 'punteado' | 'apagado',
  panel: string,
) {
  const w = base.width * ESCALA_3D
  const h = base.height * ESCALA_3D
  if (dest.width !== w) dest.width = w
  if (dest.height !== h) dest.height = h
  const x = dest.getContext('2d')
  if (!x) return
  x.globalAlpha = 1
  x.imageSmoothingEnabled = true
  x.imageSmoothingQuality = 'high'
  x.drawImage(base, 0, 0, w, h)
  x.fillStyle = x.strokeStyle = panel
  if (tipo === 'apagado') {
    x.globalAlpha = 0.55
    x.fillRect(0, 0, w, h)
  } else if (tipo === 'punteado') {
    x.globalAlpha = 0.25 // el calor se lee algo lavado
    x.fillRect(0, 0, w, h)
    const paso = ESCALA_3D * 0.4
    const r = paso * 0.12
    x.globalAlpha = 0.4 // puntos finos y suaves: textura, no lunares
    x.beginPath()
    for (let f = 0, y = paso / 2; y < h; f++, y += paso)
      for (let px = ((f % 2) * paso) / 2 + paso / 4; px < w; px += paso) {
        x.moveTo(px + r, y)
        x.arc(px, y, r, 0, Math.PI * 2)
      }
    x.fill()
  }
  x.globalAlpha = 1
}
