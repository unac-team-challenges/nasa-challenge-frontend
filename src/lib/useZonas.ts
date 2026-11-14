import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { serieDeApi, zonasDeApi } from '../api/consultas'
import { serie, zonasDe, type Zona } from '../data/datos'
import { useApp } from '../store'

export type Fuente = 'api' | 'local'

/**
 * Tendencias de la API cuando las trae completas. Solo aplica a la vista principal
 * (tendencia larga, con El Niño): la variante sin El Niño y la máquina del tiempo
 * usan la copia local hasta que el contrato las incluya.
 */
function useZonasApi() {
  const variable = useApp((s) => s.variable)
  return useQuery({
    queryKey: ['zonas', variable],
    queryFn: () => zonasDeApi(variable),
    staleTime: Infinity,
    retry: 1,
  })
}

/** De dónde salen los datos que se ven: la API del backend o la copia local de respaldo. */
export function useFuente(): Fuente {
  const { data } = useZonasApi()
  const periodo = useApp((s) => s.periodo)
  const sinNino = useApp((s) => s.sinNino)
  return data && periodo === 'largo' && !sinNino ? 'api' : 'local'
}

/** Estadística por zona de la variable elegida: API si está completa; si no, copia local. */
export function useZonas(): Record<string, Zona> {
  const variable = useApp((s) => s.variable)
  const periodo = useApp((s) => s.periodo)
  const sinNino = useApp((s) => s.sinNino)
  const { data } = useZonasApi()
  const fuente = useFuente()
  const local = useMemo(() => zonasDe(variable, periodo, sinNino), [variable, periodo, sinNino])
  return fuente === 'api' && data ? data : local
}

/** Serie anual de una zona, de la misma fuente que sus tendencias (para que el gráfico cuadre). */
export function useSerie(id: string): { y: number; v: number }[] {
  const variable = useApp((s) => s.variable)
  const periodo = useApp((s) => s.periodo)
  const sinNino = useApp((s) => s.sinNino)
  const fuente = useFuente()
  const { data } = useQuery({
    queryKey: ['serie', variable, id],
    queryFn: () => serieDeApi(id, variable),
    enabled: fuente === 'api',
    staleTime: Infinity,
    retry: 1,
  })
  const local = useMemo(
    () => serie(id, variable, periodo, sinNino),
    [id, variable, periodo, sinNino],
  )
  return fuente === 'api' && data ? data : local
}
