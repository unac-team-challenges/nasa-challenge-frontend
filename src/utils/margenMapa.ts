/** Rectángulo en pantalla (como el de `getBoundingClientRect`). */
export interface Rect {
  top: number
  bottom: number
  left: number
  right: number
}

/** Cuánto del alto del mapa lo tapan los paneles por arriba y por abajo (px). */
export interface Margen {
  arriba: number
  abajo: number
}

export const SIN_MARGEN: Margen = { arriba: 0, abajo: 0 }

/** El Perú es angosto y queda en el centro: solo estorban los paneles que caen en esta franja del ancho. */
const BANDA = [0.3, 0.7]
/** Aire entre un panel y el mapa (px). */
const AIRE = 8
/** Fracción mínima del alto que siempre queda para el mapa, aunque los paneles pidan más. */
const LIBRE_MIN = 0.55

/**
 * Margen que el mapa debe dejar arriba y abajo para que los paneles no tapen el Perú.
 * Un panel en la mitad de arriba suma al margen de arriba; en la de abajo, al de abajo.
 */
export function margenMapa(caja: Rect, paneles: Rect[]): Margen {
  const ancho = caja.right - caja.left
  const alto = caja.bottom - caja.top
  const [desde, hasta] = BANDA.map((f) => caja.left + ancho * f)
  let arriba = 0
  let abajo = 0
  for (const p of paneles) {
    if (p.right <= p.left || p.bottom <= p.top) continue // oculto
    if (p.right <= desde || p.left >= hasta) continue
    if ((p.top + p.bottom) / 2 < caja.top + alto / 2)
      arriba = Math.max(arriba, p.bottom - caja.top + AIRE)
    else abajo = Math.max(abajo, caja.bottom - p.top + AIRE)
  }
  arriba = Math.max(0, arriba)
  abajo = Math.max(0, abajo)
  const tope = alto * (1 - LIBRE_MIN)
  const suma = arriba + abajo
  if (suma > tope) {
    arriba = (arriba * tope) / suma
    abajo = (abajo * tope) / suma
  }
  return { arriba: Math.round(arriba), abajo: Math.round(abajo) }
}
