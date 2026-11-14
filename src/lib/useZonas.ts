import { useMemo } from 'react'
import { calcularZonas } from '../data/ejemplo'
import { useApp } from '../store'

/**
 * Estadística por zona de la variable elegida.
 * Hoy sale de los datos de ejemplo; aquí se cambia por la consulta a la API (TanStack Query).
 */
export function useZonas() {
  const variable = useApp((s) => s.variable)
  const sinNino = useApp((s) => s.sinNino)
  return useMemo(() => calcularZonas(variable, sinNino), [variable, sinNino])
}
