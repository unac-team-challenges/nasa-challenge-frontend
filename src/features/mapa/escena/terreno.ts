/**
 * Relieve real del Perú para el modo Vegetación: el suelo sube con la altitud sobre el nivel del
 * mar (SRTM, la misma textura que el relieve de los países vecinos) y se pinta con el NDVI de cada
 * celda. Así se ven solas las tres regiones: la costa es la franja baja y seca, la sierra son los
 * Andes y la selva el llano verde del este.
 *
 * Una malla densa solo sobre el Perú y un shader: la altura sale de la textura en la GPU, los
 * bordes de departamento salen de una textura de ids (sin líneas aparte) y el departamento bajo el
 * puntero o elegido se aclara con el acento. Fuera del Perú se descarta.
 */
import * as THREE from 'three'
import { DEPARTAMENTOS } from '@/data/datos'
import { dibujarCalor, type Calor } from '@/features/mapa/utils/calor'

const VS = `
uniform sampler2D uMundo, uMundo2;
uniform vec4 uCaja;
uniform float uBase, uAlto;
varying vec3 vW;
#include <fog_pars_vertex>
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec2 uv = (w.xz - uCaja.xy) / uCaja.zw;
  float tierra = smoothstep(0.5, 0.62, texture2D(uMundo, uv).g);
  w.y = uBase + texture2D(uMundo2, uv).r * tierra * uAlto;
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`

const FS = `
uniform sampler2D uMundo, uNdvi, uDeptos;
uniform vec4 uCaja, uCajaNdvi, uCajaDeptos;
uniform vec2 uPaso;
uniform float uHover, uSel;
uniform vec3 uAcento, uBorde, uLuz;
varying vec3 vW;
#include <fog_pars_fragment>
float idEn(vec2 uv) {
  vec4 d = texture2D(uDeptos, uv);
  return d.a > 0.5 ? floor(d.r * 255.0 + 0.5) : 0.0;
}
void main() {
  vec2 ud = (vW.xz - uCajaDeptos.xy) / uCajaDeptos.zw;
  float id = idEn(ud);
  if (id < 0.5) discard;
  vec3 col = texture2D(uNdvi, (vW.xz - uCajaNdvi.xy) / uCajaNdvi.zw).rgb;
  // Luz de la pendiente real (normal de la superficie) mezclada con el sombreado del relieve (SRTM)
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  if (n.y < 0.0) n = -n;
  float hs = texture2D(uMundo, (vW.xz - uCaja.xy) / uCaja.zw).r;
  col *= mix(0.5 + 0.65 * max(dot(n, uLuz), 0.0), 0.62 + 0.7 * hs, 0.45);
  // Bordes de departamento y costa: donde cambia el id
  float b = step(0.5, abs(idEn(ud + vec2(uPaso.x, 0.0)) - id)) + step(0.5, abs(idEn(ud - vec2(uPaso.x, 0.0)) - id))
          + step(0.5, abs(idEn(ud + vec2(0.0, uPaso.y)) - id)) + step(0.5, abs(idEn(ud - vec2(0.0, uPaso.y)) - id));
  col = mix(col, uBorde, min(b, 1.0) * 0.5);
  col = mix(col, uAcento, id == uSel ? 0.3 : id == uHover ? 0.16 : 0.0);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}`

export interface ContextoTerreno {
  escena: THREE.Scene
  /** Texturas del suelo (mundo.png: sombreado y costa; mundo2.png: altitud) y su caja en la escena. */
  uMundo: { value: THREE.Texture | null }
  uMundo2: { value: THREE.Texture | null }
  uCaja: { value: THREE.Vector4 }
  aEscena: (lon: number, lat: number) => number[]
  /** Nivel del mar en la escena. */
  base: number
  luz: THREE.Vector3
  celular: boolean
}

export class Terreno {
  private malla: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private lienzo = document.createElement('canvas')
  private ndvi: THREE.CanvasTexture
  private deptos: THREE.CanvasTexture
  private cx: ContextoTerreno

