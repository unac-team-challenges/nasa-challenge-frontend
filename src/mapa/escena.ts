/**
 * Escena 3D del Perú: portada del prototipo v2 (three.js r128) a three.js actual.
 * "La altura es el dato": cada departamento sube o se hunde según slope_per_decade.
 *
 * Es código imperativo a propósito (sin react-three-fiber): conserva los ajustes de
 * rendimiento del prototipo (v13) y lo controla el componente Mapa3D.
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DEPARTAMENTOS, NOMBRE, type Variable, type Zona } from '../data/ejemplo'
import { cssVar, esTemaClaro, hexMix } from '../lib/color'

// Mismo aspecto que el prototipo en r128: sin gestión de color y salida lineal.
THREE.ColorManagement.enabled = false

export type ModoMapa = 'inicio' | 'explorar'

const PISO = 2.2
const ALTURA_MAX = 3.2
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

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const celular = () => matchMedia('(max-width: 900px)').matches

interface DatosMalla {
  id: string
  h: number
  objetivo: number
  centro: THREE.Vector3
  contorno: THREE.Group
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

/* Curvas de nivel del piso: campo periódico + marching squares (del prototipo). */
function campo(x: number, y: number) {
  const P = Math.PI * 2
  return (
    Math.sin(P * 2 * x + 1.3 * Math.sin(P * y)) * 0.6 +
    Math.cos(P * 3 * y - P * x) * 0.45 +
    Math.sin(P * (x + y)) * 0.5 +
    0.28 * Math.sin(P * 5 * x) * Math.cos(P * 2 * y) +
    0.18 * Math.cos(P * 4 * (x - y))
  )
}
const SEG: Record<number, [string, string][]> = {
  1: [['L', 'B']],
  2: [['B', 'R']],
  3: [['L', 'R']],
  4: [['T', 'R']],
  5: [
    ['T', 'R'],
    ['L', 'B'],
  ],
  6: [['T', 'B']],
  7: [['L', 'T']],
  8: [['L', 'T']],
  9: [['T', 'B']],
  10: [
    ['L', 'T'],
    ['B', 'R'],
  ],
  11: [['T', 'R']],
  12: [['L', 'R']],
  13: [['B', 'R']],
  14: [['L', 'B']],
}
function lienzoCurvas(size: number, fondo: string, linea: string, alfa: number, niveles: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = fondo
  g.fillRect(0, 0, size, size)
  const N = 120
  const F: number[][] = []
  for (let j = 0; j <= N; j++) {
    F[j] = []
    for (let i = 0; i <= N; i++) F[j][i] = campo(i / N, j / N)
  }
  let lo = Infinity
  let hi = -Infinity
  for (const r of F)
    for (const v of r) {
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
  const s = size / N
  const t = (p: number, q: number, L: number) => (L - p) / (q - p || 1e-9)
  g.strokeStyle = linea
  g.lineCap = 'round'
  for (let k = 1; k < niveles; k++) {
    const L = lo + ((hi - lo) * k) / niveles
    const mayor = k % 4 === 0
    g.globalAlpha = alfa * (mayor ? 1.6 : 1)
    g.lineWidth = ((mayor ? 1.6 : 1) * size) / 720
    g.beginPath()
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const a = F[j][i]
        const b = F[j][i + 1]
        const cc = F[j + 1][i + 1]
        const d = F[j + 1][i]
        const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (cc > L ? 2 : 0) | (d > L ? 1 : 0)
        const segs = SEG[idx]
        if (!segs) continue
        const pt: Record<string, [number, number]> = {
          T: [i + t(a, b, L), j],
          R: [i + 1, j + t(b, cc, L)],
          B: [i + t(d, cc, L), j + 1],
          L: [i, j + t(a, d, L)],
        }
        for (const [e1, e2] of segs) {
          g.moveTo(pt[e1][0] * s, pt[e1][1] * s)
          g.lineTo(pt[e2][0] * s, pt[e2][1] * s)
        }
      }
    g.stroke()
  }
  g.globalAlpha = 1
  return c
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
  private mar: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>
  private mapa = new THREE.Group()
  private mallas: Malla[] = []
  private rayadas: Record<'up' | 'down' | 'green', THREE.CanvasTexture> | null = null
  private zonas: Record<string, Zona> = {}
  private variable: Variable = 'lluvia'
  private hover: string | null = null
  private sel: string | null = null
  private vuelo: Vuelo | null = null
  private fueraDePantalla = false
  private ancho = 1
  private alto = 1
  private etiquetas: { id: string; el: HTMLDivElement }[] = []
  private etiquetaSel: HTMLDivElement
  private etiquetaOceano: HTMLDivElement
  private v3 = new THREE.Vector3()
  private perf = { n: 0, suma: 0, ultimo: 0, listo: false }
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
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFSoftShadowMap
    r.shadowMap.autoUpdate = false // las sombras se recalculan solo cuando cambian las alturas
    r.shadowMap.needsUpdate = true
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
    this.sol.castShadow = true
    this.sol.shadow.mapSize.set(1024, 1024)
    Object.assign(this.sol.shadow.camera, {
      left: -40,
      right: 40,
      top: 40,
      bottom: -40,
      near: 1,
      far: 140,
    })
    this.escena.add(this.sol)

    this.mar = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      new THREE.MeshStandardMaterial({ roughness: 1 }),
    )
    this.mar.rotation.x = -Math.PI / 2
    this.mar.position.y = -PISO - 0.02
    this.mar.receiveShadow = true
    this.escena.add(this.mar)

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
      malla.castShadow = true
      malla.receiveShadow = true
      malla.position.z = -PISO
      const contorno = new THREE.Group()
      for (const poly of z.polys)
        for (const ring of poly) {
          const pts = ring.map((p) => {
            const v = proyectar(p)
            return new THREE.Vector3(v.x, v.y, 1.002)
          })
          const linea = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineDashedMaterial({ dashSize: 1, gapSize: 0.0001 }),
          )
          linea.computeLineDistances()
          contorno.add(linea)
        }
      malla.add(contorno)
      malla.userData = { id: z.id, h: 0.4, objetivo: 0.4, centro: new THREE.Vector3(), contorno }
      this.mapa.add(malla)
      this.mallas.push(malla)
    }
    const caja = new THREE.Box3().setFromObject(this.mapa)
    const centro = caja.getCenter(new THREE.Vector3())
    this.mapa.position.x -= centro.x
    this.mapa.position.z -= centro.z
    this.mapa.updateMatrixWorld(true)
    for (const m of this.mallas)
      m.userData.centro = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).setY(0)

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

    const ro = new ResizeObserver(() => this.redimensionar())
    ro.observe(contenedor)
    const io = new IntersectionObserver((es) => {
      this.fueraDePantalla = !es[0].isIntersecting
    })
    io.observe(contenedor)
    this.observadores.push(ro, io)
    this.redimensionar()

    // Puntero: resaltar al pasar y elegir con un toque (sin arrastrar)
    const rayo = new THREE.Raycaster()
    const ptr = new THREE.Vector2()
    let abajo: [number, number] | null = null
    const elegir = (e: PointerEvent) => {
      const b = r.domElement.getBoundingClientRect()
      ptr.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
      rayo.setFromCamera(ptr, this.camara)
      const h = rayo.intersectObjects(this.mallas, false)[0]
      return h ? (h.object as Malla).userData.id : null
    }
    const mover = (e: PointerEvent) => {
      const id = elegir(e)
      if (id === this.hover) return
      this.hover = id
      r.domElement.style.cursor = id && this.modo === 'explorar' ? 'pointer' : ''
      this.pintar()
    }
    const salir = () => {
      this.hover = null
      this.pintar()
    }
    const bajar = (e: PointerEvent) => {
      abajo = [e.clientX, e.clientY]
    }
    const subir = (e: PointerEvent) => {
      if (!abajo) return
      const movido = Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1])
      abajo = null
      if (movido < 6 && this.modo === 'explorar') {
        const id = elegir(e)
        if (id) this.alElegir?.(id)
      }
    }
    const alEmpezar = () => {
      this.vuelo = null
      if (this.modo === 'explorar' && this.controles.autoRotate) this.setGiro(false)
    }
    r.domElement.addEventListener('pointermove', mover)
    r.domElement.addEventListener('pointerleave', salir)
    r.domElement.addEventListener('pointerdown', bajar)
    r.domElement.addEventListener('pointerup', subir)
    c.addEventListener('start', alEmpezar)
    this.quitarEventos = () => {
      r.domElement.removeEventListener('pointermove', mover)
      r.domElement.removeEventListener('pointerleave', salir)
      r.domElement.removeEventListener('pointerdown', bajar)
      r.domElement.removeEventListener('pointerup', subir)
      c.removeEventListener('start', alEmpezar)
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
    const bg = new THREE.Color(cssVar('--bg'))
    const claro = esTemaClaro()
    if (this.escena.background instanceof THREE.Texture) this.escena.background.dispose()
    this.escena.background = texturaCielo()
    this.escena.fog = new THREE.Fog(bg, 95, 235)
    this.mar.material.map?.dispose()
    const curvas = new THREE.CanvasTexture(
      lienzoCurvas(1024, cssVar('--sea'), cssVar('--plane'), claro ? 0.08 : 0.18, 18),
    )
    curvas.wrapS = curvas.wrapT = THREE.RepeatWrapping
    curvas.repeat.set(5, 5)
    curvas.anisotropy = 4
    this.mar.material.map = curvas
    this.mar.material.color.set(0xffffff)
    this.mar.material.needsUpdate = true
    // En claro, luz más suave para que los colores no se "quemen"
    this.hemi.intensity = (claro ? 0.78 : 0.8) * LUZ
    this.hemi.color.set(claro ? 0xf4f6f7 : 0xdbeaf3)
    this.hemi.groundColor.set(claro ? 0xa3aeb3 : 0x14202b)
    this.sol.intensity = (claro ? 0.4 : 0.8) * LUZ
    this.sol.color.set(claro ? 0xffffff : 0xfff4e0)
    if (this.rayadas) Object.values(this.rayadas).forEach((t) => t.dispose())
    this.rayadas = {
      up: texturaRayada(cssVar('--map-up')),
      down: texturaRayada(cssVar('--map-down')),
      green: texturaRayada(cssVar('--map-green')),
    }
    this.renderer.shadowMap.needsUpdate = true
    this.pintar()
  }

  setTextoOceano(t: string) {
    this.etiquetaOceano.textContent = t
  }

  /** Activa o pausa el giro automático. */
  setGiro(girando: boolean) {
    const v = girando && !reducido()
    if (this.controles.autoRotate === v) return
    this.controles.autoRotate = v
    this.alGirar?.(v)
  }

  alternarGiro() {
    this.setGiro(!this.controles.autoRotate)
  }

  /** Vuelve a la vista inicial del modo actual. */
  recentrar() {
    this.vista(false)
  }

  destruir() {
    this.renderer.setAnimationLoop(null)
    this.quitarEventos()
    this.observadores.forEach((o) => o.disconnect())
    this.controles.dispose()
    for (const m of this.mallas) {
      m.geometry.dispose()
      m.material.dispose()
      m.userData.contorno.children.forEach((l) => {
        const linea = l as THREE.Line<THREE.BufferGeometry, THREE.Material>
        linea.geometry.dispose()
        linea.material.dispose()
      })
    }
    this.mar.geometry.dispose()
    this.mar.material.map?.dispose()
    this.mar.material.dispose()
    if (this.escena.background instanceof THREE.Texture) this.escena.background.dispose()
    if (this.rayadas) Object.values(this.rayadas).forEach((t) => t.dispose())
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.capaEtiquetas.replaceChildren()
  }

  private pintar() {
    if (!this.rayadas) return
    const acento = cssVar('--accent')
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      if (!d) continue
      const mat = m.material
      const sube = d.slope_per_decade >= 0
      const clave = sube ? (this.variable === 'ndvi' ? 'green' : 'up') : 'down'
      mat.map = null
      mat.transparent = false
      mat.opacity = 1
      mat.emissive.set(0x000000)
      if (d.status === 'real') mat.color.set(cssVar(`--map-${clave}`))
      else if (d.status === 'posible_casualidad') {
        mat.color.set(0xffffff)
        mat.map = this.rayadas[clave]
        mat.transparent = true
        mat.opacity = 0.82
      } else {
        mat.color.set(cssVar('--muted'))
        mat.transparent = true
        mat.opacity = 0.16
      }
      if (m.userData.id === this.hover) mat.emissive.set(acento).multiplyScalar(0.18)
      mat.needsUpdate = true
      const pocos = d.status === 'pocos_datos'
      const elegida = m.userData.id === this.sel
      for (const l of m.userData.contorno.children) {
        const lm = (l as THREE.Line).material as THREE.LineDashedMaterial
        lm.color.set(elegida ? acento : cssVar(pocos ? '--muted' : '--bg'))
        lm.dashSize = pocos ? 0.35 : 1
        lm.gapSize = pocos ? 0.25 : 0.0001
        lm.needsUpdate = true
      }
    }
  }

  private alturas(instantaneo: boolean) {
    const max = Math.max(...Object.values(this.zonas).map((d) => Math.abs(d.slope_per_decade))) || 1
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      if (!d) continue
      const h = d.status === 'pocos_datos' ? 0.05 : (d.slope_per_decade / max) * ALTURA_MAX
      m.userData.objetivo = PISO + h
      if (instantaneo || reducido()) {
        m.userData.h = m.userData.objetivo
        m.scale.z = m.userData.h
      }
    }
    this.renderer.shadowMap.needsUpdate = true
  }

  private texto(el: HTMLElement, id: string) {
    const d = this.zonas[id]
    if (!d) return
    const v = d.status === 'pocos_datos' ? '—' : this.formatear(d.slope_per_decade)
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
  }

  private formatear(v: number) {
    const signo = v > 0 ? '+' : v < 0 ? '−' : ''
    return this.variable === 'ndvi'
      ? signo + Math.abs(v).toFixed(2).replace('.', ',')
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
    const m = this.mallas.find((x) => x.userData.id === id)
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
  }

  /** Red de seguridad: si no llega a ~40 cuadros por segundo, baja la resolución (una vez). */
  private vigilarRendimiento(t: number) {
    const p = this.perf
    if (p.listo || document.hidden || this.fueraDePantalla) {
      p.ultimo = 0
      return
    }
    if (p.ultimo) {
      const dt = t - p.ultimo
      if (dt < 250) {
        p.suma += dt
        p.n++
      }
    }
    p.ultimo = t
    if (p.n >= 90) {
      p.listo = true
      if (p.suma / p.n > 25) {
        this.renderer.setPixelRatio(this.renderer.getPixelRatio() > 1 ? 1 : 0.8)
        this.redimensionar()
      }
    }
  }

  private cuadro(t: number) {
    this.vigilarRendimiento(t)
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
      if (Math.abs(dh) > 0.002 || Math.abs(dz) > 0.002) moviendo = true
      m.userData.h += dh * 0.12
      m.scale.z = m.userData.h
      m.position.z += dz * 0.2
    }
    if (moviendo) this.renderer.shadowMap.needsUpdate = true
    this.controles.update()
    if (this.fueraDePantalla) return // no dibujar lo que no se ve
    this.renderer.render(this.escena, this.camara)
    this.ubicarEtiquetas()
  }

  private ubicarEtiqueta(el: HTMLElement, x: number, y: number, z: number, dy = 0) {
    this.v3.set(x, y, z).project(this.camara)
    const v = this.v3
    if (v.z > 1 || v.x < -1.2 || v.x > 1.2 || v.y < -1.2 || v.y > 1.2) {
      el.style.visibility = 'hidden'
      return
    }
    el.style.visibility = 'visible'
    el.style.transform = `translate(${(((v.x + 1) / 2) * this.ancho).toFixed(1)}px, ${(((1 - v.y) / 2) * this.alto + dy).toFixed(1)}px) translate(-50%, -135%)`
  }

  private ubicarEtiquetas() {
    // En celular la portada no lleva etiquetas de departamentos (v12)
    const apretado = celular() && this.modo === 'inicio'
    const malla = (id: string) => this.mallas.find((x) => x.userData.id === id)
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
