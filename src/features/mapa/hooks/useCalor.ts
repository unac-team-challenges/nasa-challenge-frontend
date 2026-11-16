import { useQuery } from '@tanstack/react-query'
import { celdasDeApi, type Malla } from '@/api/consultas'
import type { Variable } from '@/data/datos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import {
  PARADAS_CALOR,
  PARADAS_LLUVIA,
  PARADAS_VEG,
  prepararCalor,
  type Calor,
} from '@/features/mapa/utils/calor'

export type CapaCalor = Variable | 'vegetacion'

const PARADAS: Record<CapaCalor, string[]> = {
  temperatura: PARADAS_CALOR,
  lluvia: PARADAS_LLUVIA,
  vegetacion: PARADAS_VEG,
}
/** Copia local de cada malla (mismos números que la API), cada una en un chunk aparte. */
const LOCAL: Record<CapaCalor, () => Promise<{ default: unknown }>> = {
  temperatura: () => import('@/data/celdas_temperatura.json'),
  lluvia: () => import('@/data/celdas_lluvia.json'),
  vegetacion: () => import('@/data/celdas_vegetacion.json'),
}

/**
 * Malla por celda del mapa de color: temperatura (frío → calor), lluvia (seco → azul profundo) o,
 * en Vegetación, el NDVI de MODIS (0,25°). De la API si la sesión la usa; si no, o si
 * falla, de la copia local. Se prepara una sola vez y la comparten el 3D, el 2D y la leyenda.
 * `capa` pide una malla fija (el 3D adelanta la de vegetación para que el bosque ya esté plantado).
 */
export function useCalor(capa?: CapaCalor, activa = true): Calor | null {
  const { variable } = useBusqueda()
  const fuente = useApp((s) => s.fuente)
  const c = capa ?? variable
  const { data } = useQuery({
    queryKey: ['celdas', c, fuente],
    queryFn: async () =>
      prepararCalor(
        (fuente === 'api' && (await celdasDeApi(c))) || ((await LOCAL[c]()).default as Malla),
        PARADAS[c],
      ),
    enabled: fuente != null && activa,
    staleTime: Infinity,
    retry: false,
  })
  return data ?? null
}
