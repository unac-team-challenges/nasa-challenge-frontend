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
import {
  COLOR_TENDENCIA,
  LUGARES_VEGETACION,
  type LugarVegetacion,
} from '@/features/mapa/utils/vegetacion'

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
const LON0 = -75.0
const LAT0 = -9.2
const K = 2.2
const COSLAT = Math.cos((LAT0 * Math.PI) / 180)
/** Desde r155 las luces son físicas: ×π para igualar las intensidades de r128. */
const LUZ = Math.PI
/**
 * Hacia el sol/luna. En el hemisferio sur el sol va por el norte (-z): queda al frente de la
 * cámara de inicio. Es la luz, la sombra del Perú y la de las nubes.
 */
const DIR_LUZ = new THREE.Vector3(5, 45, -45).normalize()
/**
 * El disco va en el mismo rumbo pero bajo, a ~4° sobre el horizonte: así entra en la franja de
 * cielo de la vista de inicio y su reflejo cruza el mar hacia la cámara (camino de luz).
 */
const DIR_ASTRO = new THREE.Vector3(DIR_LUZ.x, 0, DIR_LUZ.z).normalize().setY(0.07).normalize()
/** Altura efectiva de la sombra del Perú (calibrada: con DIR_LUZ da el corrimiento de antes). */
const SOMBRA = 2.4
/** Nubes sobre el tope de su departamento: justo donde nacen las gotas (h = 9 en PARTICULAS_VS). */
const ALTO_NUBE = 9.4
const N_NUBES = 12
const glsl = (v: THREE.Vector3) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`
/** Zonas con etiqueta flotante. */
const CLAVE = ['24', '20', '15', '21', '16', '08']
/** En celular solo estas llevan etiqueta fija (Tumbes y Piura quedaban bajo los paneles); la elegida siempre tiene la suya. */
const CLAVE_CELULAR = ['15', '21', '16', '08']
const DESPLAZA_ETIQUETA: Record<string, number> = { '24': -30 } // Tumbes queda pegado a Piura
const VISTAS: Record<ModoMapa, { pos: number[]; tgt: number[] }> = {
  // Más baja que antes: deja una franja de cielo arriba con el sol o la luna
  inicio: { pos: [8, 19, 72], tgt: [0, 5, 2] },
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

/**
 * Nubes de lluvia y su sombra: una sola geometría instanciada (x, z, departamento, peso) para las
 * dos pasadas. La altura sale de uTope y el vaivén de uTime, los mismos objetos que usan las gotas:
 * la GPU hace todo, el CPU no toca nada por cuadro.
 */
const NUBE_VS = `
uniform float uTime;
uniform float uTope[${DEPARTAMENTOS.length}];
attribute vec4 aNube; // x, z, departamento, peso 0..1
varying vec2 vUv;
varying float vPeso;
const vec3 LUZ = ${glsl(DIR_LUZ)};
#include <fog_pars_vertex>
void main() {
  float tope = uTope[int(aNube.z + 0.5)];
  float tam = 1.6 + 2.0 * aNube.w; // chicas y translúcidas: nunca tapan el dato
  vec3 c = vec3(aNube.x + sin(uTime * 0.12 + aNube.x) * 0.6, tope + ${ALTO_NUBE.toFixed(1)}, aNube.y);
  vUv = uv;
  vPeso = aNube.w;
#ifdef SOMBRA
  // Plana sobre el departamento, corrida en sentido contrario a la luz
  c.xz -= LUZ.xz / LUZ.y * ${ALTO_NUBE.toFixed(1)};
  c.y = tope + 0.03;
  vec4 mvPosition = viewMatrix * vec4(c + vec3(position.x * 2.0, 0.0, -position.y) * tam, 1.0);
#else
  // Siempre de frente a la cámara
  vec4 mvPosition = viewMatrix * vec4(c, 1.0);
  mvPosition.xy += position.xy * vec2(2.0, 1.0) * tam;
#endif
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`
const NUBE_FS = `
uniform sampler2D uMapa;
uniform vec3 uColor;
varying vec2 vUv;
varying float vPeso;
#include <fog_pars_fragment>
void main() {
  float a = texture2D(uMapa, vUv).a;
#ifdef SOMBRA
  gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.14);
#else
  gl_FragColor = vec4(uColor * mix(1.0, 0.78, vPeso), a * 0.75); // más lluvia, nube más gris
#endif
  if (gl_FragColor.a < 0.01) discard;
  #include <fog_fragment>
}`

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const celular = () => matchMedia('(max-width: 900px)').matches
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
}

const proyectar = ([lon, lat]: number[]) =>
  new THREE.Vector2((lon - LON0) * COSLAT * K, (lat - LAT0) * K)

/**
 * Suelo de Sudamérica en un solo shader: mar con profundidad sugerida, costa con espuma y
 * oleaje, tierra con sombreado suave del relieve real, ríos, lagos y fronteras tenues.
 * Las texturas se precalculan con scripts/generar_mundo.py (SRTM/ETOPO1 y Natural Earth).
 */
const MUNDO = { lon0: -110, lon1: -30, lat0: -60, lat1: 25 } // caja de public/mapa/mundo*.png
/** Exageración vertical del relieve: 6000 m de altura son RELIEVE unidades (~×15). */
const RELIEVE = 1.8
/** Por debajo de esta resolución adaptativa (equipo lento) el relieve deja de subir. */
const DPR_RELIEVE = 0.7
const SUELO_VS = `
uniform sampler2D uMundo, uMundo2, uPeru;
uniform vec4 uCaja, uCajaPeru;
uniform float uRelieve;
varying vec3 vW;
#include <fog_pars_vertex>
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  // Relieve real de los vecinos (SRTM): sube solo la tierra, nunca dentro del Perú (ahí están las columnas)
  vec2 uv = (w.xz - uCaja.xy) / uCaja.zw;
  if (uRelieve > 0.0 && all(greaterThan(uv, vec2(0.0))) && all(lessThan(uv, vec2(1.0)))) {
    float tierra = smoothstep(0.5, 0.62, texture2D(uMundo, uv).g);
    float peru = texture2D(uPeru, (w.xz - uCajaPeru.xy) / uCajaPeru.zw).g;
    w.y += texture2D(uMundo2, uv).r * tierra * (1.0 - smoothstep(0.02, 0.3, peru)) * uRelieve;
  }
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`
const SUELO_FS = `
uniform float uTime;
uniform sampler2D uMundo, uMundo2, uPeru;
uniform vec4 uCaja, uCajaPeru;
uniform vec3 uHondo, uSomero, uEspuma, uSombra, uTierraBaja, uTierraAlta, uNieve, uAgua, uFrontera;
uniform vec3 uLuzColor;
uniform float uBrillo;
varying vec3 vW;
const vec3 LUZ = ${glsl(DIR_LUZ)};
const vec3 ASTRO = ${glsl(DIR_ASTRO)};
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
  // Olas: cuatro ondas en direcciones distintas; altura y normal con fórmula exacta (sin texturas)
  vec2 p = vW.xz;
  const vec3 w1 = vec3(0.8, 0.6, 0.9), w2 = vec3(-0.5, 0.86, 1.4), w3 = vec3(0.2, -0.98, 2.3),
             w4 = vec3(-0.9, -0.44, 4.1);
