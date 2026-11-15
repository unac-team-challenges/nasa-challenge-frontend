/**
 * Escena 3D del Perú: portada del prototipo v2 (three.js r128) a three.js actual.
 * "La altura es el dato": cada departamento sube o se hunde según slope_per_decade.
 *
 * Es código imperativo a propósito (sin react-three-fiber) y lo controla el componente Mapa3D.
 *
 * Rendimiento: dibuja solo cuando algo cambia (cámara, datos, hover, tema, tamaño). La animación
 * de fondo (giro, lluvia) va como máximo a 30 cuadros/s, 15 si la ventana no tiene el foco, y se
 * pausa con la pestaña oculta o el mapa fuera de pantalla. La resolución se adapta sola.
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DEPARTAMENTOS, NOMBRE, type Variable, type Zona } from '../data/datos'
import { colorAnomalia, cssVar, esTemaClaro, hexMix } from '../lib/color'
import { claveMapa } from '../lib/direccion'
import { Fauna, type Animal } from './fauna'

// Mismo aspecto que el prototipo en r128: sin gestión de color y salida lineal.
THREE.ColorManagement.enabled = false

export type ModoMapa = 'inicio' | 'explorar'

const PISO = 2.2
const ALTURA_MAX = 3.2
/** Escala mínima: con menos, un departamento que baja mucho queda bajo el mar y desaparece. */
const ESCALA_MIN = 0.12
/** Cuadros por segundo de la animación de fondo (con foco / sin foco). */
const FPS_FONDO = 30
const FPS_SIN_FOCO = 15
const ELEVA_SEL = 0.35
const LON0 = -75.0
const LAT0 = -9.2
const K = 2.2
const COSLAT = Math.cos((LAT0 * Math.PI) / 180)
/** Desde r155 las luces son físicas: ×π para igualar las intensidades de r128. */
const LUZ = Math.PI
/** Zonas con etiqueta flotante. */
const CLAVE = ['24', '20', '15', '21', '16', '08']
const DESPLAZA_ETIQUETA: Record<string, number> = { '24': -30 } // Tumbes queda pegado a Piura
const VISTAS: Record<ModoMapa, { pos: number[]; tgt: number[] }> = {
  inicio: { pos: [8, 29, 66], tgt: [0, -1, 5] },
  explorar: { pos: [0, 44, 34], tgt: [0, 0, 1] },
}

/** Nombres de países vecinos (solo texto tenue; v14–v15 del prototipo). */
const PAISES = [
  { es: 'Ecuador', en: 'Ecuador', lon: -78.6, lat: -1.4 },
  { es: 'Colombia', en: 'Colombia', lon: -73.6, lat: 2.6 },
  { es: 'Brasil', en: 'Brazil', lon: -63.5, lat: -7.5 },
  { es: 'Bolivia', en: 'Bolivia', lon: -64.6, lat: -16.2 },
  { es: 'Chile', en: 'Chile', lon: -69.5, lat: -20.6 },
]
/** Partículas de la lluvia viva (máximo). */
const N_PARTICULAS = 1600

interface Particulas {
  geo: THREE.BufferGeometry
  puntos: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
}

/**
 * Lluvia viva y calor que sube, animados en la GPU: cada partícula tiene (x, z) fijos, una
 * fase, una velocidad y el índice de su departamento. La altura la calcula el shader con el
 * reloj y la altura actual del departamento (uTope); el CPU solo sube 26 números por cuadro.
 */
const PARTICULAS_VS = `
uniform float uTime, uTam, uEscala, uCalor;
uniform float uTope[${DEPARTAMENTOS.length}];
attribute vec3 aSemilla; // x: fase 0..1, y: velocidad, z: departamento
varying float vA;
#include <fog_pars_vertex>
void main() {
  float tope = uTope[int(aSemilla.z + 0.5)];
  float h = uCalor > 0.5 ? 2.6 : 9.0;
  float f = fract(aSemilla.x + uTime * aSemilla.y / h);
  vec3 p = position;
  p.y = uCalor > 0.5 ? tope + h * f : tope + h * (1.0 - f);
  vA = uCalor > 0.5 ? sin(3.14159 * f) : smoothstep(0.0, 0.12, 1.0 - f) * smoothstep(0.0, 0.06, f);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uTam * uEscala / -mvPosition.z;
  #include <fog_vertex>
}`
const PARTICULAS_FS = `
uniform vec3 uColor;
uniform float uOpacidad, uCalor;
varying float vA;
#include <fog_pars_fragment>
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float a = uCalor > 0.5
    ? 1.0 - smoothstep(0.12, 0.5, length(q))                                                // brillo redondo
    : (1.0 - smoothstep(0.03, 0.09, abs(q.x))) * (1.0 - smoothstep(0.15, 0.5, abs(q.y)));  // gota alargada
  a *= vA * uOpacidad;
  if (a < 0.02) discard;
  gl_FragColor = vec4(uColor, a);
  #include <fog_fragment>
}`

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const celular = () => matchMedia('(max-width: 900px)').matches

interface DatosMalla {
  id: string
  h: number
  objetivo: number
  centro: THREE.Vector3
  contorno: THREE.LineSegments<THREE.BufferGeometry, THREE.LineDashedMaterial>
}
type Malla = THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial> & {
  userData: DatosMalla
}

export interface OpcionesEscena {
  oceano: string
  modo: ModoMapa
  /** Se llama al tocar un departamento (solo en el explorador). */
  alElegir?: (id: string) => void
  /** Se llama cuando cambia el giro automático. */
  alGirar?: (girando: boolean) => void
}

const proyectar = ([lon, lat]: number[]) =>
  new THREE.Vector2((lon - LON0) * COSLAT * K, (lat - LAT0) * K)

/**
 * Suelo de Sudamérica en un solo shader: mar con profundidad sugerida, costa con espuma y
 * oleaje, tierra con sombreado suave del relieve real, ríos, lagos y fronteras tenues.
 * Las texturas se precalculan con scripts/generar_mundo.py (SRTM/ETOPO1 y Natural Earth).
 */
