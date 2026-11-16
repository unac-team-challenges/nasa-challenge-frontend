/**
 * Piezas de la escena 3D que se arman una sola vez y no dependen del estado de EscenaPeru:
 * las gotas de lluvia, las nubes y las estrellas. Código movido del constructor de escena.ts.
 */
import * as THREE from 'three'
import { DEPARTAMENTOS } from '@/data/datos'
import { N_NUBES, proyectar } from '@/features/mapa/escena/constantes'
import { NUBE_FS, NUBE_VS, PARTICULAS_FS, PARTICULAS_VS } from '@/features/mapa/escena/shaders'
import { texturaNube } from '@/features/mapa/escena/texturas'

/** Partículas de la lluvia viva (máximo). */
export const N_PARTICULAS = 1600

export interface Particulas {
  geo: THREE.BufferGeometry
  puntos: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
}

/** Puntos de muestra dentro de cada departamento, en el orden de DEPARTAMENTOS; `origen` es la posición del grupo del mapa. */
export function muestrasLluvia(origen: { x: number; z: number }) {
  const muestras: [number, number][][] = []
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
      if (dentro(x, y)) out.push([x + origen.x, -y + origen.z])
    }
    muestras.push(out)
  }
  return muestras
}

/** Gotas y calor que suben: geometría y material listos; la altura la calcula el shader. */
export function crearParticulas(): Particulas {
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
  return { geo: geoP, puntos }
}

/** Llena `nubes` con las nubes y su sombra; `gotas` aporta uTime y uTope. */
export function llenarNubes(
  nubes: THREE.Group,
  geoNubes: THREE.InstancedBufferGeometry,
  gotas: THREE.ShaderMaterial,
) {
  const plano = new THREE.PlaneGeometry(1, 1)
  geoNubes.setIndex(plano.index)
  geoNubes.setAttribute('position', plano.attributes.position)
  geoNubes.setAttribute('uv', plano.attributes.uv)
  geoNubes.setAttribute(
    'aNube',
    new THREE.InstancedBufferAttribute(new Float32Array(N_NUBES * 4), 4),
  )
  geoNubes.instanceCount = 0
  const uNubes = {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    uTime: gotas.uniforms.uTime,
    uTope: gotas.uniforms.uTope,
    uMapa: { value: texturaNube() },
    uColor: { value: new THREE.Color() },
  }
  for (const sombra of [true, false]) {
    const malla = new THREE.Mesh(
      geoNubes,
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
    nubes.add(malla)
  }
  nubes.visible = false
}

/** Estrellas en la media cúpula de arriba (radio 450, dentro de far = 600). */
export function crearEstrellas() {
  const cielo = new Float32Array(500 * 3)
  for (let i = 0; i < 500; i++) {
    const az = Math.random() * Math.PI * 2
    const y = 0.02 + Math.random() * 0.98
    const r = Math.sqrt(1 - y * y) * 450
    cielo.set([Math.cos(az) * r, y * 450, Math.sin(az) * r], i * 3)
  }
  const geoCielo = new THREE.BufferGeometry()
  geoCielo.setAttribute('position', new THREE.BufferAttribute(cielo, 3))
  const estrellas = new THREE.Points(
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
  estrellas.visible = false
  return estrellas
}
