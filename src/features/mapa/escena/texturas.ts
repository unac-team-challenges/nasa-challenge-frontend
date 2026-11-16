/** Texturas y materiales que la escena 3D genera en código (cielo, astro, nube, sombra del Perú, punteado) (movido de escena.ts sin cambios). */
import * as THREE from 'three'
import { DEPARTAMENTOS } from '@/data/datos'
import { cssVar } from '@/utils/color'
import { proyectar } from '@/features/mapa/escena/constantes'

/**
 * Relieve real sobre la cara superior de las columnas: la textura y su caja, compartidas con el
 * suelo. uFundido (0 → 1) mezcla el color anterior de cada tapa con el nuevo al cambiar de modo;
 * uOrigen lleva del mundo a las coordenadas proyectadas (las de las texturas de las mallas).
 */
export interface RelieveTapa {
  uMundo: { value: THREE.Texture | null }
  uCaja: { value: THREE.Vector4 }
  uFundido: { value: number }
  uOrigen: { value: THREE.Vector2 }
}

/** Color que tenía la tapa antes del cambio: una textura (con su repeat/offset) o un color liso. */
export interface Previo {
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
export function conSombraDeContacto(mat: THREE.MeshStandardMaterial, tapa: RelieveTapa) {
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
export function texturaSombraPeru(
  desplaza: THREE.Vector3,
  caja: { x: number; z: number; w: number },
) {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  // Se lee con getImageData: canvas en CPU, sin esperar a que la GPU devuelva los píxeles
  const g = c.getContext('2d', { willReadFrequently: true })!
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
export function pixel(r: number, g: number, b: number) {
  const tx = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat)
  tx.needsUpdate = true
  return tx
}

/**
 * Cielo anclado al mundo (equirectangular): v = 0 es el cenit, 0.5 el horizonte. Así el azul
 * sigue la altura real y no la pantalla. Bajo el horizonte, la bruma (= color de la niebla):
 * el mar lejano y el cielo se funden sin costura.
 */
export function texturaCielo(claro: boolean, bruma: string) {
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
export function texturaAstro(claro: boolean) {
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
export function texturaNube() {
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
export function texturaPunteada(hex: string) {
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
