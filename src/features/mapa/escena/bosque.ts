/**
 * Bosque del modo Vegetación: plantas propias de cada zona del Perú, plantadas con el NDVI real de
 * cada celda (MODIS, 0,25°) y la altitud real del suelo (SRTM, la misma textura del relieve).
 *
 * Qué crece dónde (simplificado, para leer el mapa de un vistazo):
 * - Costa: cactus sueltos en el desierto, algarrobos (norte) y huarangos (sur) donde hay algo de
 *   verde, y parcelas de cultivo en los valles regados (Chavimochic, Ica, Olmos).
 * - Vertiente y valles andinos (1500–3300 m): molles, cactus en las laderas secas y árboles de yunga.
 * - Puna (sobre 3300 m): ichu, bosquecitos de queñua y unas pocas puyas de Raimondi.
 * - Selva baja: árboles altos de copa ancha, algunos gigantes emergentes y palmeras de aguaje.
 *
 * Costo: una malla instanciada por especie (10 draw calls, low-poly, color por vértice). Todo se
 * mueve en la GPU: crecer al entrar al modo (una ola de norte a sur), el viento y la altura de su
 * departamento (uTope). El CPU solo sube 25 alturas y 2 números por cuadro.
 */
import * as THREE from 'three'
import { DEPARTAMENTOS } from '@/data/datos'
import type { Calor } from '@/features/mapa/utils/calor'
import { construir, type Pieza } from '@/features/mapa/escena/fauna'

export type Especie =
  | 'selva'
  | 'palmera'
  | 'yunga'
  | 'molle'
  | 'algarrobo'
  | 'huarango'
  | 'cactus'
  | 'cultivo'
  | 'ichu'
  | 'quenua'
  | 'puya'

/**
 * Divisoria de los Andes (lon según lat, aprox.): al oeste, costa y vertiente del Pacífico; al
 * este, selva. Solo decide qué crece en tierras bajas (bajo 1500 m) con poco verde.
 */
const DIVISORIA: [number, number][] = [
  [-3, -80.0],
  [-6, -79.3],
  [-10, -77.3],
  [-13, -75.5],
  [-15, -73.5],
  [-18, -70.5],
]
function divisoria(lat: number) {
  for (let i = 1; i < DIVISORIA.length; i++) {
    const [la0, lo0] = DIVISORIA[i - 1]
    const [la1, lo1] = DIVISORIA[i]
    if (lat >= la1 || i === DIVISORIA.length - 1) {
      const t = Math.min(1, Math.max(0, (lat - la0) / (la1 - la0)))
      return lo0 + (lo1 - lo0) * t
    }
  }
  return DIVISORIA[0][1]
}

/** Puyas de Raimondi en sus rodales conocidos (aprox.): Pachacoto (Áncash), Titankayocc (Ayacucho), Lampa (Puno). */
const PUYAS: [number, number][] = [
  [-77.4, -9.86],
  [-74.0, -13.75],
  [-70.37, -15.36],
]

/**
 * Qué planta crece en un punto, con su NDVI medio y su altitud (m; NaN si no se sabe).
 * null = nada (suelo desnudo). Función pura: la prueba bosque.test.ts fija los casos clave.
 */
export function especieDe(lon: number, lat: number, ndvi: number, elev: number): Especie | null {
  const alto = Number.isFinite(elev) ? elev : ndvi > 0.6 ? 300 : 2000
  if (alto >= 3300) {
    if (ndvi >= 0.5) return 'quenua'
    return ndvi >= 0.15 ? 'ichu' : null
  }
  if (alto >= 1500) {
    if (ndvi >= 0.6) return 'yunga'
    if (ndvi >= 0.25) return 'molle'
    return ndvi >= 0.08 ? 'cactus' : null
  }
  const oeste = lon < divisoria(lat)
  if (!oeste || ndvi >= 0.65) {
    if (ndvi >= 0.65) return 'selva'
    return ndvi >= 0.3 ? 'yunga' : null
  }
  // Costa
  if (ndvi >= 0.3) return lat < -5.5 ? 'cultivo' : 'algarrobo' // valles regados / bosque seco de Tumbes y Piura
  if (ndvi >= 0.12) return lat > -10 ? 'algarrobo' : 'huarango'
  return ndvi >= 0.05 ? 'cactus' : null
}

