/**
 * Fauna y gente del Perú en el mapa 3D: 17 personajes pequeños, cada uno en su región y su
 * departamento. Al pasar el puntero saltan y cuentan un dato; al tocarlos se elige su zona.
 *
 * Costo: una malla instanciada por especie (17 draw calls de pocos cientos de triángulos),
 * geometría hecha con primitivas fusionadas y color por vértice, sin archivos ni texturas.
 * Por cuadro solo se actualizan ~22 matrices.
 */
import * as THREE from 'three'
import { FAUNA_TEXTOS, type Idioma } from '@/i18n/textos'

type Prim = 'B' | 'S' | 'C' | 'Y'
/** [primitiva, color, posición, escala, rotación?] */
export type Pieza = [Prim, string, number[], number[], number[]?]
type Movimiento = 'walk' | 'fly' | 'swim' | 'glide' | 'jump' | 'perch' | 'dance'
interface Ficha {
  especie: string
  dept: string
  n: number
  kind: Movimiento
  speed?: number
  scale?: number
  r?: number
  h?: number
  w?: number
  flap?: boolean
  /** [lon, lat] en el mar */
  at?: number[]
  a?: number[]
  b?: number[]
}

const ESCALA = 0.8
const MEDIO = Math.PI / 2

/**
 * Une primitivas en una sola geometría con color por vértice. Cada primitiva conserva sus
 * normales: esferas, conos y cilindros se ven redondos (antes eran icosaedros facetados) y las
 * cajas mantienen sus caras planas. `bajo`: pocas caras (low-poly), para los miles de árboles del bosque.
 */
export function construir(piezas: Pieza[], bajo = false) {
  const P: Record<Prim, THREE.BufferGeometry> = {
    B: new THREE.BoxGeometry(1, 1, 1),
    S: new THREE.IcosahedronGeometry(0.5, bajo ? 0 : 2),
    C: new THREE.ConeGeometry(0.5, 1, bajo ? 6 : 12),
    Y: new THREE.CylinderGeometry(0.5, 0.5, 1, bajo ? 5 : 14),
  }
  const pos: number[] = []
  const nor: number[] = []
  const col: number[] = []
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const c = new THREE.Color()
  for (const [k, hex, p, s, r] of piezas) {
    const g = P[k].index ? P[k].toNonIndexed() : P[k].clone()
    const [rx = 0, ry = 0, rz = 0] = r ?? []
    m.compose(new THREE.Vector3(p[0], p[1], p[2]), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(s[0], s[1], s[2]))
    g.applyMatrix4(m) // también transforma y normaliza las normales
    c.set(hex)
    const a = g.attributes.position.array
    const n = g.attributes.normal.array
    for (let i = 0; i < a.length; i += 3) {
      pos.push(a[i], a[i + 1], a[i + 2])
      nor.push(n[i], n[i + 1], n[i + 2])
      col.push(c.r, c.g, c.b)
    }
    g.dispose()
  }
  Object.values(P).forEach((g) => g.dispose())
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return out
}
/** Dos ojos (o un par de piezas simétricas) a los lados del eje: adelante = +x. */
const ojos = (x: number, y: number, z: number, r = 0.035, hex = '#141414'): Pieza[] =>
  [-1, 1].map((s): Pieza => ['S', hex, [x, y, s * z], [r * 2, r * 2, r * 2]])
const patas = (hex: string, x: number, z: number, w: number, h: number): Pieza[] =>
  [-1, 1].flatMap((sx) => [-1, 1].map((sz): Pieza => ['B', hex, [sx * x, h / 2, sz * z], [w, h, w]]))

