/**
 * Suelo del mapa 2D: el mismo mar, relieve, ríos y fronteras reales que el 3D (src/mapa/escena.ts),
 * pintados una sola vez en un lienzo con los colores del tema. Sin animación: es una imagen fija
 * que va debajo de los departamentos del SVG.
 * Texturas: public/mapa/mundo*.png (scripts/generar_mundo.py; SRTM/ETOPO1 y Natural Earth).
 */
import { cssVar, esTemaClaro, hexMix } from '@/lib/color'

/** Caja de public/mapa/mundo*.png (la misma que MUNDO en escena.ts). */
const MUNDO = { lon0: -110, lon1: -30, lat0: -60, lat1: 25 }
const TEX = 1024

/** Zona del suelo que pinta el 2D: el Perú con margen, para cubrir pantallas anchas o altas. */
export const CAJA_SUELO = { lon0: -97, lon1: -53, lat0: -34, lat1: 12 }
/** Píxeles del lienzo por píxel de la textura (suaviza la costa al agrandar). */
const ESCALA = 2

function cargar(src: string) {
  return new Promise<HTMLImageElement>((ok, mal) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => ok(img)
    img.onerror = mal
    img.src = src
  })
}

const rgb = (h: string) => {
  const s = h.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number]
}
const liso = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Colores del suelo: mismas mezclas que los uniforms del shader del 3D. */
function paleta() {
  const claro = esTemaClaro()
  const fondo = cssVar('--bg')
  const mar = cssVar('--sea')
  const fg = cssVar('--fg')
  const suave = cssVar('--accent-soft')
  return {
    hondo: rgb(hexMix(mar, claro ? fg : '#000000', claro ? 0.18 : 0.4)),
    somero: rgb(hexMix(mar, claro ? '#ffffff' : suave, claro ? 0.35 : 0.2)),
    espuma: rgb(hexMix(mar, claro ? '#ffffff' : fg, claro ? 0.8 : 0.35)),
    sombra: hexMix(mar, '#000000', claro ? 0.35 : 0.6),
    baja: rgb(hexMix(fondo, fg, claro ? 0.3 : 0.08)),
    alta: rgb(hexMix(fondo, claro ? '#ffffff' : fg, claro ? 0.6 : 0.32)),
    agua: rgb(hexMix(mar, claro ? fg : suave, claro ? 0.25 : 0.35)),
    frontera: rgb(hexMix(fondo, fg, claro ? 0.55 : 0.45)),
  }
}

/**
 * Pesos por píxel (no dependen del tema; se calculan una sola vez): profundidad del mar, aguas
 * someras, espuma, altura, ríos, fronteras y tierra, en 0–255. Con ellos, cambiar de tema es solo
 * mezclar colores.
 */
