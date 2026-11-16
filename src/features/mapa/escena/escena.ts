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
import { DEPARTAMENTOS, NOMBRE, type Variable, type Zona } from '@/data/datos'
import { colorAnomalia, cssVar, esTemaClaro, hexMix } from '@/utils/color'
import { claveMapa } from '@/utils/direccion'
import { lineaClima } from '@/features/mapa/utils/faunaClima'
import { datosTarjeta, datosTarjetaVeg } from '@/features/mapa/utils/tarjeta'
import {
  dibujarCalor,
  PARADAS_LLUVIA,
  PARADAS_VEG,
  tieneAnio,
  varianteCalor,
  type Calor,
} from '@/features/mapa/utils/calor'
import { Fauna, type Animal } from '@/features/mapa/escena/fauna'
import { Bosque, crearLocalizador, REGIONES, resumenPorDepto } from '@/features/mapa/escena/bosque'
import { MQ_CELULAR } from '@/utils/disposicion'
import {
  LON0,
  LAT0,
  K,
  COSLAT,
  LUZ,
  DIR_LUZ,
  DIR_ASTRO,
  N_NUBES,
  proyectar,
  MUNDO,
  RELIEVE,
  DPR_RELIEVE,
} from '@/features/mapa/escena/constantes'
import { SUELO_VS, SUELO_FS } from '@/features/mapa/escena/shaders'
import {
  type RelieveTapa,
  type Previo,
  conSombraDeContacto,
  texturaSombraPeru,
  pixel,
  texturaCielo,
  texturaAstro,
  texturaPunteada,
} from '@/features/mapa/escena/texturas'
import {
  crearEstrellas,
  crearParticulas,
  llenarNubes,
  muestrasLluvia,
  N_PARTICULAS,
  type Particulas,
} from '@/features/mapa/escena/construccion'

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
/** El departamento bajo el puntero sube un poco (como fill-extrusion en Mapbox o deck.gl). */
const ELEVA_HOVER = 0.18
/** Brillo de acento del departamento bajo el puntero (emisivo, entra y sale suave). */
const BRILLO_HOVER = 0.2
/** Zonas con etiqueta flotante. */
const CLAVE = ['24', '20', '15', '21', '16', '08']
/** En celular solo estas llevan etiqueta fija (Tumbes y Piura quedaban bajo los paneles); la elegida siempre tiene la suya. */
const CLAVE_CELULAR = ['15', '21', '16', '08']
const DESPLAZA_ETIQUETA: Record<string, number> = { '24': -30 } // Tumbes queda pegado a Piura
const VISTAS: Record<ModoMapa, { pos: number[]; tgt: number[] }> = {
  // Casi cenital: el Perú entra completo con sus departamentos, como en el explorador
  inicio: { pos: [0, 85, 10], tgt: [0, 0, 0] },
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
const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const celular = () => matchMedia(MQ_CELULAR).matches
/** ¿Esta zona lleva etiqueta fija en esta pantalla? Si no, la elegida usa la etiqueta suelta. */
const conEtiquetaFija = (id: string) =>
  CLAVE.includes(id) && (!celular() || CLAVE_CELULAR.includes(id))

interface DatosMalla {
  id: string
  h: number
  objetivo: number
  centro: THREE.Vector3
  contorno: THREE.LineSegments<THREE.BufferGeometry, THREE.LineDashedMaterial>
  /** 0..1: cuánto brilla por el hover (se interpola en cada cuadro). */
  brillo: number
}
type TipoCalor = 'real' | 'punteado' | 'apagado'
type ClaveCalor = Variable | 'vegetacion'
const claveCalor = (c: Calor): ClaveCalor =>
  c.paradas === PARADAS_VEG ? 'vegetacion' : c.paradas === PARADAS_LLUVIA ? 'lluvia' : 'temperatura'
/** Duración del fundido de color entre modos (s). */
const FUNDIDO = 0.75
/** Modo Vegetación: cuántos departamentos extremos llevan etiqueta (los más y los menos verdes). */
const EXTREMOS_VEG = 3

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
  /** Se llama si el navegador pierde el contexto WebGL (memoria de la tarjeta, cambio de pestaña en celular). */
  alPerderContexto?: () => void
}