// Diseños: adelante = +x, los pies en y = 0 (las aves, con el centro en el origen)
const ESPECIES: Record<string, () => Pieza[]> = {
  alpaca: () => [['B', '#efe4d0', [0, 0.72, 0], [0.85, 0.48, 0.46]], ['B', '#efe4d0', [0.36, 1.12, 0], [0.2, 0.62, 0.2]], ['B', '#efe4d0', [0.46, 1.46, 0], [0.34, 0.22, 0.2]], ['B', '#d9cbb3', [0.64, 1.42, 0], [0.1, 0.12, 0.14]],
    ['C', '#efe4d0', [0.4, 1.66, 0.07], [0.07, 0.16, 0.07]], ['C', '#efe4d0', [0.4, 1.66, -0.07], [0.07, 0.16, 0.07]], ['S', '#e0245e', [0.4, 1.77, 0.08], [0.1, 0.1, 0.1]], ['S', '#f2a900', [0.4, 1.77, -0.08], [0.1, 0.1, 0.1]],
    ['S', '#efe4d0', [-0.46, 0.86, 0], [0.16, 0.16, 0.16]], ...patas('#d9cbb3', 0.3, 0.14, 0.11, 0.5),
    ...ojos(0.58, 1.5, 0.09)],
  vicuna: () => [['B', '#c8874a', [0, 0.86, 0], [0.8, 0.34, 0.32]], ['B', '#f3ece0', [0, 0.71, 0], [0.7, 0.08, 0.28]], ['B', '#f3ece0', [0.36, 0.86, 0], [0.12, 0.3, 0.3]],
    ['B', '#c8874a', [0.38, 1.24, 0], [0.12, 0.66, 0.12]], ['B', '#c8874a', [0.46, 1.6, 0], [0.26, 0.15, 0.14]], ['C', '#c8874a', [0.4, 1.74, 0.05], [0.05, 0.14, 0.05]], ['C', '#c8874a', [0.4, 1.74, -0.05], [0.05, 0.14, 0.05]],
    ...patas('#e8dcc6', 0.28, 0.11, 0.07, 0.7),
    ...ojos(0.56, 1.64, 0.065, 0.03)],
  condor: () => [['S', '#1b1b1b', [0, 0, 0], [0.9, 0.32, 0.32]], ['S', '#f4f4f4', [0.36, 0.06, 0], [0.2, 0.22, 0.28]], ['S', '#c96f5b', [0.52, 0.1, 0], [0.15, 0.12, 0.12]],
    ['B', '#1b1b1b', [0, 0.02, 0.78], [0.55, 0.04, 1.25]], ['B', '#1b1b1b', [0, 0.02, -0.78], [0.55, 0.04, 1.25]], ['B', '#e8e8e8', [-0.06, 0.045, 0.72], [0.18, 0.02, 1.05]], ['B', '#e8e8e8', [-0.06, 0.045, -0.72], [0.18, 0.02, 1.05]],
    ['B', '#1b1b1b', [-0.52, 0, 0], [0.32, 0.03, 0.28]],
    ...ojos(0.58, 0.15, 0.05, 0.025)],
  pastora: () => [['C', '#c0392b', [0, 0.36, 0], [0.56, 0.72, 0.56]], ['B', '#d6336c', [0, 0.84, 0], [0.3, 0.36, 0.24]], ['B', '#f2a900', [0, 0.88, 0], [0.32, 0.06, 0.26]],
    ['S', '#8d5a3b', [0, 1.14, 0], [0.22, 0.24, 0.22]], ['Y', '#1d1d1d', [0, 1.28, 0], [0.44, 0.04, 0.44]], ['Y', '#c0392b', [0, 1.32, 0], [0.22, 0.07, 0.22]],
    ['B', '#141414', [-0.1, 0.99, 0.08], [0.04, 0.26, 0.04]], ['B', '#141414', [-0.1, 0.99, -0.08], [0.04, 0.26, 0.04]], ['B', '#7a5a32', [0.18, 0.7, 0.14], [0.03, 1.2, 0.03]],
    ...ojos(0.1, 1.17, 0.045, 0.025), ['B', '#7a1f3d', [0, 0.97, 0], [0.34, 0.1, 0.3]], ['B', '#f2a900', [0, 0.97, 0], [0.35, 0.025, 0.31]]],
  caballito: () => [['C', '#c9b26b', [0.3, 0.12, 0], [0.3, 1.3, 0.3], [0, 0, -MEDIO + 0.22]], ['B', '#b89f58', [-0.4, 0.1, 0], [0.6, 0.16, 0.28]],
    ['B', '#f0f0f0', [-0.38, 0.44, 0], [0.18, 0.36, 0.18]], ['S', '#8d5a3b', [-0.38, 0.72, 0], [0.17, 0.17, 0.17]], ['Y', '#e7d9a8', [-0.38, 0.82, 0], [0.32, 0.03, 0.32]],
    ['B', '#6b4f2a', [-0.2, 0.46, 0.16], [0.04, 0.95, 0.04], [0.6, 0, 0]],
    ...ojos(-0.3, 0.74, 0.04, 0.022)],
  agricultor: () => [['B', '#3b4a63', [0, 0.25, 0.07], [0.1, 0.5, 0.1]], ['B', '#3b4a63', [0, 0.25, -0.07], [0.1, 0.5, 0.1]], ['B', '#f5f1e6', [0, 0.72, 0], [0.24, 0.42, 0.3]],
    ['S', '#a86b45', [0, 1.06, 0], [0.2, 0.22, 0.2]], ['Y', '#e2c97e', [0, 1.18, 0], [0.52, 0.04, 0.52]], ['Y', '#e2c97e', [0, 1.25, 0], [0.2, 0.12, 0.2]],
    ['B', '#7a5a32', [0.2, 0.6, 0.13], [0.04, 0.8, 0.04]], ['B', '#8a8f96', [0.25, 0.22, 0.13], [0.17, 0.1, 0.03]], ['S', '#6aa84f', [0.45, 0.12, -0.2], [0.22, 0.26, 0.22]], ['S', '#6aa84f', [0.2, 0.12, -0.35], [0.2, 0.22, 0.2]],
    ...ojos(0.1, 1.08, 0.045, 0.025), ['B', '#c0392b', [0, 0.92, 0], [0.26, 0.05, 0.32]]],
  pinguino: () => [['S', '#222831', [0, 0.35, 0], [0.32, 0.62, 0.3]], ['S', '#f5f5f5', [0.07, 0.33, 0], [0.22, 0.48, 0.24]], ['S', '#222831', [0.02, 0.72, 0], [0.22, 0.22, 0.2]],
    ['B', '#f5f5f5', [0.04, 0.67, 0], [0.2, 0.04, 0.23]], ['C', '#3a3a3a', [0.16, 0.72, 0], [0.05, 0.13, 0.05], [0, 0, -MEDIO]], ['S', '#e88f8f', [0.12, 0.75, 0], [0.06, 0.05, 0.18]],
    ...ojos(0.13, 0.78, 0.075, 0.025)],
  lobo: () => [['S', '#6b4a2f', [0, 0.25, 0], [1.0, 0.36, 0.36]], ['S', '#7d5a3c', [0.36, 0.42, 0], [0.34, 0.34, 0.36]], ['S', '#6b4a2f', [0.52, 0.52, 0], [0.26, 0.22, 0.22]], ['S', '#5a3d26', [0.66, 0.48, 0], [0.12, 0.1, 0.12]],
    ['B', '#4e3520', [0.15, 0.08, 0.2], [0.24, 0.03, 0.18]], ['B', '#4e3520', [0.15, 0.08, -0.2], [0.24, 0.03, 0.18]], ['B', '#4e3520', [-0.5, 0.12, 0], [0.18, 0.03, 0.32]],
    ...ojos(0.62, 0.57, 0.07, 0.028), ['B', '#3a2716', [0.71, 0.5, 0], [0.04, 0.04, 0.05]]],
  pelicano: () => [['S', '#d9dcdf', [0, 0, 0], [0.8, 0.3, 0.3]], ['S', '#f2f2f2', [0.42, 0.12, 0], [0.18, 0.18, 0.16]], ['B', '#e8b04b', [0.68, 0.06, 0], [0.45, 0.05, 0.07]], ['B', '#d07b4b', [0.62, 0, 0], [0.32, 0.05, 0.05]],
    ['B', '#6c737a', [0, 0.03, 0.62], [0.42, 0.03, 0.95]], ['B', '#6c737a', [0, 0.03, -0.62], [0.42, 0.03, 0.95]], ['B', '#2f3337', [-0.05, 0.035, 1.05], [0.3, 0.02, 0.2]], ['B', '#2f3337', [-0.05, 0.035, -1.05], [0.3, 0.02, 0.2]],
    ...ojos(0.5, 0.17, 0.065, 0.025)],
  delfin: () => [['S', '#f0a1b8', [0, 0, 0], [1.0, 0.32, 0.3]], ['C', '#f0a1b8', [0.62, -0.02, 0], [0.07, 0.34, 0.07], [0, 0, -MEDIO]], ['C', '#e98aa5', [0, 0.17, 0], [0.12, 0.12, 0.06]],
    ['B', '#e98aa5', [-0.56, 0, 0], [0.12, 0.03, 0.36]], ['B', '#e98aa5', [0.12, -0.12, 0.16], [0.18, 0.03, 0.1]], ['B', '#e98aa5', [0.12, -0.12, -0.16], [0.18, 0.03, 0.1]],
    ...ojos(0.44, 0.04, 0.13, 0.025)],
  guacamayo: () => [['S', '#d7262d', [0, 0, 0], [0.5, 0.22, 0.22]], ['S', '#d7262d', [0.26, 0.07, 0], [0.16, 0.15, 0.15]], ['S', '#f2efe6', [0.36, 0.04, 0], [0.07, 0.08, 0.07]],
    ['B', '#d7262d', [-0.5, -0.02, 0], [0.6, 0.03, 0.08]], ['B', '#f2c230', [0, 0.02, 0.3], [0.3, 0.03, 0.42]], ['B', '#f2c230', [0, 0.02, -0.3], [0.3, 0.03, 0.42]],
    ['B', '#1f5fbf', [-0.03, 0.03, 0.56], [0.26, 0.025, 0.2]], ['B', '#1f5fbf', [-0.03, 0.03, -0.56], [0.26, 0.025, 0.2]],
    ...ojos(0.32, 0.11, 0.065, 0.02)],
  jaguar: () => [['B', '#d9a441', [0, 0.45, 0], [0.9, 0.36, 0.34]], ['B', '#d9a441', [0.52, 0.55, 0], [0.26, 0.24, 0.26]], ['C', '#d9a441', [0.5, 0.72, 0.09], [0.06, 0.1, 0.06]], ['C', '#d9a441', [0.5, 0.72, -0.09], [0.06, 0.1, 0.06]],
    ['B', '#d9a441', [-0.62, 0.55, 0], [0.45, 0.06, 0.06], [0, 0, 0.45]], ...patas('#c99334', 0.32, 0.12, 0.12, 0.3),
    ...[-0.3, -0.1, 0.1, 0.3].flatMap((x, i): Pieza[] => [['B', '#3a2a14', [x, 0.635, (i % 2 ? 0.07 : -0.07)], [0.08, 0.02, 0.08]], ['B', '#3a2a14', [x + 0.08, 0.48, 0.175], [0.08, 0.08, 0.02]], ['B', '#3a2a14', [x - 0.05, 0.42, -0.175], [0.08, 0.08, 0.02]]]),
    ...ojos(0.66, 0.6, 0.08, 0.03, '#2f4a1a')],
  gallito: () => [['S', '#ff5a1f', [0, 0.3, 0], [0.36, 0.38, 0.3]], ['S', '#ff5a1f', [0.12, 0.6, 0], [0.24, 0.24, 0.22]], ['Y', '#ff6a2a', [0.14, 0.7, 0], [0.32, 0.05, 0.3], [MEDIO, 0, 0]],
    ['S', '#1b1b1b', [-0.06, 0.3, 0.15], [0.3, 0.2, 0.06]], ['S', '#1b1b1b', [-0.06, 0.3, -0.15], [0.3, 0.2, 0.06]], ['B', '#1b1b1b', [-0.24, 0.2, 0], [0.2, 0.05, 0.12]],
    ['B', '#e0a030', [0, 0.06, 0.06], [0.04, 0.12, 0.04]], ['B', '#e0a030', [0, 0.06, -0.06], [0.04, 0.12, 0.04]],
    ...ojos(0.23, 0.64, 0.08, 0.025)],
  mono: () => [['S', '#6e3b23', [0, 0.45, 0], [0.4, 0.5, 0.34]], ['S', '#6e3b23', [0.05, 0.85, 0], [0.28, 0.26, 0.26]], ['S', '#e8c99a', [0.17, 0.84, 0], [0.08, 0.12, 0.16]],
    ['B', '#6e3b23', [0.1, 0.45, 0.22], [0.1, 0.42, 0.1]], ['B', '#6e3b23', [0.1, 0.45, -0.22], [0.1, 0.42, 0.1]], ['B', '#6e3b23', [-0.3, 0.42, 0], [0.08, 0.6, 0.08], [0, 0, 0.6]],
    ['S', '#f2c230', [-0.5, 0.7, 0], [0.13, 0.17, 0.13]], ['B', '#5a2f1c', [0, 0.12, 0.1], [0.1, 0.24, 0.1]], ['B', '#5a2f1c', [0, 0.12, -0.1], [0.1, 0.24, 0.1]],
    ...ojos(0.2, 0.9, 0.06, 0.025)],
  oso: () => [['S', '#1d1d1d', [0, 0.55, 0], [0.9, 0.62, 0.55]], ['S', '#1d1d1d', [0.5, 0.82, 0], [0.36, 0.34, 0.34]], ['S', '#cfa874', [0.68, 0.76, 0], [0.14, 0.12, 0.14]],
    ['S', '#e8d6a8', [0.6, 0.9, 0.09], [0.06, 0.1, 0.1]], ['S', '#e8d6a8', [0.6, 0.9, -0.09], [0.06, 0.1, 0.1]], ['B', '#e8d6a8', [0.38, 0.6, 0], [0.06, 0.2, 0.3]],
    ['S', '#1d1d1d', [0.44, 1.0, 0.13], [0.1, 0.1, 0.06]], ['S', '#1d1d1d', [0.44, 1.0, -0.13], [0.1, 0.1, 0.06]], ...patas('#1d1d1d', 0.28, 0.17, 0.18, 0.34),
    ...ojos(0.66, 0.9, 0.09, 0.03)],
  cocodrilo: () => [['B', '#4a5a2a', [0, 0.14, 0], [1.1, 0.18, 0.3]], ['B', '#4a5a2a', [0.75, 0.12, 0], [0.5, 0.1, 0.18]], ['S', '#2f3a1a', [0.5, 0.25, 0.08], [0.07, 0.07, 0.07]], ['S', '#2f3a1a', [0.5, 0.25, -0.08], [0.07, 0.07, 0.07]],
    ['C', '#4a5a2a', [-0.85, 0.12, 0], [0.16, 0.8, 0.16], [0, 0, MEDIO]], ...[-0.3, 0, 0.3].map((x): Pieza => ['B', '#3a4720', [x, 0.25, 0], [0.06, 0.05, 0.2]]), ...patas('#3f4d24', 0.35, 0.2, 0.12, 0.1)],
  caballo: () => [['B', '#7a4a2a', [0, 0.85, 0], [0.95, 0.42, 0.36]], ['B', '#7a4a2a', [0.5, 1.15, 0], [0.2, 0.5, 0.22], [0, 0, -0.5]], ['B', '#7a4a2a', [0.74, 1.38, 0], [0.36, 0.18, 0.18], [0, 0, -0.3]],
    ['B', '#2a1a10', [0.43, 1.22, 0], [0.06, 0.5, 0.06], [0, 0, -0.5]], ['B', '#2a1a10', [-0.52, 0.8, 0], [0.08, 0.5, 0.08], [0, 0, 0.3]], ...patas('#5e381f', 0.35, 0.12, 0.1, 0.64),
    ['C', '#f2efe6', [0, 1.32, 0], [0.42, 0.42, 0.42]], ['B', '#c0392b', [0, 1.22, 0], [0.4, 0.04, 0.4]], ['S', '#a86b45', [0, 1.62, 0], [0.18, 0.2, 0.18]], ['Y', '#efe6cf', [0, 1.73, 0], [0.42, 0.03, 0.42]], ['Y', '#efe6cf', [0, 1.8, 0], [0.18, 0.12, 0.18]],
    ...ojos(0.85, 1.44, 0.075, 0.025), ...ojos(0.09, 1.64, 0.045, 0.022)],
  // Mujer shipibo-konibo: falda (chitonti) azul oscuro con el kené en franjas, blusa de colores y collares
  shipibo: () => [['Y', '#1c2440', [0, 0.32, 0], [0.42, 0.64, 0.42]],
    ...[0.12, 0.26, 0.4, 0.54].map((y, i): Pieza => ['Y', i % 2 ? '#f4efe2' : '#c9a227', [0, y, 0], [0.435, 0.025, 0.435]]),
    ['B', '#d6336c', [0, 0.82, 0], [0.3, 0.34, 0.26]], ['B', '#2d9cdb', [0, 0.97, 0], [0.32, 0.05, 0.28]],
    ['Y', '#f2c230', [0, 0.95, 0], [0.24, 0.03, 0.24]], ['Y', '#e0245e', [0, 0.92, 0], [0.27, 0.03, 0.27]],
    ['S', '#8d5a3b', [0, 1.14, 0], [0.21, 0.23, 0.21]], ['B', '#141414', [-0.06, 1.08, 0], [0.12, 0.32, 0.22]], ['S', '#141414', [-0.02, 1.2, 0], [0.2, 0.12, 0.22]],
    ...ojos(0.1, 1.16, 0.045, 0.022), ['B', '#8d5a3b', [0.04, 0.78, 0.17], [0.07, 0.3, 0.07]], ['B', '#8d5a3b', [0.04, 0.78, -0.17], [0.07, 0.3, 0.07]]],
  // Danzante de tijeras: montera con plumas, traje bordado con espejos, pantalón y tijeras de metal en la mano
  danzante: () => [['B', '#2e7d32', [0, 0.24, 0.08], [0.1, 0.48, 0.1]], ['B', '#2e7d32', [0, 0.24, -0.08], [0.1, 0.48, 0.1]],
    ['C', '#c62828', [0, 0.62, 0], [0.44, 0.34, 0.44]], ['B', '#c62828', [0, 0.82, 0], [0.26, 0.34, 0.3]],
    ...[0.66, 0.76, 0.86].map((y): Pieza => ['B', '#f2c230', [0.14, y, 0], [0.02, 0.03, 0.26]]), ['S', '#e0e6ea', [0.14, 0.9, 0.08], [0.05, 0.05, 0.02]],
    ['S', '#a86b45', [0, 1.1, 0], [0.2, 0.22, 0.2]], ['Y', '#1565c0', [0, 1.24, 0], [0.3, 0.12, 0.3]], ['C', '#f2c230', [0, 1.36, 0], [0.18, 0.18, 0.18]],
    ['B', '#e0245e', [-0.05, 1.44, 0.05], [0.03, 0.34, 0.03], [0.4, 0, 0]], ['B', '#2d9cdb', [-0.05, 1.44, -0.05], [0.03, 0.34, 0.03], [-0.4, 0, 0]], ['B', '#f4efe2', [-0.08, 1.46, 0], [0.03, 0.36, 0.03]],
    ['B', '#a86b45', [0.08, 0.86, 0.2], [0.07, 0.28, 0.07], [0.5, 0, 0]], ['B', '#b9c2c9', [0.14, 1.02, 0.28], [0.03, 0.22, 0.015], [0.5, 0, 0.3]], ['B', '#b9c2c9', [0.15, 1.02, 0.25], [0.03, 0.22, 0.015], [0.5, 0, -0.3]],
    ...ojos(0.1, 1.12, 0.045, 0.022)],
};