const MUNDO = { lon0: -110, lon1: -30, lat0: -60, lat1: 25 } // caja de public/mapa/mundo*.png
const SUELO_VS = `
varying vec3 vW;
#include <fog_pars_vertex>
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`
const SUELO_FS = `
uniform float uTime;
uniform sampler2D uMundo, uMundo2, uPeru;
uniform vec4 uCaja, uCajaPeru;
uniform vec3 uHondo, uSomero, uEspuma, uSombra, uTierraBaja, uTierraAlta, uAgua, uFrontera;
varying vec3 vW;
#include <fog_pars_fragment>
void main() {
  vec2 uv = (vW.xz - uCaja.xy) / uCaja.zw;
  vec3 t = texture2D(uMundo, uv).rgb;   // r: relieve (tierra) o profundidad (mar); g, b: costa
  vec3 t2 = texture2D(uMundo2, uv).rgb; // g: ríos y lagos; b: fronteras
  vec2 b2 = smoothstep(0.0, 0.04, uv) * smoothstep(0.0, 0.04, 1.0 - uv);
  float borde = b2.x * b2.y; // fuera de la caja el mar sigue
  float cerca = t.g * borde, lejos = t.b * borde, tierra = smoothstep(0.44, 0.56, cerca);
  vec3 mar = mix(uSomero, uHondo, smoothstep(0.05, 0.95, mix(0.6, t.r, borde)));
  mar = mix(mar, uSomero, smoothstep(0.05, 0.6, lejos) * 0.55);
  float ola = sin(vW.x * 0.7 + uTime * 0.5) * sin(vW.z * 0.8 - uTime * 0.4) * 0.6
            + sin(length(vW.xz) * 0.55 - uTime * 0.8) * 0.4;
  mar += ola * 0.012 * (1.0 - lejos);
  float banda = smoothstep(0.1, 0.36, cerca) * (1.0 - smoothstep(0.4, 0.47, cerca));
  mar = mix(mar, uEspuma, banda * (0.45 + 0.3 * sin(cerca * 40.0 - uTime * 1.5)));
  vec3 suelo = mix(uTierraBaja, uTierraAlta, 0.35 + 0.65 * smoothstep(0.45, 0.9, t.r));
  suelo = mix(suelo, uAgua, t2.g * 0.55);
  suelo = mix(suelo, uFrontera, t2.b * 0.45);
  vec3 col = mix(mar, suelo, tierra);
  // sombra suave del Perú (sol del noroeste): los departamentos se "apoyan" en el suelo
  vec2 pv = (vW.xz + vec2(-1.2, 1.2) - uCajaPeru.xy) / uCajaPeru.zw;
  col = mix(col, uSombra, texture2D(uPeru, pv).r * 0.35);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}`

/** Desenfoque de caja separable, 3 pasadas (≈ gaussiano). */
function desenfocar(src: Float32Array, S: number, r: number) {
  const a = Float32Array.from(src)
  const b = new Float32Array(S * S)
  const n = 2 * r + 1
  const cl = (v: number) => (v < 0 ? 0 : v >= S ? S - 1 : v)
  for (let pasada = 0; pasada < 3; pasada++) {
    for (let y = 0; y < S; y++) {
      const o = y * S
      let acc = 0
      for (let x = -r; x <= r; x++) acc += a[o + cl(x)]
      for (let x = 0; x < S; x++) {
        b[o + x] = acc / n
        acc += a[o + cl(x + r + 1)] - a[o + cl(x - r)]
      }
    }
    for (let x = 0; x < S; x++) {
      let acc = 0
      for (let y = -r; y <= r; y++) acc += b[cl(y) * S + x]
      for (let y = 0; y < S; y++) {
        a[y * S + x] = acc / n
        acc += b[cl(y + r + 1) * S + x] - b[cl(y - r) * S + x]
      }
    }
  }
  return a
}

/** Silueta del Perú difuminada (256 px, una vez): sombra suave sobre el suelo. */
function texturaSombraPeru(desplaza: THREE.Vector3, caja: { x: number; z: number; w: number }) {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, S, S)
  g.fillStyle = '#fff'
  for (const z of DEPARTAMENTOS)
    for (const poly of z.polys) {
      g.beginPath()
      for (const ring of poly)
        ring.forEach((p, i) => {
          const v = proyectar(p)
          const x = ((v.x + desplaza.x - caja.x) / caja.w) * S
          const y = ((-v.y + desplaza.z - caja.z) / caja.w) * S
          if (i) g.lineTo(x, y)
          else g.moveTo(x, y)
        })
      g.fill('evenodd')
    }
  const img = g.getImageData(0, 0, S, S).data
  const tierra = new Float32Array(S * S)
  for (let i = 0; i < S * S; i++) tierra[i] = img[i * 4] / 255
  const ancho = desenfocar(tierra, S, 6)
  const out = new Uint8Array(S * S * 4)
  for (let i = 0; i < S * S; i++) {
    out[i * 4] = ancho[i] * 255
    out[i * 4 + 3] = 255
  }
  const tx = new THREE.DataTexture(out, S, S, THREE.RGBAFormat)
  tx.magFilter = tx.minFilter = THREE.LinearFilter
  tx.needsUpdate = true
  return tx
}

/** Textura de 1 píxel mientras carga la del mundo (mar liso, nunca negro). */
function pixel(r: number, g: number, b: number) {
  const tx = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat)
  tx.needsUpdate = true
  return tx
}

function texturaCielo() {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 512
  const g = c.getContext('2d')!
  const bg = cssVar('--bg')
  const claro = esTemaClaro()
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, hexMix(bg, claro ? '#ffffff' : '#000000', claro ? 0.35 : 0.4))
  grad.addColorStop(0.58, hexMix(bg, cssVar('--accent-soft'), claro ? 0.55 : 0.7))
  grad.addColorStop(1, bg)
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 512)
  return new THREE.CanvasTexture(c)
}

function texturaRayada(hex: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const col = new THREE.Color(hex)
  const claro = col.clone().lerp(new THREE.Color(cssVar('--panel')), 0.55)
  x.fillStyle = '#' + claro.getHexString()
  x.fillRect(0, 0, 64, 64)
  x.strokeStyle = '#' + col.getHexString()
  x.lineWidth = 10
  for (let i = -64; i < 128; i += 22) {
    x.beginPath()
    x.moveTo(i, 64)
    x.lineTo(i + 64, 0)
    x.stroke()
  }
  const tx = new THREE.CanvasTexture(c)
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping
  tx.repeat.set(0.7, 0.7)
  return tx
}

interface Vuelo {
  p0: THREE.Vector3
  t0: THREE.Vector3
  p1: THREE.Vector3
  t1: THREE.Vector3
  inicio: number
  dur: number
}