/** Cuántas plantas por celda (antes de recortar en celular). */
const POR_CELDA: Record<Especie, number> = {
  selva: 2.2,
  palmera: 0,
  yunga: 1.6,
  molle: 1.2,
  algarrobo: 1.3,
  huarango: 1,
  cactus: 0.35,
  cultivo: 1,
  ichu: 1.6,
  quenua: 1.2,
  puya: 0,
}

/** [tamaño en unidades de la escena, cuánto lo mueve el viento (0..1)] */
const TAMANO: Record<Especie, [number, number]> = {
  selva: [0.62, 0.6],
  palmera: [0.62, 1],
  yunga: [0.46, 0.6],
  molle: [0.42, 0.8],
  algarrobo: [0.42, 0.45],
  huarango: [0.4, 0.45],
  cactus: [0.34, 0],
  cultivo: [0.42, 0],
  ichu: [0.2, 1],
  quenua: [0.34, 0.4],
  puya: [0.75, 0.15],
}

const MEDIO = Math.PI / 2
const hojas = (n: number, hex: string, y: number, largo: number, caida: number): Pieza[] =>
  Array.from({ length: n }, (_, i): Pieza => {
    const a = (i / n) * Math.PI * 2
    return ['B', hex, [Math.cos(a) * largo * 0.5, y, -Math.sin(a) * largo * 0.5], [largo, 0.025, 0.09], [0, a, -caida]]
  })