const N_PESOS = 7
let pesos: Promise<{ W: number; H: number; p: Uint8Array }> | null = null
function leerPesos() {
  pesos ??= (async () => {
    const base = import.meta.env.BASE_URL
    const [m1, m2] = await Promise.all([
      cargar(`${base}mapa/mundo.png`),
      cargar(`${base}mapa/mundo2.png`),
    ])
    const C = CAJA_SUELO
    const sx = ((C.lon0 - MUNDO.lon0) / (MUNDO.lon1 - MUNDO.lon0)) * TEX
    const sy = ((MUNDO.lat1 - C.lat1) / (MUNDO.lat1 - MUNDO.lat0)) * TEX
    const sw = ((C.lon1 - C.lon0) / (MUNDO.lon1 - MUNDO.lon0)) * TEX
    const sh = ((C.lat1 - C.lat0) / (MUNDO.lat1 - MUNDO.lat0)) * TEX
    const W = Math.round(sw * ESCALA)
    const H = Math.round(sh * ESCALA)
    const leer = (img: HTMLImageElement) => {
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      const x = c.getContext('2d', { willReadFrequently: true })!
      x.imageSmoothingEnabled = true
      x.imageSmoothingQuality = 'high'
      x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
      return x.getImageData(0, 0, W, H).data
    }
    const t1 = leer(m1)
    const t2 = leer(m2)
    const p = new Uint8Array(W * H * N_PESOS)
    // Mismas cuentas que el shader del suelo en escena.ts (sin el oleaje: el 2D es fijo)
    for (let i = 0, j = 0; i < W * H * 4; i += 4, j += N_PESOS) {
      const r = t1[i] / 255
      const cerca = t1[i + 1] / 255
      p[j] = liso(0.05, 0.95, r) * 255 // profundidad
      p[j + 1] = liso(0.05, 0.6, t1[i + 2] / 255) * 0.55 * 255 // aguas someras junto a la costa
      p[j + 2] = liso(0.1, 0.36, cerca) * (1 - liso(0.4, 0.47, cerca)) * 0.5 * 255 // espuma
      p[j + 3] = (0.35 + 0.65 * liso(0.45, 0.9, r)) * 255 // relieve
      p[j + 4] = t2[i + 1] * 0.55 // ríos y lagos
      p[j + 5] = t2[i + 2] * 0.45 // fronteras
      p[j + 6] = liso(0.44, 0.56, cerca) * 255 // tierra
    }
    return { W, H, p }
  })()
  pesos.catch(() => (pesos = null)) // si falla la carga, se reintenta la próxima vez
  return pesos
}

/**
 * Pinta el suelo con los colores del tema actual en `lienzo` (va detrás del SVG; sin codificar
 * imágenes, así el cambio de tema es inmediato).
 * `siluetaPeru` dibuja el Perú en coordenadas del lienzo, para su sombra suave.
 */
export async function pintarSuelo2D(
  lienzo: HTMLCanvasElement,
  siluetaPeru: (
    ctx: CanvasRenderingContext2D,
    aPx: (lon: number, lat: number) => [number, number],
  ) => void,
): Promise<void> {
  const { W, H, p } = await leerPesos()
  const C = CAJA_SUELO
  const P = paleta()
  lienzo.width = W
  lienzo.height = H
  const ctx = lienzo.getContext('2d')!
  const salida = ctx.createImageData(W, H)
  const o = salida.data
  const n = W * H
  const k255 = 1 / 255
  for (let k = 0; k < 3; k++) {
    const so = P.somero[k]
    const ho = P.hondo[k]
    const es = P.espuma[k]
    const ba = P.baja[k]
    const al = P.alta[k]
    const ag = P.agua[k]
    const fr = P.frontera[k]
    for (let q = 0, j = 0, i = k; q < n; q++, j += N_PESOS, i += 4) {
      let mar = so + (ho - so) * p[j] * k255
      mar += (so - mar) * p[j + 1] * k255
      mar += (es - mar) * p[j + 2] * k255
      let suelo = ba + (al - ba) * p[j + 3] * k255
      suelo += (ag - suelo) * p[j + 4] * k255
      suelo += (fr - suelo) * p[j + 5] * k255
      o[i] = mar + (suelo - mar) * p[j + 6] * k255
    }
  }
  for (let i = 3; i < n * 4; i += 4) o[i] = 255
  ctx.putImageData(salida, 0, 0)

  // Sombra suave del Perú (sol del noroeste), como en el 3D: los departamentos "se apoyan" en el suelo
  const aPx = (lon: number, lat: number): [number, number] => [
    ((lon - C.lon0) / (C.lon1 - C.lon0)) * W,
    ((C.lat1 - lat) / (C.lat1 - C.lat0)) * H,
  ]
  ctx.save()
  ctx.filter = `blur(${Math.round(W / 140)}px)`
  ctx.globalAlpha = esTemaClaro() ? 0.3 : 0.5
  ctx.fillStyle = P.sombra
  ctx.translate(W / 260, W / 260)
  ctx.beginPath()
  siluetaPeru(ctx, aPx)
  ctx.fill('evenodd')
  ctx.restore()
}