export class EscenaPeru {
  private renderer: THREE.WebGLRenderer
  private escena = new THREE.Scene()
  private camara = new THREE.PerspectiveCamera(36, 1, 0.1, 600)
  private controles: OrbitControls
  private hemi = new THREE.HemisphereLight(0xdbeaf3, 0x14202b, 0.8 * LUZ)
  private sol = new THREE.DirectionalLight(0xfff4e0, 0.8 * LUZ)
  private mar: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private texturas: THREE.Texture[] = []
  private mapa = new THREE.Group()
  private mallas: Malla[] = []
  private rayadas: Record<'up' | 'down' | 'green', THREE.CanvasTexture> | null = null
  private zonas: Record<string, Zona> = {}
  private variable: Variable = 'lluvia'
  private hover: string | null = null
  private sel: string | null = null
  /** Máquina del tiempo: anomalía de cada zona en el año elegido (null = tendencia) */
  private anio: { valores: Record<string, number>; max: number } | null = null
  private vuelo: Vuelo | null = null
  private fueraDePantalla = false
  private ancho = 1
  private alto = 1
  private etiquetas: { id: string; el: HTMLDivElement }[] = []
  private etiquetaSel: HTMLDivElement
  private etiquetaOceano: HTMLDivElement
  private etiquetasPais: { el: HTMLDivElement; x: number; z: number; es: string; en: string }[] = []
  /** Lluvia viva: gotas que caen (lluvia) o calor que sube (temperatura) */
  private particulas: Particulas
  private muestras: [number, number][][] = []
  private v3 = new THREE.Vector3()
  /** Resolución adaptativa: promedio móvil del intervalo entre cuadros dibujados seguidos. */
  private perf = { media: 0, previo: 0, seguido: false, cambio: 0, pendiente: false }
  private dpr = 1
  private dprMax = 1
  /** Hay que volver a dibujar en el próximo cuadro. */
  private sucio = true
  private ultimoCuadro = 0
  private arrastrando = false
  private amortiguando = false
  private moviendo = false
  /** Último movimiento del puntero; se procesa una vez por cuadro. */
  private puntero: PointerEvent | null = null
  /** Colores del tema leídos una vez por cambio de tema (getComputedStyle es caro). */
  private colores = new Map<string, string>()
  private porId = new Map<string, Malla>()
  /** Último transform escrito en cada etiqueta (para no tocar el DOM si no cambió). */
  private posEtiqueta = new Map<HTMLElement, string>()
  /** Qué hay bajo el puntero: un personaje de la fauna o un departamento. */
  private elegir: (e: PointerEvent) => { animal: Animal } | string | null
  private fauna: Fauna
  private animalHover: Animal | null = null
  private tipTimer = 0
  private destruida = false
  private tip: HTMLDivElement
  private idioma: 'es' | 'en' = 'es'
  private observadores: (ResizeObserver | IntersectionObserver)[] = []
  private quitarEventos: () => void
  private contenedor: HTMLElement
  private capaEtiquetas: HTMLElement
  private modo: ModoMapa
  private alElegir?: (id: string) => void
  private alGirar?: (girando: boolean) => void