#ifdef OLAS_SIMPLES
  // Celular: solo las dos ondas grandes (la mitad de senos por píxel)
  vec2 f = vec2(dot(p, w1.xy) * w1.z, dot(p, w2.xy) * w2.z) + uTime * vec2(0.9, 1.3);
  const vec2 amp = vec2(0.08, 0.055);
  vec2 c = amp * cos(f);
  vec2 g = w1.xy * w1.z * c.x + w2.xy * w2.z * c.y;
  float h = dot(amp, sin(f)) / (amp.x + amp.y); // -1..1
#else
  vec4 f = vec4(dot(p, w1.xy) * w1.z, dot(p, w2.xy) * w2.z, dot(p, w3.xy) * w3.z, dot(p, w4.xy) * w4.z)
         + uTime * vec4(0.9, 1.3, 1.9, 2.6);
  const vec4 amp = vec4(0.08, 0.055, 0.03, 0.015);
  vec4 c = amp * cos(f);
  vec2 g = w1.xy * w1.z * c.x + w2.xy * w2.z * c.y + w3.xy * w3.z * c.z + w4.xy * w4.z * c.w;
  float h = dot(amp, sin(f)) / dot(amp, vec4(1.0)); // -1..1
#endif
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 v = normalize(cameraPosition - vW);
  float olas = 1.0 - lejos * 0.6; // calmas junto a la costa, vivas mar adentro
  mar *= mix(1.0, 0.72 + 0.56 * max(dot(n, LUZ), 0.0), olas);                  // luz y sombra de cada ola
  mar = mix(mar, uHondo, (1.0 - smoothstep(-0.9, -0.2, h)) * 0.35 * olas);      // valles más hondos
  mar = mix(mar, uEspuma, smoothstep(0.25, 1.0, h) * 0.32 * olas);            // crestas claras
  mar = mix(mar, uSomero, pow(1.0 - max(v.y, 0.0), 4.0) * 0.3);               // fresnel: más claro al ras
  mar += uLuzColor * pow(max(dot(reflect(-ASTRO, n), v), 0.0), 40.0) * uBrillo; // camino de luz del sol o la luna
  float banda = smoothstep(0.1, 0.36, cerca) * (1.0 - smoothstep(0.4, 0.47, cerca));
  float corte = 0.6 + 0.4 * sin(p.x * 3.1 + uTime) * sin(p.y * 2.7 - uTime * 0.8); // espuma que se corta y viaja
  mar = mix(mar, uEspuma, banda * (0.45 + 0.3 * sin(cerca * 40.0 - uTime * 1.5)) * corte);
  // Color por altitud (t2.r = elevación / 6000 m), nieve solo sobre ~5200 m y sombreado real del relieve (t.r)
  vec3 suelo = mix(uTierraBaja, uTierraAlta, smoothstep(0.02, 0.7, t2.r));
  suelo = mix(suelo, uNieve, smoothstep(0.86, 0.95, t2.r));
  suelo *= 0.62 + 0.7 * t.r;
  suelo = mix(suelo, uAgua, t2.g * 0.55);
  suelo = mix(suelo, uFrontera, t2.b * 0.45);
  vec3 col = mix(mar, suelo, tierra);
  // sombra suave del Perú, corrida según la luz: los departamentos se "apoyan" en el suelo
  vec2 pv = (vW.xz + LUZ.xz / LUZ.y * ${SOMBRA.toFixed(2)} - uCajaPeru.xy) / uCajaPeru.zw;
  col = mix(col, uSombra, texture2D(uPeru, pv).r * 0.35);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}`

/**
 * Relieve real sobre la cara superior de las columnas: la textura y su caja, compartidas con el
 * suelo. uFundido (0 → 1) mezcla el color anterior de cada tapa con el nuevo al cambiar de modo;
 * uOrigen lleva del mundo a las coordenadas proyectadas (las de las texturas de las mallas).
 */
interface RelieveTapa {
  uMundo: { value: THREE.Texture | null }
  uCaja: { value: THREE.Vector4 }
  uFundido: { value: number }
  uOrigen: { value: THREE.Vector2 }
}

/** Color que tenía la tapa antes del cambio: una textura (con su repeat/offset) o un color liso. */
interface Previo {
  uPrevio: { value: THREE.Texture | null }
  uPrevioUV: { value: THREE.Vector4 }
  uPrevioColor: { value: THREE.Color }
  uPrevioMapa: { value: number }
}

/**
 * Sombra de contacto en las paredes de cada columna: más oscuras junto al suelo, como una maqueta
 * con oclusión ambiental. Se calcula en el mismo shader (sin pasadas extra ni SSAO). La distancia
 * es en unidades del mundo, así que una columna alta y una baja se oscurecen igual cerca del piso.
 */
function conSombraDeContacto(mat: THREE.MeshStandardMaterial, tapa: RelieveTapa) {
  const decl = '#include <common>\nvarying float vAlto, vPared;\nvarying vec2 vXZ;'
  const previo: Previo = {
    uPrevio: { value: null },
    uPrevioUV: { value: new THREE.Vector4(1, 1, 0, 0) },
    uPrevioColor: { value: new THREE.Color() },
    uPrevioMapa: { value: 0 },
  }
  mat.userData.previo = previo
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, previo)
    sh.uniforms.uMundo = tapa.uMundo
    sh.uniforms.uCaja = tapa.uCaja
    sh.uniforms.uFundido = tapa.uFundido
    sh.uniforms.uOrigen = tapa.uOrigen
    sh.vertexShader = sh.vertexShader.replace('#include <common>', decl).replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
  vPared = 1.0 - abs(normal.z); // tapas: normal ±z en el espacio de la extrusión
  vec4 wPos = modelMatrix * vec4(position, 1.0);
  vAlto = wPos.y - (modelMatrix * vec4(position.xy, 0.0, 1.0)).y;
  vXZ = wPos.xz;`,
    )
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        decl +
          `
uniform sampler2D uMundo, uPrevio;
uniform vec4 uCaja, uPrevioUV;
uniform vec3 uPrevioColor;
uniform float uFundido, uPrevioMapa;
uniform vec2 uOrigen;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
  // Cambio de modo: del color anterior al nuevo, sin corte (la textura anterior con su propia caja)
  if (uFundido < 1.0) {
    vec2 pp = vec2(vXZ.x - uOrigen.x, uOrigen.y - vXZ.y);
    vec3 antes = uPrevioMapa > 0.5 ? texture2D(uPrevio, pp * uPrevioUV.xy + uPrevioUV.zw).rgb : uPrevioColor;
    diffuseColor.rgb = mix(antes, diffuseColor.rgb, uFundido);
  }
  // Cara superior: Andes, valles y llanura amazónica con el sombreado real (SRTM), sin cambiar la altura del dato
  float hs = texture2D(uMundo, (vXZ - uCaja.xy) / uCaja.zw).r;
#ifdef CALOR
  // Mapa de calor: pared con degradado más marcado y relieve más fuerte, para que no se vea plano
  diffuseColor.rgb *= mix(1.0, mix(0.35, 1.05, smoothstep(0.0, 1.8, vAlto)), vPared);
  diffuseColor.rgb *= mix(0.6 + 0.8 * hs, 1.0, vPared);
#else
  diffuseColor.rgb *= mix(1.0, mix(0.55, 1.0, smoothstep(0.0, 1.4, vAlto)), vPared);
  diffuseColor.rgb *= mix(0.74 + 0.5 * hs, 1.0, vPared);
#endif`,
      )
  }
  mat.customProgramCacheKey = () => 'columna-sombra-relieve'
  return mat
}

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
  const fino = desenfocar(tierra, S, 1) // máscara del relieve: dentro del Perú no sube
  const out = new Uint8Array(S * S * 4)
  for (let i = 0; i < S * S; i++) {
    out[i * 4] = ancho[i] * 255
    out[i * 4 + 1] = fino[i] * 255
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

/**
 * Cielo anclado al mundo (equirectangular): v = 0 es el cenit, 0.5 el horizonte. Así el azul
 * sigue la altura real y no la pantalla. Bajo el horizonte, la bruma (= color de la niebla):
 * el mar lejano y el cielo se funden sin costura.
 */
function texturaCielo(claro: boolean, bruma: string) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 512
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 512)
  const paradas: [number, string][] = claro
    ? [
        [0, '#2f6fb8'],
        [0.38, '#4f8fd2'],
        [0.47, '#8dbde8'],
        [0.5, bruma],
        [1, bruma],
      ]
    : [
        [0, '#03050b'],
        [0.32, '#0a1020'],
        [0.46, '#182139'],
        [0.5, bruma],
        [1, bruma],
      ]
  for (const [t, col] of paradas) grad.addColorStop(t, col)
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 512)
  const tx = new THREE.CanvasTexture(c)
  tx.mapping = THREE.EquirectangularReflectionMapping
  return tx
}