  constructor(cx: ContextoTerreno) {
    this.cx = cx
    // Caja del Perú en la escena (con un margen)
    let x0 = Infinity
    let x1 = -Infinity
    let z0 = Infinity
    let z1 = -Infinity
    for (const z of DEPARTAMENTOS)
      for (const poly of z.polys)
        for (const [lon, lat] of poly[0]) {
          const [x, zz] = cx.aEscena(lon, lat)
          x0 = Math.min(x0, x)
          x1 = Math.max(x1, x)
          z0 = Math.min(z0, zz)
          z1 = Math.max(z1, zz)
        }
    x0 -= 0.5
    z0 -= 0.5
    x1 += 0.5
    z1 += 0.5
    const lado = Math.max(x1 - x0, z1 - z0)
    this.deptos = this.texturaDeptos(x0, z0, lado)
    this.ndvi = new THREE.CanvasTexture(this.lienzo)
    this.ndvi.flipY = false
    this.ndvi.magFilter = this.ndvi.minFilter = THREE.LinearFilter
    this.ndvi.generateMipmaps = false

    // ~0,17 unidades por vértice (lo que da la textura de altitud); la mitad en celular
    const porUnidad = cx.celular ? 3 : 6
    const geo = new THREE.PlaneGeometry(
      x1 - x0,
      z1 - z0,
      Math.round((x1 - x0) * porUnidad),
      Math.round((z1 - z0) * porUnidad),
    )
    geo.rotateX(-Math.PI / 2)
    geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2)
    const u = <T>(value: T) => ({ value })
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uMundo: cx.uMundo,
        uMundo2: cx.uMundo2,
        uCaja: cx.uCaja,
        uNdvi: u(this.ndvi),
        uDeptos: u(this.deptos),
        uCajaNdvi: u(new THREE.Vector4(0, 0, 1, 1)),
        uCajaDeptos: u(new THREE.Vector4(x0, z0, lado, lado)),
        uPaso: u(new THREE.Vector2(1 / 1024, 1 / 1024)),
        uBase: u(cx.base),
        uAlto: u(0),
        uHover: u(0),
        uSel: u(0),
        uAcento: u(new THREE.Color()),
        uBorde: u(new THREE.Color()),
        uLuz: u(cx.luz.clone()),
      },
      vertexShader: VS,
      fragmentShader: FS,
      fog: true,
    })
    this.malla = new THREE.Mesh(geo, mat)
    this.malla.frustumCulled = false // la altura la pone el shader
    this.malla.visible = false
    cx.escena.add(this.malla)
  }

  /** Ids de los departamentos (1..25 en el canal R; alfa = dentro del Perú), 1024 px, una vez. */
  private texturaDeptos(x0: number, z0: number, lado: number) {
    const S = 1024
    const c = document.createElement('canvas')
    c.width = c.height = S
    const g = c.getContext('2d')!
    DEPARTAMENTOS.forEach((z, k) => {
      g.fillStyle = `rgb(${k + 1},0,0)`
      for (const poly of z.polys) {
        g.beginPath()
        for (const ring of poly)
          ring.forEach(([lon, lat], i) => {
            const [x, zz] = this.cx.aEscena(lon, lat)
            const px = ((x - x0) / lado) * S
            const py = ((zz - z0) / lado) * S
            if (i) g.lineTo(px, py)
            else g.moveTo(px, py)
          })
        g.fill('evenodd')
      }
    })
    const tx = new THREE.CanvasTexture(c)
    tx.flipY = false
    tx.magFilter = tx.minFilter = THREE.NearestFilter
    tx.generateMipmaps = false
    return tx
  }

  /** Pinta el NDVI medio con los colores del tema (al llegar la malla y al cambiar el tema). */
  pintar(c: Calor, acento: string, borde: string) {
    dibujarCalor(this.lienzo, c, null)
    this.ndvi.needsUpdate = true
    const [x0, z0] = this.cx.aEscena(c.lonMin, c.latMin + c.spanLat)
    const [x1, z1] = this.cx.aEscena(c.lonMin + c.spanLon, c.latMin)
    const U = this.malla.material.uniforms
    U.uCajaNdvi.value.set(x0, z0, x1 - x0, z1 - z0)
    U.uAcento.value.set(acento)
    U.uBorde.value.set(borde)
  }

  /** Departamentos bajo el puntero y elegido (índice en DEPARTAMENTOS, -1 = ninguno). */
  marcar(hover: number, sel: number) {
    const U = this.malla.material.uniforms
    U.uHover.value = hover + 1
    U.uSel.value = sel + 1
  }

  /** Altura del relieve (unidades por 6000 m); en 0 se esconde bajo las columnas. */
  set alto(a: number) {
    this.malla.material.uniforms.uAlto.value = a
    this.malla.visible = a > 0.001
  }

  destruir() {
    this.malla.geometry.dispose()
    this.malla.material.dispose()
    this.ndvi.dispose()
    this.deptos.dispose()
    this.malla.removeFromParent()
  }
}