  constructor(contenedor: HTMLElement, capaEtiquetas: HTMLElement, op: OpcionesEscena) {
    this.contenedor = contenedor
    this.capaEtiquetas = capaEtiquetas
    this.modo = op.modo
    this.alElegir = op.alElegir
    this.alGirar = op.alGirar

    const r = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    r.outputColorSpace = THREE.LinearSRGBColorSpace
    this.dprMax = Math.min(devicePixelRatio || 1, 1.5)
    this.dpr = Math.min(this.dprMax, 1.25)
    r.setPixelRatio(this.dpr) // sin mapa de sombras: la sombra del Perú va en el shader del suelo
    r.domElement.style.display = 'block'
    r.domElement.style.width = '100%'
    r.domElement.style.height = '100%'
    r.domElement.style.touchAction = 'none'
    contenedor.prepend(r.domElement)
    this.renderer = r

    const c = new OrbitControls(this.camara, r.domElement)
    c.enableDamping = true
    c.maxPolarAngle = Math.PI * 0.47
    c.minDistance = 12
    c.maxDistance = 120
    c.autoRotateSpeed = 0.55
    this.controles = c

    this.escena.add(this.hemi)
    this.sol.position.set(-25, 50, 25)
    this.escena.add(this.sol)

    this.mapa.rotation.x = -Math.PI / 2
    this.escena.add(this.mapa)
    for (const z of DEPARTAMENTOS) {
      const formas = z.polys.map((poly) => {
        const anillos = poly.map((ring) => ring.slice(0, -1).map(proyectar))
        const s = new THREE.Shape(anillos[0])
        for (const h of anillos.slice(1)) s.holes.push(new THREE.Path(h))
        return s
      })
      const geom = new THREE.ExtrudeGeometry(formas, { depth: 1, bevelEnabled: false })
      const malla = new THREE.Mesh(
        geom,
        new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.02 }),
      ) as unknown as Malla
      malla.position.z = -PISO
      // Un solo LineSegments por departamento (antes: una línea y un material por anillo)
      const seg: number[] = []
      for (const poly of z.polys)
        for (const ring of poly)
          for (let i = 0; i < ring.length - 1; i++) {
            const a = proyectar(ring[i])
            const b = proyectar(ring[i + 1])
            seg.push(a.x, a.y, 1.002, b.x, b.y, 1.002)
          }
      const geoC = new THREE.BufferGeometry()
      geoC.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3))
      const contorno = new THREE.LineSegments(
        geoC,
        new THREE.LineDashedMaterial({ dashSize: 1, gapSize: 0.0001 }),
      )
      contorno.computeLineDistances()
      malla.add(contorno)
      malla.userData = { id: z.id, h: 0.4, objetivo: 0.4, centro: new THREE.Vector3(), contorno }
      this.mapa.add(malla)
      this.mallas.push(malla)
      this.porId.set(z.id, malla)
    }
    const caja = new THREE.Box3().setFromObject(this.mapa)
    const centro = caja.getCenter(new THREE.Vector3())
    this.mapa.position.x -= centro.x
    this.mapa.position.z -= centro.z
    this.mapa.updateMatrixWorld(true)
    for (const m of this.mallas)
      m.userData.centro = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).setY(0)

    // Suelo: un plano, un material, un draw call; se dibuja después de los departamentos
    const aEscena = (lon: number, lat: number) => {
      const v = proyectar([lon, lat])
      return [v.x + this.mapa.position.x, -v.y + this.mapa.position.z]
    }
    const [cx0, cz0] = aEscena(MUNDO.lon0, MUNDO.lat1)
    const [cx1, cz1] = aEscena(MUNDO.lon1, MUNDO.lat0)
    const tam = caja.getSize(new THREE.Vector3())
    const lado = Math.max(tam.x, tam.z) + 16
    const cajaPeru = { x: -lado / 2, z: -lado / 2, w: lado }
    const sombra = texturaSombraPeru(this.mapa.position, cajaPeru)
    const vacio1 = pixel(153, 0, 0)
    const vacio2 = pixel(0, 0, 0)
    this.texturas.push(sombra, vacio1, vacio2)
    const u = (v: unknown) => ({ value: v })
    const matSuelo = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTime: u(0),
          uMundo: u(vacio1),
          uMundo2: u(vacio2),
          uPeru: u(sombra),
          uCaja: u(new THREE.Vector4(cx0, cz0, cx1 - cx0, cz1 - cz0)),
          uCajaPeru: u(new THREE.Vector4(cajaPeru.x, cajaPeru.z, lado, lado)),
          uHondo: u(new THREE.Color()),
          uSomero: u(new THREE.Color()),
          uEspuma: u(new THREE.Color()),
          uSombra: u(new THREE.Color()),
          uTierraBaja: u(new THREE.Color()),
          uTierraAlta: u(new THREE.Color()),
          uAgua: u(new THREE.Color()),
          uFrontera: u(new THREE.Color()),
        },
      ]),
      vertexShader: SUELO_VS,
      fragmentShader: SUELO_FS,
      fog: true,
    })
    // UniformsUtils.merge clona: las texturas se asignan después
    matSuelo.uniforms.uMundo.value = vacio1
    matSuelo.uniforms.uMundo2.value = vacio2
    matSuelo.uniforms.uPeru.value = sombra
    const cargador = new THREE.TextureLoader()
    const base = import.meta.env.BASE_URL
    for (const [archivo, clave] of [
      ['mapa/mundo.png', 'uMundo'],
      ['mapa/mundo2.png', 'uMundo2'],
    ] as const)
      cargador.load(base + archivo, (tx) => {
        if (this.destruida) return tx.dispose() // el mapa se cerró mientras cargaba
        tx.flipY = false
        tx.minFilter = THREE.LinearMipmapLinearFilter
        tx.anisotropy = Math.min(4, r.capabilities.getMaxAnisotropy())
        tx.needsUpdate = true
        this.texturas.push(tx)
        matSuelo.uniforms[clave].value = tx
        this.sucio = true
      })
    this.mar = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), matSuelo)
    this.mar.rotation.x = -Math.PI / 2
    this.mar.position.y = -PISO - 0.02
    this.mar.renderOrder = 1
    this.escena.add(this.mar)

    // Etiquetas flotantes (capa HTML encima del lienzo; texto, nunca HTML)
    capaEtiquetas.replaceChildren()
    const nuevaEtiqueta = (clase: string) => {
      const el = document.createElement('div')
      el.className = clase
      capaEtiquetas.appendChild(el)
      return el
    }
    for (const id of CLAVE) this.etiquetas.push({ id, el: nuevaEtiqueta('lbl3d') })
    this.etiquetaSel = nuevaEtiqueta('lbl3d sel')
    this.etiquetaSel.hidden = true
    this.etiquetaOceano = nuevaEtiqueta('lbl3d ocean')
    this.etiquetaOceano.textContent = op.oceano
    for (const p of PAISES) {
      const v = proyectar([p.lon, p.lat])
      const el = nuevaEtiqueta('lbl3d country')
      el.textContent = p.es
      this.etiquetasPais.push({
        el,
        x: v.x + this.mapa.position.x,
        z: -v.y + this.mapa.position.z,
        es: p.es,
        en: p.en,
      })
    }

    // Lluvia viva: puntos de muestra dentro de cada departamento (en coordenadas del mundo)
    for (const z of DEPARTAMENTOS) {
      const anillos = z.polys.flatMap((poly) => poly.map((r) => r.map((p) => proyectar(p))))
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      for (const r of anillos)
        for (const v of r) {
          x0 = Math.min(x0, v.x)
          x1 = Math.max(x1, v.x)
          y0 = Math.min(y0, v.y)
          y1 = Math.max(y1, v.y)
        }
      const dentro = (x: number, y: number) => {
        let ins = false
        for (const r of anillos)
          for (let i = 0, j = r.length - 1; i < r.length; j = i++)
            if (
              r[i].y > y !== r[j].y > y &&
              x < ((r[j].x - r[i].x) * (y - r[i].y)) / (r[j].y - r[i].y) + r[i].x
            )
              ins = !ins
        return ins
      }
      const out: [number, number][] = []
      for (let k = 0; k < 3000 && out.length < 40; k++) {
        const x = x0 + Math.random() * (x1 - x0)
        const y = y0 + Math.random() * (y1 - y0)
        if (dentro(x, y)) out.push([x + this.mapa.position.x, -y + this.mapa.position.z])
      }
      this.muestras.push(out)
    }
    const geoP = new THREE.BufferGeometry()
    geoP.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N_PARTICULAS * 3), 3))
    geoP.setAttribute('aSemilla', new THREE.BufferAttribute(new Float32Array(N_PARTICULAS * 3), 3))
    const matP = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTime: { value: 0 },
          uTam: { value: 0.55 },
          uEscala: { value: 400 },
          uCalor: { value: 0 },
          uColor: { value: new THREE.Color() },
          uOpacidad: { value: 0.85 },
          uTope: { value: new Float32Array(DEPARTAMENTOS.length) },
        },
      ]),
      vertexShader: PARTICULAS_VS,
      fragmentShader: PARTICULAS_FS,
      transparent: true,
      depthWrite: false,
      fog: true,
    })
    const puntos = new THREE.Points(geoP, matP)
    puntos.frustumCulled = false
    puntos.visible = false
    this.escena.add(puntos)

    // Fauna y gente de cada región, sobre su departamento
    const idx = new Map(DEPARTAMENTOS.map((z, i) => [z.id, i]))
    this.fauna = new Fauna({
      escena: this.escena,
      muestras: (id) => this.muestras[idx.get(id) ?? 0] ?? [],
      centro: (id) => this.porId.get(id)?.userData.centro ?? new THREE.Vector3(),
      tope: (id) => {
        const m = this.porId.get(id)
        return m ? m.position.z + m.scale.z : -PISO
      },
      aEscena: (lon, lat) => {
        const v = proyectar([lon, lat])
        return [v.x + this.mapa.position.x, -v.y + this.mapa.position.z]
      },
      nivelMar: -PISO - 0.02,
    })
    this.tip = nuevaEtiqueta('tip3d')
    this.tip.hidden = true
    this.particulas = { geo: geoP, puntos }

    const ro = new ResizeObserver(() => this.redimensionar())
    ro.observe(contenedor)
    const io = new IntersectionObserver((es) => {
      this.fueraDePantalla = !es[0].isIntersecting
      this.sucio = true
    })
    io.observe(contenedor)
    this.observadores.push(ro, io)
    this.redimensionar()

    // Puntero: resaltar al pasar y elegir con un toque (sin arrastrar)
    const rayo = new THREE.Raycaster()
    const ptr = new THREE.Vector2()
    let abajo: [number, number] | null = null
    this.elegir = (e: PointerEvent) => {
      const b = r.domElement.getBoundingClientRect()
      ptr.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
      rayo.setFromCamera(ptr, this.camara)
      const animal = this.fauna.elegir(rayo.ray)
      if (animal) return { animal }
      const h = rayo.intersectObjects(this.mallas, false)[0]
      return h ? (h.object as Malla).userData.id : null
    }
    // El raycast se hace como mucho una vez por cuadro (el mouse dispara más de 100 eventos/s)
    const mover = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return // al arrastrar con el dedo se gira; el dato sale al tocar
      this.puntero = e
    }
    const salir = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return // al soltar el dedo no se cierra el dato
      this.puntero = null
      this.setHover(null)
      this.setAnimal(null)
    }
    const bajar = (e: PointerEvent) => {
      abajo = [e.clientX, e.clientY]
    }
    const subir = (e: PointerEvent) => {
      if (!abajo) return
      const movido = Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1])
      abajo = null
      if (movido >= 6) return
      const hit = this.elegir(e)
      if (e.pointerType === 'touch') {
        // sin puntero que pase por encima: el dato sale al tocar al personaje y se va a los 4 s
        clearTimeout(this.tipTimer)
        const animal = hit && typeof hit !== 'string' ? hit.animal : null
        this.setAnimal(animal, e.clientX, e.clientY)
        if (animal) this.tipTimer = window.setTimeout(() => this.setAnimal(null), 4000)
      }
      if (hit && typeof hit !== 'string') {
        this.fauna.saltar(hit.animal)
        if (this.modo === 'explorar') this.alElegir?.(hit.animal.f.dept)
      } else if (hit && this.modo === 'explorar') this.alElegir?.(hit)
    }
    const alEmpezar = () => {
      this.arrastrando = true
      this.vuelo = null
      if (this.modo === 'explorar' && this.controles.autoRotate) this.setGiro(false)
    }
    const alTerminar = () => {
      this.arrastrando = false
    }
    const alCambiarCamara = () => {
      this.sucio = true
    }
    const alCambiarVisibilidad = () => {
      this.sucio = true
    }
    r.domElement.addEventListener('pointermove', mover)
    r.domElement.addEventListener('pointerleave', salir)
    r.domElement.addEventListener('pointerdown', bajar)
    r.domElement.addEventListener('pointerup', subir)
    c.addEventListener('start', alEmpezar)
    c.addEventListener('end', alTerminar)
    c.addEventListener('change', alCambiarCamara)
    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    this.quitarEventos = () => {
      r.domElement.removeEventListener('pointermove', mover)
      r.domElement.removeEventListener('pointerleave', salir)
      r.domElement.removeEventListener('pointerdown', bajar)
      r.domElement.removeEventListener('pointerup', subir)
      c.removeEventListener('start', alEmpezar)
      c.removeEventListener('end', alTerminar)
      c.removeEventListener('change', alCambiarCamara)
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }

    this.vista(true)
    r.setAnimationLoop((t) => this.cuadro(t))
  }

  /** Datos nuevos: recalcula colores y alturas. */
  setDatos(zonas: Record<string, Zona>, variable: Variable, instantaneo = false) {
    this.zonas = zonas
    this.variable = variable
    this.pintar()
    this.alturas(instantaneo)
    this.textosEtiquetas()
    this.actualizarParticulas()
  }

  /**
   * Máquina del tiempo: cada zona sube o se hunde según cómo fue ese año frente a su
   * promedio. Las columnas se mueven suave porque las alturas se interpolan en cada cuadro.
   */
  setAnio(anio: { valores: Record<string, number>; max: number } | null) {
    this.anio = anio
    this.pintar()
    this.alturas(false)
    this.textosEtiquetas()
    this.actualizarParticulas()
  }

  /** Zona elegida: se eleva, lleva borde de acento y la cámara vuela hacia ella. */
  seleccionar(id: string | null, volar: boolean) {
    const antes = this.sel
    this.sel = id
    this.pintar()
    this.textosEtiquetas()
    if (id && volar && id !== antes) this.volarA(id)
    else if (id) this.setGiro(false)
  }

  /** Relee los tokens del tema (claro/oscuro) y repinta. */
  aplicarTema() {
    this.colores.clear()
    const bg = new THREE.Color(this.color('--bg'))
    const claro = esTemaClaro()
    if (this.escena.background instanceof THREE.Texture) this.escena.background.dispose()
    this.escena.background = texturaCielo()
    this.escena.fog = new THREE.Fog(bg, 95, 235)
    const fondo = this.color('--bg')
    const mar = this.color('--sea')
    const fg = this.color('--fg')
    const U = this.mar.material.uniforms
    U.uHondo.value.set(hexMix(mar, claro ? fg : '#000000', claro ? 0.18 : 0.4))
    U.uSomero.value.set(hexMix(mar, claro ? '#ffffff' : this.color('--accent-soft'), claro ? 0.35 : 0.2))
    U.uEspuma.value.set(hexMix(mar, claro ? '#ffffff' : fg, claro ? 0.8 : 0.35))
    U.uSombra.value.set(hexMix(mar, '#000000', claro ? 0.35 : 0.6))
    U.uTierraBaja.value.set(hexMix(fondo, fg, claro ? 0.3 : 0.08))
    U.uTierraAlta.value.set(hexMix(fondo, claro ? '#ffffff' : fg, claro ? 0.6 : 0.32))
    U.uAgua.value.set(hexMix(mar, claro ? fg : this.color('--accent-soft'), claro ? 0.25 : 0.35))
    U.uFrontera.value.set(hexMix(fondo, fg, claro ? 0.55 : 0.45))
    U.fogColor.value.copy(bg)
    U.fogNear.value = 95
    U.fogFar.value = 235
    // En claro, luz más suave para que los colores no se "quemen"
    this.hemi.intensity = (claro ? 0.78 : 0.8) * LUZ
    this.hemi.color.set(claro ? 0xf4f6f7 : 0xdbeaf3)
    this.hemi.groundColor.set(claro ? 0xa3aeb3 : 0x14202b)
    this.sol.intensity = (claro ? 0.4 : 0.8) * LUZ
    this.sol.color.set(claro ? 0xffffff : 0xfff4e0)
    if (this.rayadas) Object.values(this.rayadas).forEach((t) => t.dispose())
    this.rayadas = {
      up: texturaRayada(this.color('--map-up')),
      down: texturaRayada(this.color('--map-down')),
      green: texturaRayada(this.color('--map-green')),
    }
    this.pintar()
    this.actualizarParticulas()
  }

  /** Token de color del tema, leído una vez por tema. */
  private color(nombre: string) {
    let v = this.colores.get(nombre)
    if (v === undefined) {
      v = cssVar(nombre)
      this.colores.set(nombre, v)
    }
    return v
  }

  /** Resalta la zona bajo el puntero tocando solo 2 materiales (antes se repintaban los 25). */
  private setHover(id: string | null) {
    if (id === this.hover) return
    const antes = this.hover ? this.porId.get(this.hover) : undefined
    antes?.material.emissive.set(0x000000)
    this.hover = id
    const m = id ? this.porId.get(id) : undefined
    m?.material.emissive.set(this.color('--accent')).multiplyScalar(0.18)
    this.renderer.domElement.style.cursor = id && this.modo === 'explorar' ? 'pointer' : ''
    this.sucio = true
  }

  setTextoOceano(t: string) {
    this.etiquetaOceano.textContent = t
    this.sucio = true
  }

  setIdioma(idioma: 'es' | 'en') {
    this.idioma = idioma
    if (this.animalHover) this.tip.textContent = this.fauna.texto(this.animalHover, idioma)
    for (const p of this.etiquetasPais) p.el.textContent = idioma === 'en' ? p.en : p.es
    this.sucio = true
  }

  /** Personaje bajo el puntero: salta y muestra su dato (como texto, nunca HTML). */
  private setAnimal(a: Animal | null, x = 0, y = 0) {
    if (a && a !== this.animalHover) this.fauna.saltar(a)
    this.animalHover = a
    if (!a) {
      this.tip.hidden = true
      this.renderer.domElement.style.cursor = this.hover && this.modo === 'explorar' ? 'pointer' : ''
      return
    }
    const b = this.contenedor.getBoundingClientRect()
    this.tip.textContent = this.fauna.texto(a, this.idioma)
    this.tip.style.transform = `translate(${(x - b.left).toFixed(0)}px, ${(y - b.top).toFixed(0)}px) translate(-50%, calc(-100% - 14px))`
    this.tip.hidden = false
    this.renderer.domElement.style.cursor = 'pointer'
  }

  /**
   * Lluvia viva (v6): gotas sobre las zonas donde llueve más (tendencia real que sube, o año
   * por encima de su promedio). En temperatura, partículas de calor que suben sobre las zonas
   * que se calientan. Sin animación si la persona pidió reducir el movimiento.
   */
  private actualizarParticulas() {
    const P = this.particulas
    if (!P) return
    const calor = this.variable === 'temperatura'
    const U = P.puntos.material.uniforms
    // Más claras que las columnas para que se lean encima de ellas
    const claro = esTemaClaro()
    U.uColor.value.set(
      hexMix(
        this.color(calor ? '--map-down' : '--map-up'),
        claro ? '#1a2a33' : '#ffffff',
        // El calor sube como un brillo casi blanco: sobre columnas ocre, el ocre no se vería
        calor ? (claro ? 0.5 : 0.78) : claro ? 0.25 : 0.5,
      ),
    )
    U.uCalor.value = calor ? 1 : 0
    U.uTam.value = calor ? 0.32 : 0.55
    const positivas = Object.values(this.zonas)
      .filter((d) => d.status === 'real' && d.slope_per_decade > 0)
      .map((d) => d.slope_per_decade)
    const maxPos = Math.max(0.0001, ...positivas)
    let total = 0
    const acumulado: number[] = []
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      let w = 0
      if (d && d.status !== 'pocos_datos') {
        const valorAnio = this.anio?.valores[m.userData.id]
        if (this.anio) w = valorAnio != null ? Math.max(0, valorAnio / this.anio.max) : 0
        else if (d.status === 'real' && d.slope_per_decade > 0) w = d.slope_per_decade / maxPos
      }
      total += w
      acumulado.push(total)
    }
    const porPeso = calor ? 70 : this.anio ? 260 : 520
    const cuenta = Math.min(N_PARTICULAS, Math.round(total * porPeso))
    // Se reparten una vez por cambio de datos; luego solo se mueven en la GPU
    const pos = P.geo.attributes.position.array as Float32Array
    const semilla = P.geo.attributes.aSemilla.array as Float32Array
    let n = 0
    for (let i = 0; i < cuenta; i++) {
      const r = Math.random() * total
      let k = acumulado.findIndex((c) => c >= r)
      if (k < 0) k = 0
      const s = this.muestras[k]
      if (!s || !s.length) continue
      const p = s[(Math.random() * s.length) | 0]
      pos[n * 3] = p[0] + (Math.random() - 0.5) * 0.3
      pos[n * 3 + 1] = 0
      pos[n * 3 + 2] = p[1] + (Math.random() - 0.5) * 0.3
      semilla[n * 3] = Math.random()
      semilla[n * 3 + 1] = calor ? 0.5 + Math.random() * 0.6 : 6 + Math.random() * 4
      semilla[n * 3 + 2] = k
      n++
    }
    P.geo.setDrawRange(0, n)
    P.geo.attributes.position.needsUpdate = true
    P.geo.attributes.aSemilla.needsUpdate = true
    P.puntos.visible = !reducido() && n > 0
    this.pasoParticulas(0)
    this.sucio = true
  }

  /** Por cuadro: el reloj y la altura de cada departamento (nada por partícula). */
  private pasoParticulas(dt: number) {
    const P = this.particulas
    if (!P.puntos.visible) return
    const U = P.puntos.material.uniforms
    U.uTime.value += dt
    const tope = U.uTope.value as Float32Array
    for (let k = 0; k < this.mallas.length; k++)
      tope[k] = this.mallas[k].position.z + this.mallas[k].scale.z
  }

  /** Activa o pausa el giro automático. */
  setGiro(girando: boolean) {
    const v = girando && !reducido()
    if (this.controles.autoRotate === v) return
    this.controles.autoRotate = v
    this.alGirar?.(v)
    this.sucio = true
  }

  alternarGiro() {
    this.setGiro(!this.controles.autoRotate)
  }

  /** Vuelve a la vista inicial del modo actual. */
  recentrar() {
    this.vista(false)
  }

  destruir() {
    this.destruida = true
    clearTimeout(this.tipTimer)
    this.renderer.setAnimationLoop(null)
    this.quitarEventos()
    this.observadores.forEach((o) => o.disconnect())
    this.controles.dispose()
    for (const m of this.mallas) {
      m.geometry.dispose()
      m.material.dispose()
      m.userData.contorno.geometry.dispose()
      m.userData.contorno.material.dispose()
    }
    this.fauna.destruir()
    this.particulas.geo.dispose()
    this.particulas.puntos.material.dispose()
    this.mar.geometry.dispose()
    this.mar.material.dispose()
    this.texturas.forEach((t) => t.dispose())
    if (this.escena.background instanceof THREE.Texture) this.escena.background.dispose()
    if (this.rayadas) Object.values(this.rayadas).forEach((t) => t.dispose())
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.capaEtiquetas.replaceChildren()
  }

  private pintar() {
    if (!this.rayadas) return
    const acento = this.color('--accent')
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      if (!d) continue
      const mat = m.material
      const clave = claveMapa(d.slope_per_decade, this.variable)
      let mapa: THREE.Texture | null = null
      let transparente = false
      let opacidad = 1
      const valorAnio = this.anio?.valores[m.userData.id]
      if (this.anio && valorAnio != null)
        mat.color.set(colorAnomalia(valorAnio, this.anio.max, this.variable))
      else if (d.status === 'real') mat.color.set(this.color(`--map-${clave}`))
      else if (d.status === 'posible_casualidad') {
        mat.color.set(0xffffff)
        mapa = this.rayadas[clave]
        transparente = true
        opacidad = 0.82
      } else {
        mat.color.set(this.color('--muted'))
        transparente = true
        opacidad = 0.16
      }
      // Recompilar el shader solo si cambia lo que lo define (textura o transparencia)
      if (!!mat.map !== !!mapa || mat.transparent !== transparente) mat.needsUpdate = true
      mat.map = mapa
      mat.transparent = transparente
      mat.opacity = opacidad
      mat.emissive.set(0x000000)
      if (m.userData.id === this.hover) mat.emissive.set(acento).multiplyScalar(0.18)
      const pocos = d.status === 'pocos_datos'
      const elegida = m.userData.id === this.sel
      const lm = m.userData.contorno.material
      lm.color.set(elegida ? acento : this.color(pocos ? '--muted' : '--bg'))
      lm.dashSize = pocos ? 0.35 : 1
      lm.gapSize = pocos ? 0.25 : 0.0001
    }
    this.sucio = true
  }

  private alturas(instantaneo: boolean) {
    const max = Math.max(...Object.values(this.zonas).map((d) => Math.abs(d.slope_per_decade))) || 1
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      if (!d) continue
      const valorAnio = this.anio?.valores[m.userData.id]
      const h =
        d.status === 'pocos_datos'
          ? 0.05
          : this.anio && valorAnio != null
            ? Math.max(-1.1, Math.min(1.1, valorAnio / this.anio.max)) * ALTURA_MAX
            : (d.slope_per_decade / max) * ALTURA_MAX
      m.userData.objetivo = Math.max(ESCALA_MIN, PISO + h)
      if (instantaneo || reducido()) {
        m.userData.h = m.userData.objetivo
        m.scale.z = m.userData.h
      }
    }
    this.sucio = true
  }

  private texto(el: HTMLElement, id: string) {
    const d = this.zonas[id]
    if (!d) return
    const valorAnio = this.anio?.valores[id]
    const v =
      d.status === 'pocos_datos'
        ? '—'
        : this.anio && valorAnio != null
          ? this.formatearAnomalia(valorAnio)
          : this.formatear(d.slope_per_decade)
    const small = document.createElement('small')
    small.textContent = v
    el.replaceChildren(NOMBRE[id], small)
  }

  private textosEtiquetas() {
    for (const L of this.etiquetas) {
      this.texto(L.el, L.id)
      L.el.classList.toggle('sel', L.id === this.sel)
    }
    const aparte = !!this.sel && !CLAVE.includes(this.sel)
    this.etiquetaSel.hidden = !aparte
    if (aparte && this.sel) this.texto(this.etiquetaSel, this.sel)
    this.sucio = true
  }

  private formatearAnomalia(a: number) {
    const signo = a > 0 ? '+' : a < 0 ? '−' : ''
    return this.variable === 'temperatura'
      ? signo + Math.abs(a).toFixed(1).replace('.', ',') + ' °C'
      : signo + Math.round(Math.abs(a) * 100) + ' %'
  }

  private formatear(v: number) {
    const signo = v > 0 ? '+' : v < 0 ? '−' : ''
    return this.variable === 'temperatura'
      ? signo + Math.abs(v).toFixed(2).replace('.', ',') + ' °C'
      : signo + Math.round(Math.abs(v)) + ' mm'
  }

  private vista(instantaneo: boolean) {
    const v = VISTAS[this.modo]
    const a = this.camara.aspect
    // En pantallas angostas, la cámara se aleja para que el Perú entre completo (v12)
    const k = a >= 1 ? 1 : this.modo === 'inicio' ? 1.05 : a < 0.85 ? 1.6 : 1.35
    this.volarCamara(
      new THREE.Vector3(v.pos[0] * k, v.pos[1] * k, v.pos[2] * k),
      new THREE.Vector3(v.tgt[0], v.tgt[1], v.tgt[2]),
      instantaneo,
    )
    // Gira en la portada y en el explorador mientras no haya zona elegida
    this.setGiro(this.modo === 'inicio' || !this.sel)
  }

  private volarA(id: string) {
    const m = this.porId.get(id)
    if (!m) return
    const c = m.userData.centro.clone()
    const k = this.camara.aspect < 1 ? 1.3 : 1
    this.volarCamara(c.clone().add(new THREE.Vector3(0, 38 * k, 30 * k)), c, false)
    this.setGiro(false)
  }

  private volarCamara(pos: THREE.Vector3, tgt: THREE.Vector3, instantaneo: boolean) {
    if (instantaneo || reducido()) {
      this.camara.position.copy(pos)
      this.controles.target.copy(tgt)
      this.controles.update()
      this.vuelo = null
      this.sucio = true
      return
    }
    this.vuelo = {
      p0: this.camara.position.clone(),
      t0: this.controles.target.clone(),
      p1: pos,
      t1: tgt,
      inicio: performance.now(),
      dur: 1100,
    }
  }

  private redimensionar() {
    const w = this.contenedor.clientWidth || 1
    const h = this.contenedor.clientHeight || 1
    this.ancho = w
    this.alto = h
    this.renderer.setSize(w, h, false)
    this.camara.aspect = w / h
    this.camara.updateProjectionMatrix()
    // tamaño de los puntos en píxeles del búfer, como hace PointsMaterial
    if (this.particulas)
      this.particulas.puntos.material.uniforms.uEscala.value = (h * this.renderer.getPixelRatio()) / 2
    this.sucio = true
  }

  /**
   * Resolución adaptativa continua. La versión anterior medía una sola vez y descartaba los
   * cuadros de más de 250 ms, justo los de un equipo lento, así que nunca bajaba la resolución.
   */
  private vigilarRendimiento(t: number, fondo: boolean) {
    const p = this.perf
    if (p.seguido && p.previo) {
      const dt = Math.min(1000, t - p.previo)
      p.media = p.media ? p.media * 0.85 + dt * 0.15 : dt
      const limite = fondo ? 1000 / FPS_FONDO + 12 : 45
      if (t - p.cambio > 1000) {
        let nuevo = this.dpr
        if (p.media > limite) nuevo = Math.max(0.5, this.dpr * 0.8)
        else if (p.media < limite * 0.55 && this.dpr < this.dprMax)
          nuevo = Math.min(this.dprMax, this.dpr * 1.1)
        if (Math.abs(nuevo - this.dpr) > 0.01) {
          this.dpr = nuevo
          p.cambio = t
          p.pendiente = true // se aplica al empezar el próximo cuadro (si no, parpadea en blanco)
          p.media = 0
        }
      }
    }
    p.seguido = true
    p.previo = t
  }

  private cuadro(t: number) {
    if (this.fueraDePantalla || document.hidden) {
      this.ultimoCuadro = t
      this.perf.seguido = false
      return // no dibujar lo que no se ve
    }
    const ocupado =
      this.sucio ||
      !!this.vuelo ||
      this.arrastrando ||
      this.moviendo ||
      !!this.puntero ||
      this.amortiguando
    // con la fauna el mapa siempre está vivo, pero a 30 cuadros/s como máximo
    const fondo = !reducido()
    if (!ocupado && !fondo) {
      this.ultimoCuadro = t
      this.perf.seguido = false
      return // nada cambió: cero GPU
    }
    const fps = document.hasFocus() ? FPS_FONDO : FPS_SIN_FOCO
    if (!ocupado && t - this.ultimoCuadro < 1000 / fps - 2) return
    const dt = Math.min(0.1, (t - (this.ultimoCuadro || t)) / 1000)
    this.ultimoCuadro = t
    this.sucio = false
    if (this.perf.pendiente) {
      this.perf.pendiente = false
      this.renderer.setPixelRatio(this.dpr)
      this.redimensionar()
      this.sucio = false
    }
    if (this.vuelo) {
      const v = this.vuelo
      const k = Math.min(1, (t - v.inicio) / v.dur)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      this.camara.position.lerpVectors(v.p0, v.p1, e)
      this.controles.target.lerpVectors(v.t0, v.t1, e)
      if (k >= 1) this.vuelo = null
    }
    let moviendo = false
    for (const m of this.mallas) {
      const dh = m.userData.objetivo - m.userData.h
      const dz = -PISO + (m.userData.id === this.sel ? ELEVA_SEL : 0) - m.position.z
      if (Math.abs(dh) > 0.002 || Math.abs(dz) > 0.002) {
        moviendo = true
        m.userData.h += dh * (this.anio ? 0.07 : 0.12)
        m.scale.z = m.userData.h
        m.position.z += dz * 0.2
      }
    }
    this.moviendo = moviendo
    if (this.puntero) {
      const e = this.puntero
      const hit = this.elegir(e)
      this.puntero = null
      if (hit && typeof hit !== 'string') {
        this.setHover(null)
        this.setAnimal(hit.animal, e.clientX, e.clientY)
      } else {
        this.setAnimal(null)
        this.setHover(hit)
      }
    }
    this.amortiguando = this.controles.update(dt) && !this.controles.autoRotate
    this.pasoParticulas(fondo ? dt : 0)
    this.fauna.paso(fondo ? dt : 0) // con «reducir movimiento» quedan quietos sobre su zona
    if (fondo) this.mar.material.uniforms.uTime.value += dt
    this.renderer.render(this.escena, this.camara)
    this.vigilarRendimiento(t, !ocupado)
    this.ubicarEtiquetas()
  }

  private ubicarEtiqueta(el: HTMLElement, x: number, y: number, z: number, dy = 0) {
    this.v3.set(x, y, z).project(this.camara)
    const v = this.v3
    const fuera = v.z > 1 || v.x < -1.2 || v.x > 1.2 || v.y < -1.2 || v.y > 1.2
    // Solo se escribe en el DOM si cambió (antes: en cada cuadro, con recálculo de estilos)
    const tf = fuera
      ? 'fuera'
      : `translate(${(((v.x + 1) / 2) * this.ancho).toFixed(0)}px, ${(((1 - v.y) / 2) * this.alto + dy).toFixed(0)}px) translate(-50%, -135%)`
    if (this.posEtiqueta.get(el) === tf) return
    this.posEtiqueta.set(el, tf)
    el.style.visibility = fuera ? 'hidden' : 'visible'
    if (!fuera) el.style.transform = tf
  }

  private ubicarEtiquetas() {
    // En celular la portada no lleva etiquetas de departamentos (v12)
    const apretado = celular() && this.modo === 'inicio'
    const malla = (id: string) => this.porId.get(id)
    for (const L of this.etiquetas) {
      if (L.el.hidden !== apretado) L.el.hidden = apretado
      if (apretado) continue
      const m = malla(L.id)!
      this.ubicarEtiqueta(
        L.el,
        m.userData.centro.x,
        m.position.z + m.scale.z + 0.4,
        m.userData.centro.z,
        DESPLAZA_ETIQUETA[L.id],
      )
    }
    if (this.sel && !CLAVE.includes(this.sel) && !apretado) {
      const m = malla(this.sel)
      if (m)
        this.ubicarEtiqueta(
          this.etiquetaSel,
          m.userData.centro.x,
          m.position.z + m.scale.z + 0.4,
          m.userData.centro.z,
        )
    }
    for (const p of this.etiquetasPais) {
      // En celular no se muestran los nombres de países (v12)
      if (p.el.hidden !== celular()) p.el.hidden = celular()
      if (!p.el.hidden) this.ubicarEtiqueta(p.el, p.x, -PISO, p.z)
    }
    const lima = malla('15')
    if (lima)
      this.ubicarEtiqueta(
        this.etiquetaOceano,
        lima.userData.centro.x - 9,
        -PISO,
        lima.userData.centro.z + 1,
      )
  }
}