// Diseños low-poly: la base en y = 0, alto ≈ 1 (la instancia los escala con TAMANO)
const DISENOS: Record<Especie, () => Pieza[]> = {
  selva: () => [
    ['Y', '#5b4630', [0, 0.32, 0], [0.09, 0.64, 0.09]],
    ['S', '#2c6a2e', [0, 0.74, 0], [0.7, 0.42, 0.7]],
    ['S', '#3f8a3a', [0.14, 0.95, 0.06], [0.46, 0.3, 0.46]],
    ['S', '#245a28', [-0.18, 0.66, -0.12], [0.42, 0.28, 0.42]],
  ],
  palmera: () => [
    ['Y', '#7a6248', [0, 0.45, 0], [0.055, 0.9, 0.055]],
    ['S', '#5b4a32', [0, 0.9, 0], [0.12, 0.1, 0.12]],
    ...hojas(7, '#4f9a3c', 0.92, 0.5, 0.45),
  ],
  yunga: () => [
    ['Y', '#5e4a33', [0, 0.3, 0], [0.08, 0.6, 0.08]],
    ['S', '#3d7d3a', [0, 0.72, 0], [0.62, 0.5, 0.62]],
    ['S', '#4e9343', [0.1, 0.9, -0.08], [0.36, 0.3, 0.36]],
  ],
  molle: () => [
    ['Y', '#6b5236', [0, 0.25, 0], [0.08, 0.5, 0.08], [0, 0, 0.12]],
    ['S', '#7fa650', [0, 0.62, 0], [0.78, 0.38, 0.78]],
    ['S', '#93b85e', [0.26, 0.48, 0.05], [0.34, 0.34, 0.34]],
    ['S', '#6d9445', [-0.24, 0.5, -0.1], [0.34, 0.32, 0.34]],
  ],
  algarrobo: () => [
    ['Y', '#5e4632', [0.04, 0.2, 0], [0.1, 0.42, 0.1], [0, 0, 0.3]],
    ['Y', '#5e4632', [-0.1, 0.36, 0], [0.06, 0.3, 0.06], [0, 0, -0.7]],
    ['S', '#6f8f3e', [0.05, 0.46, 0], [1.0, 0.24, 0.85]],
    ['S', '#5d7c34', [-0.2, 0.52, 0.12], [0.5, 0.18, 0.5]],
  ],
  huarango: () => [
    ['Y', '#4f3a2a', [0, 0.18, 0], [0.12, 0.38, 0.12], [0, 0, -0.25]],
    ['S', '#7c9145', [0, 0.44, 0], [0.95, 0.26, 0.9]],
    ['S', '#8aa052', [0.22, 0.5, -0.1], [0.42, 0.2, 0.42]],
  ],
  cactus: () => [
    ['Y', '#5f8a4a', [0, 0.42, 0], [0.13, 0.84, 0.13]],
    ['S', '#6f9a58', [0, 0.84, 0], [0.13, 0.1, 0.13]],
    ['Y', '#5f8a4a', [0.15, 0.36, 0], [0.18, 0.07, 0.07], [0, 0, MEDIO]],
    ['Y', '#5f8a4a', [0.23, 0.52, 0], [0.09, 0.34, 0.09]],
    ['Y', '#5f8a4a', [-0.14, 0.5, 0], [0.16, 0.07, 0.07], [0, 0, MEDIO]],
    ['Y', '#5f8a4a', [-0.21, 0.62, 0], [0.08, 0.26, 0.08]],
  ],
  cultivo: () => [
    // Parcelas de distinto verde (como se ven desde el aire los valles regados), con surcos
    ['B', '#5fa83c', [-0.25, 0.03, -0.18], [0.46, 0.06, 0.34]],
    ['B', '#9cc753', [0.25, 0.03, -0.18], [0.46, 0.06, 0.34]],
    ['B', '#c9c25a', [-0.25, 0.03, 0.18], [0.46, 0.06, 0.34]],
    ['B', '#3f8f35', [0.25, 0.03, 0.18], [0.46, 0.06, 0.34]],
    ...[-0.32, -0.18].map((x): Pieza => ['B', '#2f6f2a', [x, 0.07, -0.18], [0.05, 0.03, 0.3]]),
    ...[0.18, 0.32].map((x): Pieza => ['B', '#2c6a26', [x, 0.07, 0.18], [0.05, 0.03, 0.3]]),
  ],
  ichu: () => [
    ['C', '#cdb05e', [0, 0.32, 0], [0.22, 0.64, 0.22]],
    ['C', '#dcc070', [0.16, 0.26, 0.06], [0.17, 0.5, 0.17]],
    ['C', '#b8964a', [-0.14, 0.24, -0.08], [0.16, 0.46, 0.16]],
    ['C', '#c8a957', [0.02, 0.22, 0.17], [0.15, 0.42, 0.15]],
  ],
  quenua: () => [
    ['Y', '#9a4b2e', [0, 0.24, 0], [0.1, 0.5, 0.1], [0, 0, 0.35]],
    ['Y', '#9a4b2e', [0.12, 0.42, 0], [0.06, 0.3, 0.06], [0, 0, -0.5]],
    ['S', '#4d6b3a', [0.1, 0.6, 0], [0.5, 0.3, 0.5]],
    ['S', '#58773f', [-0.14, 0.52, 0.08], [0.34, 0.24, 0.34]],
  ],
  puya: () => [
    ['S', '#6f8a5a', [0, 0.14, 0], [0.48, 0.28, 0.48]],
    ['Y', '#4f5a3a', [0, 0.36, 0], [0.13, 0.36, 0.13]],
    ['C', '#d8d2a0', [0, 0.88, 0], [0.24, 0.84, 0.24]],
    ['C', '#e9e4bd', [0, 1.02, 0], [0.16, 0.5, 0.16]],
  ],
}