/** Sol (claro: disco cálido y halo amplio) o luna (oscuro: disco pálido, manchas fijas y halo frío). */
function texturaAstro(claro: boolean) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  const paradas: [number, string][] = claro
    ? [
        [0, '#fffaf0'],
        [0.18, 'rgba(255,240,205,1)'],
        [0.24, 'rgba(255,224,170,0.5)'],
        [0.5, 'rgba(255,214,160,0.14)'],
        [0.9, 'rgba(255,210,150,0)'], // se apaga antes del borde: sin halo cuadrado
      ]
    : [
        [0, '#f2f5ff'],
        [0.2, 'rgba(232,238,255,1)'],
        [0.23, 'rgba(190,205,255,0.3)'],
        [0.5, 'rgba(180,198,255,0.08)'],
        [0.9, 'rgba(170,190,255,0)'], // se apaga antes del borde: sin halo cuadrado
      ]
  for (const [t, col] of paradas) grad.addColorStop(t, col)
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  if (!claro) {
    g.fillStyle = 'rgba(150,160,185,0.45)'
    for (const [x, y, r] of [
      [58, 59, 4.5],
      [69, 66, 3.5],
      [61, 71, 2.5],
      [69, 55, 2],
    ]) {
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.fill()
    }
  }
  return new THREE.CanvasTexture(c)
}