// Quién vive dónde. kind: walk (camina por su departamento), fly (vuela en círculos),
// swim (flota en el mar), glide (planea por la costa), jump (salta en el río), perch (saltitos).
// Los datos son generales y verificables; revisarlos antes de la demo.
const FAUNA: Ficha[] = [
  { especie: 'alpaca', dept: '21', n: 2, kind: 'walk', speed: 0.5 },
  { especie: 'vicuna', dept: '05', n: 1, kind: 'walk', speed: 0.8 },
  { especie: 'condor', dept: '04', n: 1, kind: 'fly', scale: 0.6, r: 2.6, h: 4.5, w: 0.35 },
  { especie: 'pastora', dept: '08', n: 1, kind: 'walk', speed: 0.4 },
  { especie: 'caballito', dept: '13', n: 1, kind: 'swim', at: [-79.35, -8.12] },
  { especie: 'agricultor', dept: '11', n: 1, kind: 'walk', speed: 0.35 },
  { especie: 'pinguino', dept: '11', n: 3, kind: 'swim', at: [-76.55, -13.85] },
  { especie: 'lobo', dept: '07', n: 2, kind: 'swim', at: [-77.35, -12.12] },
  { especie: 'pelicano', dept: '20', n: 2, kind: 'glide', scale: 0.6, a: [-81.7, -5.6], b: [-79.6, -10.2] },
  { especie: 'delfin', dept: '16', n: 1, kind: 'jump' },
  { especie: 'guacamayo', dept: '17', n: 2, kind: 'fly', scale: 0.75, r: 1.8, h: 2.8, w: 0.9, flap: true },
  { especie: 'jaguar', dept: '25', n: 1, kind: 'walk', speed: 0.7 },
  { especie: 'gallito', dept: '22', n: 1, kind: 'perch' },
  { especie: 'mono', dept: '01', n: 1, kind: 'perch' },
  { especie: 'oso', dept: '06', n: 1, kind: 'walk', speed: 0.35 },
  { especie: 'cocodrilo', dept: '24', n: 1, kind: 'walk', speed: 0.2 },
  { especie: 'caballo', dept: '15', n: 1, kind: 'walk', speed: 0.6 },
  { especie: 'shipibo', dept: '25', n: 1, kind: 'walk', speed: 0.3 },
  { especie: 'danzante', dept: '09', n: 1, kind: 'dance' },
]

