import { useMemo } from 'react'
import { zonasDe } from '../data/datos'
import { useApp } from '../store'

/**
 * Estadística por zona de la variable y el periodo elegidos (datos reales de NASA POWER).
 * Cuando la API sirva las tendencias, aquí se cambia por la consulta (TanStack Query).
 */
export function useZonas() {
  const variable = useApp((s) => s.variable)
  const periodo = useApp((s) => s.periodo)
  const sinNino = useApp((s) => s.sinNino)
  return useMemo(() => zonasDe(variable, periodo, sinNino), [variable, periodo, sinNino])
}
