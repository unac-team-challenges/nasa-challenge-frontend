import type { Variable } from '@/data/datos'

/**
 * Color de dirección del dato.
 * Lluvia: azul = más, ocre = menos. Temperatura: ocre = más calor, azul = más frío.
 * Vegetación: verde = más verde, ocre = menos.
 */
export function claveMapa(pendiente: number, variable: Variable): 'up' | 'down' | 'green' {
  const sube = pendiente >= 0
  if (variable === 'vegetacion') return sube ? 'green' : 'down'
  return variable === 'temperatura' ? (sube ? 'down' : 'up') : sube ? 'up' : 'down'
}

/** Token de texto (más contraste que el del mapa): --up, --down o --green. */
export function colorDireccion(pendiente: number, variable: Variable) {
  return `--${claveMapa(pendiente, variable)}`
}