interface Animal {
  f: Ficha
  malla: THREE.InstancedMesh
  i: number
  pos: THREE.Vector3
  objetivo: THREE.Vector3 | null
  inicio: THREE.Vector3 | null
  rumbo: number
  fase: number
  pausa: number
  salto: number
  ultimoP: number
  base?: THREE.Vector3
  A?: number[]
  B?: number[]
  y: number
  oculto: boolean
}

export interface ContextoFauna {
  escena: THREE.Scene
  /** Puntos al azar dentro de cada departamento (coordenadas de la escena). */
  muestras: (id: string) => [number, number][]
  centro: (id: string) => THREE.Vector3
  /** Altura de la cara superior del departamento (cambia con el dato). */
  tope: (id: string) => number
  aEscena: (lon: number, lat: number) => number[]
  nivelMar: number
}

/** Mancha redonda difuminada (64 px, una vez) para la sombra de contacto. */
function manchaSuave() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

const angulo = (de: number, a: number) => {
  let d = (a - de) % 6.2832
  if (d > 3.1416) d -= 6.2832
  if (d < -3.1416) d += 6.2832
  return d
}

export class Fauna {
  private animales: Animal[] = []
  private mallas: THREE.InstancedMesh[] = []
  private material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72 })
  /** Sombra de contacto bajo los que andan por el suelo: una malla instanciada, un draw call. */
  private sombras: THREE.InstancedMesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
  private conSombra: Animal[] = []
  private reloj = 0
  private d = new THREE.Object3D()
  private p = new THREE.Vector3()
  private cx: ContextoFauna

  constructor(cx: ContextoFauna) {
    this.cx = cx
    for (const f of FAUNA) {
      const malla = new THREE.InstancedMesh(construir(ESPECIES[f.especie]()), this.material, f.n)
      malla.frustumCulled = false
      malla.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      cx.escena.add(malla)
      this.mallas.push(malla)
      const S = cx.muestras(f.dept)
      for (let i = 0; i < f.n; i++) {
        const p0 = S.length ? S[(Math.random() * S.length) | 0] : [0, 0]
        const a: Animal = {
          f, malla, i, pos: new THREE.Vector3(p0[0], 0, p0[1]), objetivo: null, inicio: null,
          rumbo: Math.random() * 6.28, fase: Math.random() * 10, pausa: Math.random() * 2, salto: 0,
          ultimoP: 1, y: 0, oculto: false,
        }
        if (f.at) {
          const [x, z] = cx.aEscena(f.at[0], f.at[1])
          a.base = new THREE.Vector3(x + (i - (f.n - 1) / 2) * 0.7, cx.nivelMar, z + (i % 2) * 0.5)
        }
        if (f.a && f.b) {
          a.A = cx.aEscena(f.a[0], f.a[1])
          a.B = cx.aEscena(f.b[0], f.b[1])
        }
        this.animales.push(a)
        if (f.kind === 'walk' || f.kind === 'perch' || f.kind === 'dance') this.conSombra.push(a)
      }
    }
    this.sombras = new THREE.InstancedMesh(
      new THREE.CircleGeometry(0.5, 20).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: manchaSuave(),
        color: 0x000000,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
      this.conSombra.length,
    )
    this.sombras.frustumCulled = false
    this.sombras.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    cx.escena.add(this.sombras)
    this.paso(0)
  }

  /** Mueve a todos. dt = 0 los deja quietos pero sobre la altura actual de su zona. */
  paso(dt: number) {
    const T = (this.reloj += dt)
    const cx = this.cx
    for (const a of this.animales) {
      const f = a.f
      const tope = cx.tope(f.dept)
      let y = tope
      let alabeo = 0
      let cabeceo = 0
      let sx = 1
      let sz = 1
      let rumboDeseado = a.rumbo
      if (f.kind === 'walk') {
        if (a.pausa > 0) a.pausa -= dt
        else {
          if (!a.objetivo || a.pos.distanceTo(a.objetivo) < 0.08) {
            const S = cx.muestras(f.dept)
            const c = S[(Math.random() * S.length) | 0] ?? [a.pos.x, a.pos.z]
            a.objetivo = new THREE.Vector3(c[0], 0, c[1])
            const L = a.pos.distanceTo(a.objetivo)
            if (L > 5) a.objetivo.lerpVectors(a.pos, a.objetivo, 5 / L)
            a.pausa = Math.random() < 0.4 ? 1 + Math.random() * 2.5 : 0
          }
          const dx = a.objetivo.x - a.pos.x
          const dz = a.objetivo.z - a.pos.z
          const L = Math.hypot(dx, dz) || 1
          const st = Math.min(L, (f.speed ?? 0.5) * dt)
          a.pos.x += (dx / L) * st
          a.pos.z += (dz / L) * st
          rumboDeseado = Math.atan2(-dz, dx)
          if (st > 0) {
            y += Math.abs(Math.sin((T + a.fase) * 9)) * 0.05 // trote
            alabeo = Math.sin((T + a.fase) * 9) * 0.06 // se balancea al andar
            cabeceo = Math.cos((T + a.fase) * 18) * 0.03
          }
        }
        if (a.pausa > 0) sx = sz = 1 + Math.sin((T + a.fase) * 2.2) * 0.015 // respira en reposo
      } else if (f.kind === 'fly') {
        const c = cx.centro(f.dept)
        const ang = T * (f.w ?? 0.5) + a.fase + a.i * 3.1
        const r = f.r ?? 2
        a.pos.set(c.x + Math.cos(ang) * r, 0, c.z + Math.sin(ang) * r * 0.8)
        y = tope + (f.h ?? 3) + Math.sin(ang * 2) * 0.35 + a.i * 0.6
        a.rumbo = Math.atan2(-Math.cos(ang) * 0.8, -Math.sin(ang))
        alabeo = -0.35
        if (f.flap) sz = 0.65 + 0.35 * Math.abs(Math.sin((T + a.fase) * 12)) // aleteo
      } else if (f.kind === 'swim' && a.base) {
        const ang = T * 0.4 + a.fase
        a.pos.set(a.base.x + Math.cos(ang) * 0.35, 0, a.base.z + Math.sin(ang) * 0.25)
        y = cx.nivelMar + Math.sin(T * 2 + a.fase) * 0.04 - (f.especie === 'caballito' ? 0.02 : 0.18)
        rumboDeseado = Math.atan2(-Math.cos(ang) * 0.25, -Math.sin(ang) * 0.35)
        cabeceo = Math.sin(T * 1.7 + a.fase) * 0.06
      } else if (f.kind === 'glide' && a.A && a.B) {
        const s = (Math.sin(T * 0.12 + a.fase) + 1) / 2
        const dir = Math.cos(T * 0.12 + a.fase)
        const off = a.i * 0.9
        a.pos.set(a.A[0] + (a.B[0] - a.A[0]) * s + off, 0, a.A[1] + (a.B[1] - a.A[1]) * s + off * 0.5)
        y = cx.nivelMar + 1.6 + Math.sin(T * 1.3 + a.fase) * 0.15
        rumboDeseado = Math.atan2(-(a.B[1] - a.A[1]) * dir, (a.B[0] - a.A[0]) * dir)
      } else if (f.kind === 'jump') {
        const P = 3.4
        const p = ((T + a.fase) % P) / P
        if (!a.objetivo || p < a.ultimoP) {
          const S = cx.muestras(f.dept)
          const c = S[(Math.random() * S.length) | 0] ?? [a.pos.x, a.pos.z]
          const h = Math.random() * 6.28
          a.pos.set(c[0], 0, c[1])
          a.inicio = a.pos.clone()
          a.objetivo = new THREE.Vector3(c[0] + Math.cos(h) * 1.4, 0, c[1] - Math.sin(h) * 1.4)
          a.rumbo = h
        }
        a.ultimoP = p
        if (p < 0.4 && a.inicio) {
          const q = p / 0.4
          a.pos.lerpVectors(a.inicio, a.objetivo, q)
          y = tope - 0.2 + Math.sin(Math.PI * q) * 1.2
          cabeceo = Math.cos(Math.PI * q) * 0.9
        } else sx = sz = 0 // bajo el agua
      } else if (f.kind === 'dance') {
        // zapateo con saltos cortos y giros, como en la competencia (atipanakuy)
        const k = (T + a.fase) % 2.4
        y += Math.abs(Math.sin(k * Math.PI * 2.5)) * 0.18
        rumboDeseado = a.rumbo + dt * (k < 1.2 ? 2.2 : -2.2)
        alabeo = Math.sin(T * 7 + a.fase) * 0.12
      } else if (f.kind === 'perch') {
        const k = (T + a.fase) % 4
        if (k < 0.35) y += Math.sin((k / 0.35) * Math.PI) * 0.25 // saltito cada 4 s
        rumboDeseado = a.rumbo + Math.sin(T * 0.3 + a.fase) * 0.02
      }
      if (f.kind !== 'fly' && f.kind !== 'jump') a.rumbo += angulo(a.rumbo, rumboDeseado) * Math.min(1, dt * 4)
      if (a.salto > 0) {
        y += Math.sin(a.salto * Math.PI) * 0.5
        a.salto = Math.max(0, a.salto - dt * 1.8)
      }
      const e = ESCALA * (f.scale ?? 1)
      this.d.position.set(a.pos.x, y, a.pos.z)
      this.d.rotation.set(alabeo, a.rumbo, cabeceo, 'YXZ')
      this.d.scale.set(sx * e, sx === 0 ? 0 : e, sz * e)
      this.d.updateMatrix()
      a.malla.setMatrixAt(a.i, this.d.matrix)
      a.y = y
      a.oculto = sx === 0
    }
    for (const m of this.mallas) m.instanceMatrix.needsUpdate = true
    // Sombras: en la cara superior de su zona; se achican cuando el personaje salta
    this.conSombra.forEach((a, i) => {
      const tope = cx.tope(a.f.dept)
      const e = ESCALA * (a.f.scale ?? 1)
      const k = e * 1.1 * Math.max(0.45, 1 - (a.y - tope) * 0.9)
      this.d.position.set(a.pos.x, tope + 0.012, a.pos.z)
      this.d.rotation.set(0, a.rumbo, 0)
      this.d.scale.set(k * 1.25, 1, k * 0.8)
      this.d.updateMatrix()
      this.sombras.setMatrixAt(i, this.d.matrix)
    })
    this.sombras.instanceMatrix.needsUpdate = true
  }

  /** Selección indulgente: distancia del rayo a cada personaje (son chiquitos). */
  elegir(rayo: THREE.Ray): Animal | null {
    let mejor: Animal | null = null
    let distancia = Infinity
    for (const a of this.animales) {
      if (a.oculto) continue
      const e = ESCALA * (a.f.scale ?? 1)
      this.p.set(a.pos.x, a.y + 0.45 * e, a.pos.z)
      const r = (a.f.kind === 'fly' || a.f.kind === 'glide' ? 1.1 : 0.7) * ESCALA
      if (rayo.distanceSqToPoint(this.p) < r * r) {
        const t = this.p.sub(rayo.origin).dot(rayo.direction)
        if (t < distancia) {
          distancia = t
          mejor = a
        }
      }
    }
    return mejor
  }

  /** Salta al saludarlo o tocarlo. */
  saltar(a: Animal) {
    a.salto = 1
  }

  texto(a: Animal, idioma: Idioma) {
    const [nombre, dato] = FAUNA_TEXTOS[idioma][a.f.especie]
    return `${nombre}: ${dato}`
  }

  destruir() {
    for (const m of this.mallas) {
      m.geometry.dispose()
      m.dispose()
      this.cx.escena.remove(m)
    }
    this.material.dispose()
    this.sombras.geometry.dispose()
    this.sombras.material.map?.dispose()
    this.sombras.material.dispose()
    this.sombras.dispose()
    this.cx.escena.remove(this.sombras)
  }
}

export type { Animal }
