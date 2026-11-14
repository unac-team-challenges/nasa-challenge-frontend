import type { Variable } from '../data/datos'

/**
 * Color de dirección del dato.
 * Lluvia: azul = más, ocre = menos. Temperatura: ocre = más calor, azul = más frío.
 */
export function claveMapa(pendiente: number, variable: Variable): 'up' | 'down' {
  const sube = pendiente >= 0
  return variable === 'temperatura' ? (sube ? 'down' : 'up') : sube ? 'up' : 'down'
}

/** Token de texto (más contraste que el del mapa): --up o --down. */
export function colorDireccion(pendiente: number, variable: Variable) {
  return claveMapa(pendiente, variable) === 'up' ? '--up' : '--down'
}