/** Nube: manchas blancas suaves que se solapan (el color lo pone el shader). */
function texturaNube() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 64
  const g = c.getContext('2d')!
  for (const [x, y, r] of [
    [36, 38, 20],
    [58, 30, 24],
    [82, 34, 22],
    [100, 40, 16],
    [26, 44, 14],
    [64, 42, 22],
    [46, 44, 18],
  ]) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  return new THREE.CanvasTexture(c)
}

/**
 * «Posible casualidad»: el color lavado con el panel y una trama fina de puntos del color pleno,
 * al tresbolillo. Se lee como "menos seguro" sin parecer rayado. La baldosa (64 px) se repite sin costura.
 */
function texturaPunteada(hex: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const col = new THREE.Color(hex)
  x.fillStyle =
    '#' +
    col
      .clone()
      .lerp(new THREE.Color(cssVar('--panel')), 0.5)
      .getHexString()
  x.fillRect(0, 0, 64, 64)
  x.fillStyle = '#' + col.getHexString()
  x.beginPath()
  for (let f = 0; f < 4; f++)
    for (let k = 0; k < 4; k++) {
      const cx = k * 16 + (f % 2) * 8 + 4
      x.moveTo(cx + 3, f * 16 + 8)
      x.arc(cx, f * 16 + 8, 3, 0, Math.PI * 2)
    }
  x.fill()
  const tx = new THREE.CanvasTexture(c)
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping
  tx.repeat.set(1.2, 1.2)
  return tx
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

/** Escena viva (una sola por página): la usan los botones de girar y recentrar del explorador. */
export const escenaActiva: { current: EscenaPeru | null } = { current: null }

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
  /** Altitud del suelo (canal R de mundo2.png: 0..255 = 0..6000 m), para saber qué planta crece. */
  private elevacion: Uint8ClampedArray | null = null
  private vuelo: Vuelo | null = null
  private fueraDePantalla = false
  private ancho = 1
  private alto = 1
  private etiquetas: { id: string; el: HTMLDivElement }[] = []
  private etiquetaSel: HTMLDivElement
  private etiquetaOceano: HTMLDivElement
  private etiquetasPais: { el: HTMLDivElement; x: number; z: number; es: string; en: string }[] = []
  /** Modo «Vegetación»: departamentos planos y atenuados, y los 5 recuadros medidos encima. */
  private veg = false
  /** Recuadros con vegetación medida (tamaño real), con su borde. */
  private cajasVeg: {
    caja: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    borde: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>
    lugar: LugarVegetacion
  }[] = []
  /** Nombres de los lugares con vegetación (solo en el modo Vegetación), junto a su recuadro. */
  private marcasVeg: {
    el: HTMLDivElement
    x: number
    z: number
    lon: number
    lat: number
    departamento: string
  }[] = []
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
    for (const l of LUGARES_VEGETACION) {
      // Recuadro real (unos 25 km de lado), plano sobre su departamento
      const [o, s, e, n] = l.caja
      const centro = proyectar([l.lon, l.lat])
      const geo = new THREE.PlaneGeometry((e - o) * COSLAT * K, (n - s) * K)
      geo.rotateX(-Math.PI / 2)
      const caja = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95, depthWrite: false }),
      )
      const borde = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 }),
      )
      for (const obj of [caja, borde]) {
        obj.position.set(centro.x + this.mapa.position.x, 0, -centro.y + this.mapa.position.z)
        obj.renderOrder = 3
        obj.visible = false
        this.escena.add(obj)
      }
      this.cajasVeg.push({ caja, borde, lugar: l })
    }
    for (const l of LUGARES_VEGETACION) {
      const v = proyectar([l.lon, l.lat])
      const el = nuevaEtiqueta('lbl3d veg')
      el.textContent = l.nombre
      el.style.setProperty('--veg', `var(${COLOR_TENDENCIA[l.tendencia]})`)
      this.marcasVeg.push({
        el,
        x: v.x + this.mapa.position.x,
        z: -v.y + this.mapa.position.z,
        lon: l.lon,
        lat: l.lat,
        departamento: l.departamento,
      })
    }
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

    // Nubes y su sombra: comparten geometría y uniforms; uTime y uTope son los de las gotas
    const plano = new THREE.PlaneGeometry(1, 1)
    this.geoNubes.setIndex(plano.index)
    this.geoNubes.setAttribute('position', plano.attributes.position)
    this.geoNubes.setAttribute('uv', plano.attributes.uv)
    this.geoNubes.setAttribute(
      'aNube',
      new THREE.InstancedBufferAttribute(new Float32Array(N_NUBES * 4), 4),
    )
    this.geoNubes.instanceCount = 0
    const uNubes = {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: matP.uniforms.uTime,
      uTope: matP.uniforms.uTope,
      uMapa: { value: texturaNube() },
      uColor: { value: new THREE.Color() },
    }
    for (const sombra of [true, false]) {
      const malla = new THREE.Mesh(
        this.geoNubes,
        new THREE.ShaderMaterial({
          uniforms: uNubes,
          vertexShader: NUBE_VS,
          fragmentShader: NUBE_FS,
          defines: sombra ? { SOMBRA: '' } : {},
          transparent: true,
          depthWrite: false,
          fog: true,
          // La sombra es una calcomanía sobre la tapa: se acerca a la cámara para no parpadear (z-fighting)
          polygonOffset: sombra,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        }),
      )
      malla.frustumCulled = false
      malla.renderOrder = sombra ? 3 : 5
      this.nubes.add(malla)
    }
    this.nubes.visible = false
    this.escena.add(this.nubes)

    this.astro.position.copy(DIR_ASTRO).multiplyScalar(320) // lejos del plano «far» (600)
    this.astro.scale.setScalar(64)
    this.escena.add(this.astro)

    // Estrellas en la media cúpula de arriba (radio 450, dentro de far = 600)
    const cielo = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      const az = Math.random() * Math.PI * 2
      const y = 0.02 + Math.random() * 0.98
      const r = Math.sqrt(1 - y * y) * 450
      cielo.set([Math.cos(az) * r, y * 450, Math.sin(az) * r], i * 3)
    }
    const geoCielo = new THREE.BufferGeometry()
    geoCielo.setAttribute('position', new THREE.BufferAttribute(cielo, 3))
    this.estrellas = new THREE.Points(
      geoCielo,
      new THREE.PointsMaterial({
        size: 1.6,
        sizeAttenuation: false,
        fog: false,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    )
    this.estrellas.visible = false
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
    this.particulas = { geo: geoP, puntos }

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

  /** Altitud (m) en un punto, interpolada entre los píxeles de mundo2.png (NaN sin la textura). */
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
   * Modo «Vegetación»: cada columna sube según el verdor medio (NDVI) de su departamento, la tapa
   * muestra el NDVI por celda, crecen las plantas de cada zona y encima van los 5 recuadros medidos.
   */
  setVegetacion(on: boolean) {
    if (this.veg === on) return
    this.fundir()
    this.veg = on
    this.ubicarCajasVeg()
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
    if (this.animalHover) this.tip.textContent = this.fauna.texto(this.animalHover, idioma)
    this.llenarTarjeta()
    for (const p of this.etiquetasPais) p.el.textContent = idioma === 'en' ? p.en : p.es
    this.textosVeg()
    this.sucio = true
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
    if (this.ancho <= 900) return 0 // en celular el mapa va arriba y el texto abajo
    return this.modo === 'inicio' ? this.ancho * 0.24 : -this.panel / 2
  }

  private aplicarCorrimiento() {
    if (Math.abs(this.corrimiento) < 0.5) this.camara.clearViewOffset()
    else
      this.camara.setViewOffset(this.ancho, this.alto, -this.corrimiento, 0, this.ancho, this.alto)
  }

  destruir() {
    this.destruida = true
    for (const c of this.cajasVeg) {
      c.caja.geometry.dispose()
      c.caja.material.dispose()
      c.borde.geometry.dispose()
      c.borde.material.dispose()
    }
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
        // Modo Vegetación: el NDVI por celda, pleno (la tendencia va solo en los 5 recuadros)
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
    for (const c of this.cajasVeg) {
      c.caja.material.color.set(this.color(COLOR_TENDENCIA[c.lugar.tendencia]))
      c.borde.material.color.set(this.color('--fg'))
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
    this.ubicarCajasVeg()
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

  /** Recuadros de vegetación sobre la cara de su departamento; va antes de dibujar (no después). */
  private ubicarCajasVeg() {
    const conVeg = this.veg && this.modo === 'explorar'
    for (const c of this.cajasVeg) {
      const m = this.porId.get(c.lugar.departamento)
      c.caja.visible = c.borde.visible = conVeg && !!m
      if (m) c.caja.position.y = c.borde.position.y = m.position.z + m.scale.z + 0.04
    }
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
    // Modo Vegetación (solo en el explorador): recuadros y nombres sobre la cara de su departamento
    const conVeg = this.veg && this.modo === 'explorar'
    for (const mv of this.marcasVeg) {
      if (mv.el.hidden === conVeg) mv.el.hidden = !conVeg
      const m = malla(mv.departamento)
      if (conVeg && m) this.ubicarEtiqueta(mv.el, mv.x, m.position.z + m.scale.z + 0.2, mv.z)
    }
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