const TEXTURAS_MUNDO = [
  ['mapa/mundo.webp', 'uMundo'],
  ['mapa/mundo2.webp', 'uMundo2'],
] as const
// Las texturas (~1 MB) empiezan a bajar apenas llega este módulo, sin esperar a que se arme la
// escena (~1 s después). El TextureLoader (y el 2D) reutilizan la misma descarga: mismo modo CORS.
for (const [archivo] of TEXTURAS_MUNDO) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = import.meta.env.BASE_URL + archivo
}
/** Ficha técnica que aparece al pasar el puntero por un departamento (texto, nunca HTML). */
function crearTarjeta(capa: HTMLElement) {
  const nuevo = (clase: string, padre: HTMLElement, tag = 'div') => {
    const el = document.createElement(tag)
    el.className = clase
    padre.appendChild(el)
    return el
  }
  const raiz = nuevo('ficha3d', capa)
  const caja = nuevo('ficha3d-caja', raiz)
  const nombre = nuevo('ficha3d-nombre', caja)
  const valor = nuevo('ficha3d-valor', caja)
  const estado = nuevo('ficha3d-estado', caja)
  const ic = nuevo('ficha3d-ic', caja)
  return {
    raiz,
    nombre,
    valor,
    estado,
    ic,
    rango: nuevo('ficha3d-rango', ic, 'span'),
    punto: nuevo('ficha3d-punto', ic, 'span'),
    meta: nuevo('ficha3d-meta', caja),
    /** Tamaño medido al llenarla (una lectura de layout por cambio de hover, no por cuadro). */
    ancho: 0,
    alto: 0,
  }
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
  /** Malla densa solo sobre la caja de la textura: ahí sube el relieve. */
  private relieve: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private texturas: THREE.Texture[] = []
  private mapa = new THREE.Group()
  private mallas: Malla[] = []
  private punteadas: Record<'up' | 'down' | 'green', THREE.CanvasTexture> | null = null
  private zonas: Record<string, Zona> = {}
  private variable: Variable = 'lluvia'
  private hover: string | null = null
  private sel: string | null = null
  /** Máquina del tiempo: anomalía de cada zona en el año elegido (null = tendencia) */
  private anio: { valores: Record<string, number>; max: number } | null = null
  /** Año de la máquina del tiempo (para la malla de calor) */
  private numeroAnio: number | null = null
  /**
   * Mallas por celda ya cargadas (temperatura, lluvia, vegetación). Se guardan las tres: volver a
   * un modo es inmediato y nunca se ve la malla de otro modo mientras llega la nueva.
   */
  private calores = new Map<ClaveCalor, Calor>()
  private lienzoCalor = document.createElement('canvas')
  /**
   * Texturas opacas de cada malla, una por estado de la tendencia (ver varianteCalor), creadas al
   * primer uso, con la firma (año y tema) con la que se pintaron.
   */
  private texCalor = new Map<
    Calor,
    { tex: Partial<Record<TipoCalor, THREE.CanvasTexture>>; firma: string }
  >()
  private versionTema = 0
  /** Fundido del color de las tapas al cambiar de modo: 0 = color anterior, 1 = nuevo. */
  private fundido = 1
  /** Bosque del modo Vegetación (plantas de cada zona según el NDVI y la altitud). */
  private bosque: Bosque
  private localizar = crearLocalizador()
  /** NDVI, altitud y regiones de cada departamento (modo Vegetación: ficha y altura de la columna). */
  private ndvi: ReturnType<typeof resumenPorDepto> | null = null
  /** Nombres de las 3 regiones (modo Vegetación), sobre la columna del departamento donde caen. */
  /** Modo Vegetación: etiquetas de los departamentos más y menos verdes (id '' = sin dato aún). */
  private etiquetasVeg: { id: string; el: HTMLDivElement }[] = []
  /** Altura de la cara superior de cada departamento (la leen las plantas en la GPU). */
  private topes = new Float32Array(DEPARTAMENTOS.length)
  /** Altitud del suelo (canal R de mundo2.webp: 0..255 = 0..6000 m), para saber qué planta crece. */
  private elevacion: Uint8ClampedArray | null = null
  private vuelo: Vuelo | null = null
  private fueraDePantalla = false
  private ancho = 1
  private alto = 1
  private etiquetas: { id: string; el: HTMLDivElement }[] = []
  private etiquetaSel: HTMLDivElement
  private etiquetaOceano: HTMLDivElement
  private etiquetasPais: { el: HTMLDivElement; x: number; z: number; es: string; en: string }[] = []
  /** Vista de verdor (variable Vegetación en el explorador): relieve por NDVI medio y bosque. */
  private veg = false
  /** Lluvia viva: gotas que caen (lluvia) o calor que sube (temperatura) */
  private particulas: Particulas
  /** Nubes sobre las zonas donde llueve, con su sombra (2 draw calls para todas). */
  private nubes = new THREE.Group()
  private geoNubes = new THREE.InstancedBufferGeometry()
  /** Sol (claro) o luna (oscuro) en el cielo real, en la dirección de la luz. */
  private astro = new THREE.Sprite(
    new THREE.SpriteMaterial({ fog: false, depthWrite: false, transparent: true }),
  )
  /** Estrellas fijas, solo en oscuro. */
  private estrellas: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
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
  private tarjeta: ReturnType<typeof crearTarjeta>
  private acento = new THREE.Color()
  private idioma: 'es' | 'en' = 'es'
  private observadores: (ResizeObserver | IntersectionObserver)[] = []
  private abortar = new AbortController()
  private quitarEventos: () => void
  private contenedor: HTMLElement
  private capaEtiquetas: HTMLElement
  private modo: ModoMapa
  /**
   * Corrimiento horizontal de la imagen (px): en la portada el Perú va a la derecha, junto al
   * texto; en el explorador se corre a la izquierda del informe abierto. Se anima en cuadro()
   * con setViewOffset, así el lienzo nunca cambia de tamaño al abrir el informe.
   */
  private corrimiento = 0
  private tapa: RelieveTapa = {
    uMundo: { value: null },
    uCaja: { value: new THREE.Vector4() },
    uFundido: { value: 1 },
    uOrigen: { value: new THREE.Vector2() },
  }
  private panel = 0
  private alElegir?: (id: string) => void
  private alGirar?: (girando: boolean) => void

  constructor(contenedor: HTMLElement, capaEtiquetas: HTMLElement, op: OpcionesEscena) {
    this.contenedor = contenedor
    this.capaEtiquetas = capaEtiquetas
    this.modo = op.modo
    this.alElegir = op.alElegir
    this.alGirar = op.alGirar

    const r = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    // Sin chequeo síncrono de shaders en producción: frena el primer frame
    r.debug.checkShaderErrors = import.meta.env.DEV
    r.outputColorSpace = THREE.LinearSRGBColorSpace
    this.dprMax = Math.min(devicePixelRatio || 1, 1.5)
    this.dpr = Math.min(this.dprMax, 1.25)
    r.setPixelRatio(this.dpr) // sin mapa de sombras: la sombra del Perú va en el shader del suelo
    r.domElement.style.display = 'block'
    r.domElement.style.width = '100%'
    r.domElement.style.height = '100%'
    r.domElement.style.touchAction = 'none'
    contenedor.prepend(r.domElement)
    r.domElement.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault()
      op.alPerderContexto?.()
    })
    this.renderer = r

    const c = new OrbitControls(this.camara, r.domElement)
    c.enableDamping = true
    c.maxPolarAngle = Math.PI * 0.47
    c.minDistance = 12
    c.maxDistance = 120
    c.autoRotateSpeed = 0.55
    // Sin desplazamiento: con clic derecho, Ctrl+arrastre, teclado o dos dedos el objetivo
    // salía del mapa sin límite. Girar y acercar alcanzan; los vuelos mueven el objetivo por código.
    c.enablePan = false
    this.controles = c

    this.escena.add(this.hemi)
    this.sol.position.copy(DIR_LUZ).multiplyScalar(60)
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
      // Canal UV 1 = (x, y) proyectado de cada vértice, también en las paredes: la textura de calor
      // pinta cada pared con el color de su borde (las UV laterales la estirarían en vertical)
      const pos = geom.attributes.position
      const uv1 = new Float32Array(pos.count * 2)
      for (let i = 0; i < pos.count; i++) {
        uv1[i * 2] = pos.getX(i)
        uv1[i * 2 + 1] = pos.getY(i)
      }
      geom.setAttribute('uv1', new THREE.BufferAttribute(uv1, 2))
      const malla = new THREE.Mesh(
        geom,
        conSombraDeContacto(
          new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.02 }),
          this.tapa,
        ),
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
      malla.userData = {
        id: z.id,
        h: 0.4,
        objetivo: 0.4,
        centro: new THREE.Vector3(),
        contorno,
        brillo: 0,
      }
      this.mapa.add(malla)
      this.mallas.push(malla)
      this.porId.set(z.id, malla)
    }
    const caja = new THREE.Box3().setFromObject(this.mapa)
    const centro = caja.getCenter(new THREE.Vector3())
    this.mapa.position.x -= centro.x
    this.mapa.position.z -= centro.z
    this.mapa.updateMatrixWorld(true)
    this.tapa.uOrigen.value.set(this.mapa.position.x, this.mapa.position.z)
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
    this.tapa.uMundo.value = vacio1
    this.tapa.uCaja.value.set(cx0, cz0, cx1 - cx0, cz1 - cz0)
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
          uNieve: u(new THREE.Color()),
          uRelieve: u(RELIEVE),
          uAgua: u(new THREE.Color()),
          uFrontera: u(new THREE.Color()),
          uLuzColor: u(new THREE.Color()),
          uBrillo: u(0.5),
        },
      ]),
      vertexShader: SUELO_VS,
      fragmentShader: SUELO_FS,
      defines: celular() ? { OLAS_SIMPLES: '' } : {},
      fog: true,
    })
    // UniformsUtils.merge clona: las texturas se asignan después
    matSuelo.uniforms.uMundo.value = vacio1
    matSuelo.uniforms.uMundo2.value = vacio2
    matSuelo.uniforms.uPeru.value = sombra
    const cargador = new THREE.TextureLoader()
    const base = import.meta.env.BASE_URL
    for (const [archivo, clave] of TEXTURAS_MUNDO)
      cargador.load(base + archivo, (tx) => {
        if (this.destruida) return tx.dispose() // el mapa se cerró mientras cargaba
        tx.flipY = false
        tx.minFilter = THREE.LinearMipmapLinearFilter
        tx.anisotropy = Math.min(4, r.capabilities.getMaxAnisotropy())
        tx.needsUpdate = true
        this.texturas.push(tx)
        matSuelo.uniforms[clave].value = tx
        if (clave === 'uMundo') this.tapa.uMundo.value = tx
        else this.leerElevacion(tx.image as CanvasImageSource)
        this.sucio = true
      })
    this.mar = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), matSuelo)
    this.mar.rotation.x = -Math.PI / 2
    this.mar.position.y = -PISO - 0.02
    this.mar.renderOrder = 2
    this.escena.add(this.mar)
    // Relieve: mismo material, malla densa solo en la caja. Va 1 cm encima del mar y se dibuja
    // antes, así el plano grande no vuelve a pintar esos píxeles (la prueba de profundidad los descarta).
    const seg = celular() ? 128 : 192
    this.relieve = new THREE.Mesh(new THREE.PlaneGeometry(cx1 - cx0, cz1 - cz0, seg, seg), matSuelo)
    this.relieve.rotation.x = -Math.PI / 2
    this.relieve.position.set((cx0 + cx1) / 2, this.mar.position.y + 0.01, (cz0 + cz1) / 2)
    this.relieve.renderOrder = 1
    this.relieve.frustumCulled = false // la caja de la geometría es plana; el relieve sube en el shader
    this.escena.add(this.relieve)

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
    for (let i = 0; i < EXTREMOS_VEG * 2; i++)
      this.etiquetasVeg.push({ id: '', el: nuevaEtiqueta('lbl3d') })
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
    this.muestras = muestrasLluvia(this.mapa.position)
    const particulas = crearParticulas()
    this.escena.add(particulas.puntos)

    // Nubes y su sombra: comparten geometría y uniforms; uTime y uTope son los de las gotas
    llenarNubes(this.nubes, this.geoNubes, particulas.puntos.material)
    this.escena.add(this.nubes)

    this.astro.position.copy(DIR_ASTRO).multiplyScalar(320) // lejos del plano «far» (600)
    this.astro.scale.setScalar(64)
    this.escena.add(this.astro)

    // Estrellas en la media cúpula de arriba (radio 450, dentro de far = 600)
    this.estrellas = crearEstrellas()
    this.escena.add(this.estrellas)

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
    this.bosque = new Bosque(this.escena)
    this.tip = nuevaEtiqueta('tip3d')
    this.tip.hidden = true
    this.tarjeta = crearTarjeta(capaEtiquetas)
    this.particulas = particulas

    // Dibujar en el mismo callback (antes de que el navegador pinte): sin cuadro en blanco
    const ro = new ResizeObserver(() => {
      this.redimensionar()
      if (!this.destruida) this.renderer.render(this.escena, this.camara)
    })
    ro.observe(contenedor)
    const io = new IntersectionObserver((es) => {
      this.fueraDePantalla = !es[0].isIntersecting
      this.sucio = true
    })
    io.observe(contenedor)
    this.observadores.push(ro, io)
    this.vigilarDpr(devicePixelRatio || 1)
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
      // Solo el botón principal (o el dedo) elige zona: el clic derecho no hace nada
      abajo = e.button === 0 ? [e.clientX, e.clientY] : null
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
    if (variable !== this.variable && !this.veg && !instantaneo) this.fundir()
    this.zonas = zonas
    this.variable = variable
    this.pintar()
    this.alturas(instantaneo)
    this.textosEtiquetas()
    this.actualizarParticulas()
    this.llenarTarjeta()
  }

  /**
   * Máquina del tiempo: cada zona sube o se hunde según cómo fue ese año frente a su
   * promedio. Las columnas se mueven suave porque las alturas se interpolan en cada cuadro.
   */
  setAnio(
    anio: { valores: Record<string, number>; max: number } | null,
    numero: number | null = null,
  ) {
    this.anio = anio
    this.numeroAnio = anio ? numero : null
    this.pintar()
    this.alturas(false)
    this.textosEtiquetas()
    this.actualizarParticulas()
    this.llenarTarjeta()
  }

  /** Malla del modo actual (la de vegetación o la de la variable), si ya llegó. */
  private get calor() {
    return this.calores.get(this.veg ? 'vegetacion' : this.variable) ?? null
  }

  /**
   * Malla por celda (temperatura, lluvia o vegetación). La textura se ubica con las coordenadas
   * proyectadas: las tapas de ExtrudeGeometry usan (x, y) de `proyectar` como UV, así que basta
   * escalar y desplazar. null = todavía cargando: cada modo conserva la que ya tenía.
   */
  setCalor(calor: Calor | null) {
    if (!calor) return
    const clave = claveCalor(calor)
    const antes = this.calores.get(clave)
    if (antes === calor) return
    if (clave === (this.veg ? 'vegetacion' : this.variable)) this.fundir()
    this.calores.set(clave, calor)
    if (antes) this.soltarTexturas(antes)
    if (clave === 'vegetacion') this.prepararVegetacion()
    this.pintar()
  }

  /** Textura de la malla `c` para un estado, pintada con el año y el tema actuales (se crea al primer uso). */
  private texturaCalor(c: Calor, tipo: TipoCalor) {
    let t = this.texCalor.get(c)
    if (!t) {
      t = { tex: {}, firma: '' }
      this.texCalor.set(c, t)
    }
    let tx = t.tex[tipo]
    if (!tx) {
      tx = new THREE.CanvasTexture(document.createElement('canvas'))
      tx.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      tx.channel = 1 // uv1: tapas y paredes con la posición proyectada
      tx.repeat.set(1 / (COSLAT * K * c.spanLon), 1 / (K * c.spanLat))
      tx.offset.set((LON0 - c.lonMin) / c.spanLon, (LAT0 - c.latMin) / c.spanLat)
      t.tex[tipo] = tx
      t.firma = '' // se pinta abajo, con las demás de la misma malla
    }
    const firma = `${this.numeroAnio}|${this.versionTema}`
    if (t.firma !== firma) {
      t.firma = firma
      dibujarCalor(this.lienzoCalor, c, this.numeroAnio)
      const panel = this.color('--panel')
      for (const [k, x] of Object.entries(t.tex) as [TipoCalor, THREE.CanvasTexture][]) {
        varianteCalor(x.image as HTMLCanvasElement, this.lienzoCalor, k, panel)
        x.needsUpdate = true
      }
    }
    return tx
  }

  private soltarTexturas(c: Calor) {
    for (const tx of Object.values(this.texCalor.get(c)?.tex ?? {})) tx.dispose()
    this.texCalor.delete(c)
  }

  /**
   * Guarda el color actual de cada tapa y empieza a fundirlo con el que viene (cuadro() lo anima):
   * al cambiar de modo los colores pasan de uno a otro en vez de saltar.
   */
  private fundir() {
    if (reducido() || !this.punteadas) return
    // Ya empezó en este mismo cuadro (al entrar o salir de Vegetación cambian la variable y la vista
    // de verdor juntas): se funde desde los colores de antes, no desde un paso intermedio
    if (this.fundido === 0) return
    for (const m of this.mallas) {
      const P = m.material.userData.previo as Previo
      const mapa = m.material.map
      P.uPrevio.value = mapa
      P.uPrevioMapa.value = mapa ? 1 : 0
      if (mapa) P.uPrevioUV.value.set(mapa.repeat.x, mapa.repeat.y, mapa.offset.x, mapa.offset.y)
      P.uPrevioColor.value.copy(m.material.color)
    }
    this.fundido = 0
    this.tapa.uFundido.value = 0
    this.sucio = true
  }

  /** Altitud (m) en un punto, interpolada entre los píxeles de mundo2.webp (NaN sin la textura). */
  private altitud = (lon: number, lat: number) => {
    const E = this.elevacion
    if (!E) return NaN
    const S = 1024
    const fx = ((lon - MUNDO.lon0) / (MUNDO.lon1 - MUNDO.lon0)) * S - 0.5
    const fy = ((MUNDO.lat1 - lat) / (MUNDO.lat1 - MUNDO.lat0)) * S - 0.5
    const x = Math.max(0, Math.min(S - 2, Math.floor(fx)))
    const y = Math.max(0, Math.min(S - 2, Math.floor(fy)))
    const tx = Math.min(1, Math.max(0, fx - x))
    const ty = Math.min(1, Math.max(0, fy - y))
    const i = y * S + x
    const arriba = E[i] + (E[i + 1] - E[i]) * tx
    const abajo = E[i + S] + (E[i + S + 1] - E[i + S]) * tx
    return ((arriba + (abajo - arriba) * ty) / 255) * 6000
  }

  /**
   * Con la malla de vegetación y la altitud (llegan en cualquier orden): NDVI, altitud y regiones
   * de cada departamento (alturas y ficha) y el bosque.
   */
  private prepararVegetacion() {
    const c = this.calores.get('vegetacion')
    if (!c || !this.elevacion) return
    this.ndvi = resumenPorDepto(c, this.localizar, this.altitud)
    // Como en lluvia y temperatura: solo se nombran los extremos (los más y los menos verdes)
    const { media, celdas } = this.ndvi
    const orden = DEPARTAMENTOS.map((_, k) => k)
      .filter((k) => celdas[k] > 0 && Number.isFinite(media[k]))
      .sort((a, b) => media[b] - media[a])
    const extremos = [...orden.slice(0, EXTREMOS_VEG), ...orden.slice(-EXTREMOS_VEG)]
    this.etiquetasVeg.forEach((e, i) => (e.id = DEPARTAMENTOS[extremos[i]]?.id ?? ''))
    this.textosVeg()
    this.bosque.plantar(
      c,
      this.altitud,
      this.localizar,
      (lon, lat) => {
        const v = proyectar([lon, lat])
        return [v.x + this.mapa.position.x, -v.y + this.mapa.position.z]
      },
      celular(),
    )
    if (this.veg) {
      this.alturas(false)
      this.llenarTarjeta()
    }
    this.sucio = true
  }

  /** Lee la altitud del suelo una vez (la imagen ya está cargada para el relieve). */
  private leerElevacion(img: CanvasImageSource) {
    const S = 1024
    const cv = document.createElement('canvas')
    cv.width = cv.height = S
    const g = cv.getContext('2d', { willReadFrequently: true })
    if (!g) return
    g.drawImage(img, 0, 0, S, S)
    const d = g.getImageData(0, 0, S, S).data
    const r = new Uint8ClampedArray(S * S)
    for (let i = 0; i < r.length; i++) r[i] = d[i * 4]
    this.elevacion = r
    this.prepararVegetacion()
  }

  /**
   * Vista de verdor (variable Vegetación): cada columna sube según el verdor medio (NDVI) de su
   * departamento, la tapa muestra el NDVI por celda (o el del año elegido) y crecen las plantas de
   * cada zona. La tendencia de cada departamento va en el informe.
   */
  setVegetacion(on: boolean) {
    if (this.veg === on) return
    this.fundir()
    this.veg = on
    this.pintar()
    this.alturas(false)
    this.textosEtiquetas()
    this.actualizarParticulas()
    this.llenarTarjeta()
    this.sucio = true
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
    this.acento.set(this.color('--accent'))
    const claro = esTemaClaro()
    // Neblina del horizonte: celeste de día, azul noche de noche (no depende del fondo de la página)
    const bruma = claro ? '#d3e3f0' : '#1b2235'
    if (this.escena.background instanceof THREE.Texture) this.escena.background.dispose()
    this.escena.background = texturaCielo(claro, bruma)
    if (this.escena.fog instanceof THREE.Fog) this.escena.fog.color.set(bruma)
    else this.escena.fog = new THREE.Fog(bruma, 95, 235)
    const fondo = this.color('--bg')
    const mar = this.color('--sea')
    const fg = this.color('--fg')
    const U = this.mar.material.uniforms
    U.uHondo.value.set(hexMix(mar, claro ? fg : '#000000', claro ? 0.18 : 0.4))
    U.uSomero.value.set(
      hexMix(mar, claro ? '#ffffff' : this.color('--accent-soft'), claro ? 0.35 : 0.2),
    )
    U.uEspuma.value.set(hexMix(mar, claro ? '#ffffff' : fg, claro ? 0.8 : 0.35))
    U.uSombra.value.set(hexMix(mar, '#000000', claro ? 0.35 : 0.6))
    // En claro, tierra seca y ocre de puna: antes las alturas salían casi blancas y parecían nieve
    U.uTierraBaja.value.set(hexMix(fondo, claro ? '#6f7d58' : fg, claro ? 0.35 : 0.08))
    U.uTierraAlta.value.set(hexMix(fondo, claro ? '#8b7656' : fg, claro ? 0.5 : 0.32))
    U.uNieve.value.set(claro ? '#ffffff' : hexMix(fondo, fg, 0.7))
    U.uAgua.value.set(hexMix(mar, claro ? fg : this.color('--accent-soft'), claro ? 0.25 : 0.35))
    U.uFrontera.value.set(hexMix(fondo, fg, claro ? 0.55 : 0.45))
    U.fogColor.value.set(bruma)
    U.fogNear.value = 95
    U.fogFar.value = 235
    // En claro, luz más suave para que los colores no se "quemen"
    this.hemi.intensity = (claro ? 0.78 : 0.8) * LUZ
    this.hemi.color.set(claro ? 0xf4f6f7 : 0xc9d8f0)
    this.hemi.groundColor.set(claro ? 0xa3aeb3 : 0x14202b)
    // Sol cálido de día, luz fría de luna de noche (mismas intensidades: los datos se leen igual)
    this.sol.intensity = (claro ? 0.4 : 0.8) * LUZ
    this.sol.color.set(claro ? 0xfff1dc : 0xd4defa)
    U.uLuzColor.value.copy(this.sol.color)
    U.uBrillo.value = claro ? 0.55 : 0.4
    this.astro.material.map?.dispose()
    this.astro.material.map = texturaAstro(claro)
    this.astro.material.needsUpdate = true
    this.estrellas.visible = !claro
    if (this.punteadas) Object.values(this.punteadas).forEach((t) => t.dispose())
    this.punteadas = {
      up: texturaPunteada(this.color('--map-up')),
      down: texturaPunteada(this.color('--map-down')),
      green: texturaPunteada(this.color('--map-green')),
    }
    this.versionTema++ // las mallas se repintan con los colores nuevos al usarse
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

  /**
   * Zona bajo el puntero: cambia el contorno de 2 departamentos y llena la ficha. La elevación y el
   * brillo entran suave en cuadro(); aquí no se recompila ningún material.
   */
  private setHover(id: string | null) {
    if (id === this.hover) return
    const antes = this.hover ? this.porId.get(this.hover) : undefined
    this.hover = id
    if (antes) this.pintarContorno(antes)
    const m = id ? this.porId.get(id) : undefined
    if (m) this.pintarContorno(m)
    this.llenarTarjeta()
    this.renderer.domElement.style.cursor = id && this.modo === 'explorar' ? 'pointer' : ''
    this.sucio = true
  }

  /** Contorno: acento si está elegida, color del texto si está bajo el puntero, punteado si hay pocos datos. */
  private pintarContorno(m: Malla) {
    const d = this.zonas[m.userData.id]
    if (!d) return
    const pocos = d.status === 'pocos_datos'
    const lm = m.userData.contorno.material
    lm.color.set(
      m.userData.id === this.sel
        ? this.color('--accent')
        : m.userData.id === this.hover
          ? this.color('--fg')
          : this.color(pocos ? '--muted' : '--bg'),
    )
    lm.dashSize = pocos ? 0.35 : 1
    lm.gapSize = pocos ? 0.25 : 0.0001
  }

  /**
   * Ficha técnica del departamento bajo el puntero: cambio por década (o anomalía del año), estado,
   * rango probable (IC 95 %) dibujado frente al cero, q y años. Patrón de tooltip de deck.gl.
   */
  private llenarTarjeta() {
    const T = this.tarjeta
    const id = this.hover
    const d = id && !this.veg ? this.zonas[id] : undefined
    // Modo Vegetación: el NDVI medio del departamento (no su lluvia ni su temperatura)
    const k = id && this.veg ? DEPARTAMENTOS.findIndex((z) => z.id === id) : -1
    const veg = this.calores.get('vegetacion')
    const c =
      id && d
        ? datosTarjeta(d, this.variable, this.idioma, this.anio?.valores[id])
        : id && k >= 0 && this.ndvi && veg && Number.isFinite(this.ndvi.media[k])
          ? datosTarjetaVeg(
              id,
              this.ndvi.media[k],
              this.ndvi.celdas[k],
              [veg.anio0, veg.anio0 + veg.anios - 1],
              this.idioma,
              this.ndvi.altitud[k],
              REGIONES.map((_, r) => this.ndvi!.regiones[k * 3 + r]),
            )
          : null
    T.raiz.classList.toggle('on', !!c)
    if (!c) return
    const fuerte = document.createElement('strong')
    const chico = document.createElement('small')
    fuerte.textContent = c.valor
    chico.textContent = c.unidad
    T.nombre.textContent = c.nombre
    T.valor.replaceChildren(fuerte, chico)
    T.estado.textContent = c.estado
    T.raiz.dataset.estado = c.datos.estado
    T.raiz.dataset.clave = c.datos.clave
    T.ic.hidden = !c.ic
    if (c.ic) {
      T.rango.style.left = c.ic.left
      T.rango.style.width = c.ic.width
      T.punto.style.left = c.ic.punto
    }
    T.meta.textContent = c.meta
    T.ancho = T.raiz.offsetWidth
    T.alto = T.raiz.offsetHeight
    this.posEtiqueta.delete(T.raiz)
  }

  setTextoOceano(t: string) {
    this.etiquetaOceano.textContent = t
    this.sucio = true
  }

  setIdioma(idioma: 'es' | 'en') {
    this.idioma = idioma
    if (this.animalHover) this.llenarTip(this.animalHover)
    this.llenarTarjeta()
    for (const p of this.etiquetasPais) p.el.textContent = idioma === 'en' ? p.en : p.es
    this.textosVeg()
    this.sucio = true
  }

  /**
   * Globo del personaje: nombre, dato curioso y, al final, lo que dicen los datos de la NASA de su
   * departamento (variable y año que se ven en el mapa). Todo como texto, nunca HTML.
   */
  private llenarTip(a: Animal) {
    const { nombre, dato, dept } = this.fauna.texto(a, this.idioma)
    const anio =
      this.anio && this.numeroAnio != null
        ? { numero: this.numeroAnio, valor: this.anio.valores[dept] }
        : null
    // En el modo Vegetación el mapa muestra el verdor, no la lluvia: el globo habla de lo mismo
    const k = this.veg ? DEPARTAMENTOS.findIndex((z) => z.id === dept) : -1
    const ndvi = this.veg ? (k >= 0 ? (this.ndvi?.media[k] ?? null) : null) : undefined
    const clima = lineaClima(dept, this.zonas?.[dept], this.variable, this.idioma, anio, ndvi)
    const linea = (clase: string, texto: string) => {
      const s = document.createElement('span')
      s.className = clase
      s.textContent = texto
      return s
    }
    this.tip.replaceChildren(
      linea('tip3d-nombre', nombre),
      linea('tip3d-dato', dato),
      ...(clima ? [linea('tip3d-clima', clima)] : []),
    )
  }

  /** Personaje bajo el puntero: salta y muestra su dato (como texto, nunca HTML). */
  private setAnimal(a: Animal | null, x = 0, y = 0) {
    if (a && a !== this.animalHover) this.fauna.saltar(a)
    this.animalHover = a
    if (!a) {
      this.tip.hidden = true
      this.renderer.domElement.style.cursor =
        this.hover && this.modo === 'explorar' ? 'pointer' : ''
      return
    }
    const b = this.contenedor.getBoundingClientRect()
    this.llenarTip(a)
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
        claro ? '#2a1f17' : '#ffffff',
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
    const pesos: number[] = []
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      let w = 0
      if (d && d.status !== 'pocos_datos') {
        const valorAnio = this.anio?.valores[m.userData.id]
        if (this.anio) w = valorAnio != null ? Math.max(0, valorAnio / this.anio.max) : 0
        else if (d.status === 'real' && d.slope_per_decade > 0) w = d.slope_per_decade / maxPos
      }
      total += w
      pesos.push(w)
      acumulado.push(total)
    }
    /** Departamento al azar, con probabilidad proporcional a su peso. */
    const sortear = () => {
      const r = Math.random() * total
      const k = acumulado.findIndex((c) => c >= r)
      return k < 0 ? 0 : k
    }
    const porPeso = calor ? 70 : this.anio ? 260 : 520
    const cuenta = Math.min(N_PARTICULAS, Math.round(total * porPeso))
    // Se reparten una vez por cambio de datos; luego solo se mueven en la GPU
    const pos = P.geo.attributes.position.array as Float32Array
    const semilla = P.geo.attributes.aSemilla.array as Float32Array
    let n = 0
    for (let i = 0; i < cuenta; i++) {
      const k = sortear()
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
    P.puntos.visible = !reducido() && n > 0 && !this.veg
    // Nubes solo con lluvia: más y más grises donde llueve más (se ven también con «reducir movimiento», quietas)
    const aNube = this.geoNubes.attributes.aNube as THREE.InstancedBufferAttribute
    const wMax = Math.max(0.0001, ...pesos)
    let m = 0
    if (!calor && n > 0 && !this.veg)
      for (let i = 0; i < Math.min(N_NUBES, Math.ceil(total * 3)); i++) {
        const k = sortear()
        const s = this.muestras[k]
        if (!s || !s.length) continue
        const p = s[(Math.random() * s.length) | 0]
        aNube.array.set([p[0], p[1], k, pesos[k] / wMax], m * 4)
        m++
      }
    this.geoNubes.instanceCount = m
    aNube.needsUpdate = true
    this.nubes.visible = m > 0
    const uNube = (this.nubes.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>)
      .material.uniforms
    uNube.uColor.value.set(claro ? '#f4f7f9' : hexMix(this.color('--bg'), '#9aa6b2', 0.6))
    this.pasoParticulas(0)
    this.sucio = true
  }

  /** Por cuadro: el reloj y la altura de cada departamento (nada por partícula). */
  private pasoParticulas(dt: number) {
    const P = this.particulas
    if (!P.puntos.visible && !this.nubes.visible) return // las nubes también leen uTope
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
    this.seleccionar(null, false) // la vista inicial no marca ninguna zona
    this.vista(false)
  }

  /**
   * Cambia entre la portada y el explorador sin recrear la escena: la cámara vuela de una vista
   * a la otra y el Perú se corre a su lugar. Antes se destruía todo y se volvía a cargar.
   */
  setModo(modo: ModoMapa) {
    if (modo === this.modo) return
    this.modo = modo
    this.setHover(null)
    this.setAnimal(null)
    if (modo === 'inicio') this.seleccionar(null, false)
    this.vista(false, 1600) // vuelo largo y suave entre la portada y el explorador
    this.sucio = true
  }

  /** Ancho (px) que el informe tapa a la derecha del mapa en el explorador. */
  setPanel(px: number) {
    this.panel = px
    this.sucio = true
  }

  /** Hacia dónde debe ir el corrimiento según el modo y el ancho. */
  private corrimientoObjetivo() {
    if (celular()) return 0 // en celular el mapa va arriba y el texto abajo
    return this.modo === 'inicio' ? this.ancho * 0.24 : -this.panel / 2
  }

  private aplicarCorrimiento() {
    if (Math.abs(this.corrimiento) < 0.5) this.camara.clearViewOffset()
    else
      this.camara.setViewOffset(this.ancho, this.alto, -this.corrimiento, 0, this.ancho, this.alto)
  }

  destruir() {
    this.destruida = true
    clearTimeout(this.tipTimer)
    this.renderer.setAnimationLoop(null)
    this.quitarEventos()
    this.observadores.forEach((o) => o.disconnect())
    this.abortar.abort()
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
    this.geoNubes.dispose()
    for (const c of this.nubes.children) {
      const mat = (c as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material
      mat.uniforms.uMapa.value.dispose() // compartida: dispose dos veces no falla
      mat.dispose()
    }
    this.astro.material.map?.dispose()
    this.astro.material.dispose()
    this.estrellas.geometry.dispose()
    this.estrellas.material.dispose()
    this.mar.geometry.dispose()
    this.relieve.geometry.dispose()
    this.mar.material.dispose()
    this.texturas.forEach((t) => t.dispose())
    for (const c of [...this.texCalor.keys()]) this.soltarTexturas(c)
    this.bosque.destruir()
    if (this.escena.background instanceof THREE.Texture) this.escena.background.dispose()
    if (this.punteadas) Object.values(this.punteadas).forEach((t) => t.dispose())
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.capaEtiquetas.replaceChildren()
  }

  private pintar() {
    if (!this.punteadas) return
    // Con malla (temperatura o lluvia): la tapa muestra el color por celda; el estado va en punteado y opacidad
    const c = this.calor
    const malla = c && tieneAnio(c, this.numeroAnio) ? c : null
    for (const m of this.mallas) {
      const d = this.zonas[m.userData.id]
      if (!d) continue
      const mat = m.material
      const clave = claveMapa(d.slope_per_decade, this.variable)
      let mapa: THREE.Texture | null = null
      let transparente = false
      let opacidad = 1
      const valorAnio = this.anio?.valores[m.userData.id]
      if (this.veg && malla) {
        // Vista de verdor: el NDVI por celda, pleno (la tendencia va en el informe)
        mat.color.set(0xffffff)
        mapa = this.texturaCalor(malla, 'real')
      } else if (this.veg) {
        // Sin malla todavía: el departamento queda de fondo, sin dato
        mat.color.set(this.color('--muted'))
        transparente = true
        opacidad = 0.22
      } else if (malla) {
        // Opaco siempre: el estado va pintado en la textura (punteado o velo), sin columnas cortadas
        mat.color.set(0xffffff)
        mapa = this.texturaCalor(
          malla,
          d.status === 'real' ? 'real' : d.status === 'posible_casualidad' ? 'punteado' : 'apagado',
        )
      } else if (this.anio && valorAnio != null)
        mat.color.set(colorAnomalia(valorAnio, this.anio.max, this.variable))
      else if (d.status === 'real') mat.color.set(this.color(`--map-${clave}`))
      else if (d.status === 'posible_casualidad') {
        mat.color.set(0xffffff)
        mapa = this.punteadas[clave]
        transparente = true
        opacidad = 0.82
      } else {
        mat.color.set(this.color('--muted'))
        transparente = true
        opacidad = 0.16
      }
      // Recompilar el shader solo si cambia lo que lo define (textura, transparencia o modo calor)
      const conCalor = !!malla
      const defs = (mat.defines ??= {})
      if (!!mat.map !== !!mapa || mat.transparent !== transparente || 'CALOR' in defs !== conCalor)
        mat.needsUpdate = true
      if (conCalor) defs.CALOR = ''
      else delete defs.CALOR
      // Algo de brillo en el calor: la luz recorre las tapas grandes (selva) y no se ven planas
      mat.roughness = conCalor ? 0.5 : 0.75
      mat.map = mapa
      mat.transparent = transparente
      mat.opacity = opacidad
      mat.emissive.copy(this.acento).multiplyScalar(BRILLO_HOVER * m.userData.brillo)
      this.pintarContorno(m)
    }
    this.sucio = true
  }

  private alturas(instantaneo: boolean) {
    const max = Math.max(...Object.values(this.zonas).map((d) => Math.abs(d.slope_per_decade))) || 1
    // Modo Vegetación: la altura es el verdor medio (la selva arriba, el desierto de la costa abajo)
    const ndvi = this.veg ? this.ndvi?.media : undefined
    const maxNdvi = ndvi ? Math.max(...ndvi.filter(Number.isFinite)) || 1 : 1
    this.mallas.forEach((m, i) => {
      const d = this.zonas[m.userData.id]
      if (!d && !ndvi) return
      const valorAnio = this.anio?.valores[m.userData.id]
      const h = ndvi
        ? (Math.max(0, ndvi[i]) / maxNdvi) * ALTURA_MAX
        : !d || d.status === 'pocos_datos' || this.veg
          ? 0.05
          : this.anio && valorAnio != null
            ? Math.max(-1.1, Math.min(1.1, valorAnio / this.anio.max)) * ALTURA_MAX
            : (d.slope_per_decade / max) * ALTURA_MAX
      m.userData.objetivo = Math.max(ESCALA_MIN, PISO + h)
      if (instantaneo || reducido()) {
        m.userData.h = m.userData.objetivo
        m.scale.z = m.userData.h
      }
    })
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

  /** Nombre y NDVI medio de cada departamento extremo del modo Vegetación. */
  private textosVeg() {
    if (!this.ndvi) return
    for (const e of this.etiquetasVeg) {
      if (!e.id) continue
      const k = DEPARTAMENTOS.findIndex((d) => d.id === e.id)
      const small = document.createElement('small')
      small.textContent =
        'NDVI ' +
        this.ndvi.media[k].toLocaleString(this.idioma, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      e.el.replaceChildren(NOMBRE[e.id], small)
      e.el.classList.toggle('sel', e.id === this.sel)
    }
    this.sucio = true
  }

  private textosEtiquetas() {
    for (const L of this.etiquetas) {
      this.texto(L.el, L.id)
      L.el.classList.toggle('sel', L.id === this.sel)
    }
    for (const e of this.etiquetasVeg) e.el.classList.toggle('sel', e.id === this.sel)
    // En el modo Vegetación no va la etiqueta con el valor del departamento elegido
    const aparte = !this.veg && !!this.sel && !conEtiquetaFija(this.sel)
    this.etiquetaSel.hidden = !aparte
    if (aparte && this.sel) this.texto(this.etiquetaSel, this.sel)
    this.sucio = true
  }

  private formatearAnomalia(a: number) {
    const signo = a > 0 ? '+' : a < 0 ? '−' : ''
    if (this.variable === 'vegetacion')
      return signo + Math.abs(a).toFixed(2).replace('.', ',') + ' NDVI'
    return this.variable === 'temperatura'
      ? signo + Math.abs(a).toFixed(1).replace('.', ',') + ' °C'
      : signo + Math.round(Math.abs(a) * 100) + ' %'
  }

  private formatear(v: number) {
    const signo = v > 0 ? '+' : v < 0 ? '−' : ''
    if (this.variable === 'vegetacion')
      return signo + Math.abs(v).toFixed(3).replace('.', ',') + ' NDVI'
    return this.variable === 'temperatura'
      ? signo + Math.abs(v).toFixed(2).replace('.', ',') + ' °C'
      : signo + Math.round(Math.abs(v)) + ' mm'
  }

  private vista(instantaneo: boolean, dur = 1100) {
    const v = VISTAS[this.modo]
    const a = this.camara.aspect
    // En pantallas angostas, la cámara se aleja para que el Perú entre completo (v12)
    const k = a >= 1 ? 1 : this.modo === 'inicio' ? 1.05 : a < 0.85 ? 1.6 : 1.35
    this.volarCamara(
      new THREE.Vector3(v.pos[0] * k, v.pos[1] * k, v.pos[2] * k),
      new THREE.Vector3(v.tgt[0], v.tgt[1], v.tgt[2]),
      instantaneo,
      dur,
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

  private volarCamara(pos: THREE.Vector3, tgt: THREE.Vector3, instantaneo: boolean, dur = 1100) {
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
      dur,
    }
  }

  /**
   * El zoom del navegador (Ctrl +/-) cambia devicePixelRatio: la resolución del lienzo lo sigue.
   * Se escala en la misma proporción, así el búfer conserva sus píxeles (nítido y igual de rápido);
   * el ajuste adaptativo (vigilarRendimiento) corrige desde ahí.
   */
  private vigilarDpr(previo: number) {
    matchMedia(`(resolution: ${previo}dppx)`).addEventListener(
      'change',
      () => {
        const actual = devicePixelRatio || 1
        this.dprMax = Math.min(actual, 1.5)
        this.dpr = Math.max(0.5, Math.min(this.dprMax, (this.dpr * actual) / previo))
        this.perf.pendiente = true // se aplica al empezar el próximo cuadro
        this.sucio = true
        this.vigilarDpr(actual) // la consulta vieja ya no sirve: se registra la nueva
      },
      { once: true, signal: this.abortar.signal },
    )
  }

  private redimensionar() {
    const w = this.contenedor.clientWidth || 1
    const h = this.contenedor.clientHeight || 1
    this.ancho = w
    this.alto = h
    this.renderer.setSize(w, h, false)
    this.camara.aspect = w / h
    this.camara.updateProjectionMatrix()
    this.corrimiento = this.corrimientoObjetivo()
    this.aplicarCorrimiento()
    // tamaño de los puntos en píxeles del búfer, como hace PointsMaterial
    if (this.particulas)
      this.particulas.puntos.material.uniforms.uEscala.value =
        (h * this.renderer.getPixelRatio()) / 2
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
          // Equipo lento: sin malla de relieve (el mar plano sigue con el color y el sombreado)
          this.relieve.visible = nuevo >= DPR_RELIEVE
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
    const quieto = reducido()
    // Interpolaciones por tiempo y no por cuadro: igual de suaves a 30, 60 o 120 cuadros/s
    // (f es lo que avanzan en un cuadro a 60/s, como antes)
    const suave = (f: number) => 1 - Math.pow(1 - f, dt * 60)
    const dc = this.corrimientoObjetivo() - this.corrimiento
    if (Math.abs(dc) > 0.5) {
      this.corrimiento += quieto ? dc : dc * suave(0.12)
      this.aplicarCorrimiento()
      moviendo = true
    }
    const kh = suave(this.anio || this.veg ? 0.07 : 0.12)
    const kz = suave(0.2)
    this.mallas.forEach((m, i) => {
      const id = m.userData.id
      const dh = m.userData.objetivo - m.userData.h
      const eleva = id === this.sel ? ELEVA_SEL : id === this.hover ? ELEVA_HOVER : 0
      const dz = -PISO + eleva - m.position.z
      const db = (id === this.hover ? 1 : 0) - m.userData.brillo
      if (Math.abs(dh) > 0.002 || Math.abs(dz) > 0.002) {
        moviendo = true
        m.userData.h += dh * kh
        m.scale.z = m.userData.h
        m.position.z += dz * kz
      }
      if (db !== 0) {
        // entra rápido y sale más lento; con «reducir movimiento», de golpe
        m.userData.brillo =
          quieto || Math.abs(db) < 0.01
            ? m.userData.brillo + db
            : m.userData.brillo + db * suave(db > 0 ? 0.35 : 0.18)
        m.material.emissive.copy(this.acento).multiplyScalar(BRILLO_HOVER * m.userData.brillo)
        moviendo = true
      }
      this.topes[i] = m.position.z + m.scale.z
    })
    // Cambio de modo: el color de las tapas pasa del anterior al nuevo (curva suave)
    if (this.fundido < 1) {
      this.fundido = quieto ? 1 : Math.min(1, this.fundido + dt / FUNDIDO)
      const f = this.fundido
      this.tapa.uFundido.value = f * f * (3 - 2 * f)
      moviendo = true
    }
    // Las plantas crecen (o se van) sobre la cara de cada departamento, que también se mueve
    const conPlantas = this.veg && this.modo === 'explorar'
    if (this.bosque.paso(dt, conPlantas, this.topes, quieto)) moviendo = true
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

  /** La ficha sigue la cara superior del departamento; no se sale del mapa y baja si no cabe arriba. */
  private ubicarTarjeta() {
    const m = this.hover ? this.porId.get(this.hover) : undefined
    if (!m) return
    const T = this.tarjeta
    const v = this.v3
      .set(m.userData.centro.x, m.position.z + m.scale.z + 0.3, m.userData.centro.z)
      .project(this.camara)
    const mitad = T.ancho / 2 + 8
    const x = Math.min(this.ancho - mitad, Math.max(mitad, ((v.x + 1) / 2) * this.ancho))
    const y = ((1 - v.y) / 2) * this.alto
    const abajo = y - T.alto - 22 < 8
    const tf = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) translate(-50%, ${abajo ? '22px' : 'calc(-100% - 22px)'})`
    if (this.posEtiqueta.get(T.raiz) === tf) return
    this.posEtiqueta.set(T.raiz, tf)
    T.raiz.style.transform = tf
  }

  private ubicarEtiquetas() {
    // En celular la portada no lleva etiquetas de departamentos (v12)
    const apretado = celular() && this.modo === 'inicio'
    const malla = (id: string) => this.porId.get(id)
    // En el modo Vegetación las etiquetas de departamento (con lluvia o temperatura) no van
    const sinDeptos = apretado || this.veg
    for (const L of this.etiquetas) {
      const oculta = sinDeptos || !conEtiquetaFija(L.id)
      if (L.el.hidden !== oculta) L.el.hidden = oculta
      if (oculta) continue
      const m = malla(L.id)!
      this.ubicarEtiqueta(
        L.el,
        m.userData.centro.x,
        m.position.z + m.scale.z + 0.4,
        m.userData.centro.z,
        DESPLAZA_ETIQUETA[L.id],
      )
    }
    // La etiqueta suelta (zona elegida sin etiqueta fija) también sigue al ancho de la pantalla
    const aparte = !!this.sel && !conEtiquetaFija(this.sel) && !sinDeptos
    if (this.etiquetaSel.hidden === aparte) this.etiquetaSel.hidden = !aparte
    if (aparte && this.sel) {
      const m = malla(this.sel)
      if (m)
        this.ubicarEtiqueta(
          this.etiquetaSel,
          m.userData.centro.x,
          m.position.z + m.scale.z + 0.4,
          m.userData.centro.z,
        )
    }
    // Vista de verdor (solo en el explorador)
    const conVeg = this.veg && this.modo === 'explorar'
    // Departamentos extremos (en celular, 2 de cada punta), sobre su columna como en lluvia y temperatura
    this.etiquetasVeg.forEach((e, i) => {
      const m = e.id ? malla(e.id) : undefined
      const ver = conVeg && !!m && (!celular() || i % EXTREMOS_VEG < 2)
      if (e.el.hidden === ver) e.el.hidden = !ver
      if (ver && m)
        this.ubicarEtiqueta(
          e.el,
          m.userData.centro.x,
          m.position.z + m.scale.z + 0.4,
          m.userData.centro.z,
        )
    })
    for (const p of this.etiquetasPais) {
      // En celular no se muestran los nombres de países (v12)
      if (p.el.hidden !== celular()) p.el.hidden = celular()
      if (!p.el.hidden) this.ubicarEtiqueta(p.el, p.x, -PISO, p.z)
    }
    this.ubicarTarjeta()
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