/** Generador pseudoaleatorio con semilla: el bosque sale igual en cada visita. */
export function azar(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Departamento (índice en DEPARTAMENTOS) que contiene un punto [lon, lat], o -1. Caja primero y
 * después par/impar sobre todos los anillos (los huecos se descuentan solos).
 */
export function crearLocalizador() {
  const deptos = DEPARTAMENTOS.map((z) => {
    const anillos = z.polys.flat()
    let o = Infinity
    let e = -Infinity
    let s = Infinity
    let n = -Infinity
    for (const r of anillos)
      for (const [x, y] of r) {
        o = Math.min(o, x)
        e = Math.max(e, x)
        s = Math.min(s, y)
        n = Math.max(n, y)
      }
    return { anillos, o, e, s, n }
  })
  return (lon: number, lat: number) => {
    for (let k = 0; k < deptos.length; k++) {
      const d = deptos[k]
      if (lon < d.o || lon > d.e || lat < d.s || lat > d.n) continue
      let dentro = false
      for (const r of d.anillos)
        for (let i = 0, j = r.length - 1; i < r.length; j = i++)
          if (
            r[i][1] > lat !== r[j][1] > lat &&
            lon < ((r[j][0] - r[i][0]) * (lat - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]
          )
            dentro = !dentro
      if (dentro) return k
    }
    return -1
  }
}

/** Centro [lon, lat] de la celda i de la malla. */
function centroCelda(c: Calor, i: number) {
  const p = c.pix[i]
  const x = p % c.w
  const y = (p - x) / c.w
  return [c.lonMin + (x + 0.5) * (c.spanLon / c.w), c.latMin + c.spanLat - (y + 0.5) * (c.spanLat / c.h)]
}

/**
 * NDVI medio de cada departamento: promedio de las celdas con centro dentro de él. Callao (y
 * cualquiera sin celda propia) toma la celda más cercana a su centro, como hace el backend.
 */
export function ndviPorDepto(c: Calor, deptoDe: (lon: number, lat: number) => number) {
  const suma = new Float64Array(DEPARTAMENTOS.length)
  const n = new Int32Array(DEPARTAMENTOS.length)
  for (let i = 0; i < c.pix.length; i++) {
    if (!Number.isFinite(c.media[i])) continue
    const [lon, lat] = centroCelda(c, i)
    const k = deptoDe(lon, lat)
    if (k < 0) continue
    suma[k] += c.media[i]
    n[k]++
  }
  const media = new Float32Array(DEPARTAMENTOS.length)
  DEPARTAMENTOS.forEach((z, k) => {
    if (n[k]) {
      media[k] = suma[k] / n[k]
      return
    }
    const anillo = z.polys[0][0]
    const lon0 = anillo.reduce((a, p) => a + p[0], 0) / anillo.length
    const lat0 = anillo.reduce((a, p) => a + p[1], 0) / anillo.length
    let mejor = NaN
    let dist = Infinity
    for (let i = 0; i < c.pix.length; i++) {
      if (!Number.isFinite(c.media[i])) continue
      const [lon, lat] = centroCelda(c, i)
      const d = (lon - lon0) ** 2 + (lat - lat0) ** 2
      if (d < dist) {
        dist = d
        mejor = c.media[i]
      }
    }
    media[k] = mejor
  })
  return { media, celdas: n }
}

const VS_DECL = `#include <common>
uniform float uTime, uCrece;
uniform float uTope[${DEPARTAMENTOS.length}];
attribute vec4 aPlanta; // departamento, retraso 0..1, fase, viento 0..1`

export class Bosque {
  private grupo = new THREE.Group()
  private mallas: THREE.InstancedMesh[] = []
  private material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 })
  private uniforms = {
    uTime: { value: 0 },
    uCrece: { value: 0 },
    uTope: { value: new Float32Array(DEPARTAMENTOS.length) },
  }
  /** 0 = sin plantas, 1 = bosque entero; avanza hacia `objetivo` en paso(). */
  private crece = 0
  private plantado: Calor | null = null

  constructor(escena: THREE.Scene) {
    const U = this.uniforms
    this.material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U)
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', VS_DECL)
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
  // Crece con un rebote suave (easeOutBack), en una ola de norte a sur
  float g = clamp((uCrece * 1.6 - aPlanta.y) / 0.6, 0.0, 1.0) - 1.0;
  transformed *= 1.0 + 2.70158 * g * g * g + 1.70158 * g * g;
  // Viento: dos ondas, dobla más la copa que el tronco
  float viento = sin(uTime * 1.3 + aPlanta.z) + 0.35 * sin(uTime * 2.9 + aPlanta.z * 1.7);
  transformed.xz += viento * 0.05 * aPlanta.w * transformed.y * transformed.y * vec2(1.0, 0.45);`,
        )
        .replace(
          '#include <project_vertex>',
          `vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
  mvPosition.y += uTope[int(aPlanta.x + 0.5)]; // sobre la cara de su departamento (sube y baja con el dato)
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;`,
        )
    }
    this.material.customProgramCacheKey = () => 'bosque'
    this.grupo.visible = false
    escena.add(this.grupo)
  }

  /**
   * Planta el bosque con la malla de vegetación (una vez por malla). elev(lon, lat) da la altitud
   * en metros (NaN si todavía no se sabe); deptoDe ubica cada planta en su departamento.
   */
  plantar(
    c: Calor,
    elev: (lon: number, lat: number) => number,
    deptoDe: (lon: number, lat: number) => number,
    aEscena: (lon: number, lat: number) => number[],
    pocas: boolean,
  ) {
    if (c === this.plantado) return
    this.plantado = c
    this.vaciar()
    const rnd = azar(2001)
    const dLon = c.spanLon / c.w
    const dLat = c.spanLat / c.h
    const latN = c.latMin + c.spanLat
    const porEspecie = new Map<Especie, number[]>()
    const poner = (e: Especie, lon: number, lat: number, escala = 1) => {
      const k = deptoDe(lon, lat)
      if (k < 0) return
      const [x, z] = aEscena(lon, lat)
      const retraso = 0.8 * ((latN - lat) / c.spanLat) + 0.2 * rnd()
      const lista = porEspecie.get(e) ?? []
      lista.push(x, z, rnd() * Math.PI * 2, TAMANO[e][0] * escala * (0.8 + 0.4 * rnd()), k, retraso, rnd() * 6.28)
      porEspecie.set(e, lista)
    }
    for (let i = 0; i < c.pix.length; i++) {
      const ndvi = c.media[i]
      if (!Number.isFinite(ndvi)) continue
      const [lon, lat] = centroCelda(c, i)
      const e = especieDe(lon, lat, ndvi, elev(lon, lat))
      if (!e) continue
      // Más verde, más plantas; en celular, la mitad
      let n = POR_CELDA[e] * (0.6 + 0.6 * Math.min(1, ndvi / 0.85))
      if (pocas) n *= 0.5
      const cuantas = Math.floor(n) + (rnd() < n % 1 ? 1 : 0)
      for (let j = 0; j < cuantas; j++) {
        const lo = lon + (rnd() - 0.5) * dLon * 0.9
        const la = lat + (rnd() - 0.5) * dLat * 0.9
        // En la selva baja, palmeras de aguaje entre los árboles y algún gigante emergente
        if (e === 'selva' && elev(lo, la) < 400 && rnd() < 0.22) poner('palmera', lo, la)
        else poner(e, lo, la, e === 'selva' && rnd() < 0.08 ? 1.45 : 1)
      }
    }
    for (const [lon, lat] of PUYAS)
      for (let j = 0; j < 3; j++) poner('puya', lon + (rnd() - 0.5) * 0.12, lat + (rnd() - 0.5) * 0.12)

    const d = new THREE.Object3D()
    for (const [e, v] of porEspecie) {
      const n = v.length / 7
      const geo = construir(DISENOS[e](), true)
      const aPlanta = new Float32Array(n * 4)
      const malla = new THREE.InstancedMesh(geo, this.material, n)
      for (let i = 0; i < n; i++) {
        const [x, z, giro, s, k, retraso, fase] = v.slice(i * 7, i * 7 + 7)
        d.position.set(x, 0, z)
        d.rotation.set(0, giro, 0)
        d.scale.setScalar(s)
        d.updateMatrix()
        malla.setMatrixAt(i, d.matrix)
        aPlanta.set([k, retraso, fase, TAMANO[e][1]], i * 4)
      }
      geo.setAttribute('aPlanta', new THREE.InstancedBufferAttribute(aPlanta, 4))
      malla.frustumCulled = false // la altura la pone el shader
      this.grupo.add(malla)
      this.mallas.push(malla)
    }
  }

  /**
   * Por cuadro: crece hacia `on` (1,8 s al entrar, 0,6 s al salir), el viento y la altura de cada
   * departamento. Devuelve true mientras crece o se va (para seguir dibujando a pleno ritmo).
   */
  paso(dt: number, on: boolean, topes: ArrayLike<number>, quieto: boolean) {
    const meta = on && this.mallas.length ? 1 : 0
    const antes = this.crece
    if (quieto) this.crece = meta
    else if (meta > this.crece) this.crece = Math.min(1, this.crece + dt / 1.8)
    else if (meta < this.crece) this.crece = Math.max(0, this.crece - dt / 0.6)
    this.grupo.visible = this.crece > 0
    if (!this.grupo.visible) return false
    const U = this.uniforms
    U.uCrece.value = this.crece
    if (!quieto) U.uTime.value += dt
    U.uTope.value.set(topes)
    return this.crece !== antes
  }

  private vaciar() {
    for (const m of this.mallas) {
      m.geometry.dispose()
      m.dispose()
      this.grupo.remove(m)
    }
    this.mallas = []
  }

  destruir() {
    this.vaciar()
    this.material.dispose()
    this.grupo.removeFromParent()
  }
}
