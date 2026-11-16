/** Constantes de la escena 3D que comparten la escena, los shaders y las texturas (movido de escena.ts sin cambios). */
import * as THREE from 'three'

export const LON0 = -75.0
export const LAT0 = -9.2
export const K = 2.2
export const COSLAT = Math.cos((LAT0 * Math.PI) / 180)
/** Desde r155 las luces son físicas: ×π para igualar las intensidades de r128. */
export const LUZ = Math.PI
/**
 * Hacia el sol/luna. En el hemisferio sur el sol va por el norte (-z). Es la luz, la sombra del
 * Perú y la de las nubes.
 */
export const DIR_LUZ = new THREE.Vector3(5, 45, -45).normalize()
/**
 * El disco va en el mismo rumbo pero bajo, a ~4° sobre el horizonte: se ve en el cielo y su reflejo
 * cruza el mar cuando la cámara se inclina hacia el horizonte (camino de luz).
 */
export const DIR_ASTRO = new THREE.Vector3(DIR_LUZ.x, 0, DIR_LUZ.z)
  .normalize()
  .setY(0.07)
  .normalize()
/** Altura efectiva de la sombra del Perú (calibrada: con DIR_LUZ da el corrimiento de antes). */
export const SOMBRA = 2.4
/** Nubes sobre el tope de su departamento: justo donde nacen las gotas (h = 9 en PARTICULAS_VS). */
export const ALTO_NUBE = 9.4
export const N_NUBES = 12
export const glsl = (v: THREE.Vector3) =>
  `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`

export const proyectar = ([lon, lat]: number[]) =>
  new THREE.Vector2((lon - LON0) * COSLAT * K, (lat - LAT0) * K)

/**
 * Suelo de Sudamérica en un solo shader: mar con profundidad sugerida, costa con espuma y
 * oleaje, tierra con sombreado suave del relieve real, ríos, lagos y fronteras tenues.
 * Las texturas se precalculan con scripts/generar_mundo.py (SRTM/ETOPO1 y Natural Earth).
 */
export const MUNDO = { lon0: -110, lon1: -30, lat0: -60, lat1: 25 } // caja de public/mapa/mundo*.webp

/** Exageración vertical del relieve: 6000 m de altura son RELIEVE unidades (~×15). */
export const RELIEVE = 1.8
/** Por debajo de esta resolución adaptativa (equipo lento) el relieve deja de subir. */
export const DPR_RELIEVE = 0.7
