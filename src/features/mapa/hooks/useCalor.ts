import { useQuery } from '@tanstack/react-query'
import { celdasDeApi, type Malla } from '@/api/consultas'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import {
  PARADAS_CALOR,
  PARADAS_LLUVIA,
  PARADAS_VEG,
  prepararCalor,
  type Calor,
} from '@/features/mapa/utils/calor'

/** Variables con malla por celda: su copia local (chunk aparte) y su rampa de color. */
const MALLAS = {
  lluvia: {
    local: () => import('@/data/celdas_lluvia.json'),
    paradas: PARADAS_LLUVIA,
  },
  temperatura: {
    local: () => import('@/data/celdas_temperatura.json'),
    paradas: PARADAS_CALOR,
  },
  vegetacion: {
    local: () => import('@/data/celdas_vegetacion.json'),
    paradas: PARADAS_VEG,
  },
} as const

type ConMalla = keyof typeof MALLAS
const conMalla = (v: string): v is ConMalla => v in MALLAS

/**
 * Malla por celda de la variable elegida, para el mapa de color: temperatura (frío → calor), lluvia
 * (seco → azul profundo) o vegetación (seco → verde). De la API si la sesión la usa; si no, o si
 * falla, de la copia local (mismos números), que va en un chunk aparte para no pesar en la carga
 * inicial. La unidad sale de cada malla (la lluvia viene en mm/año, no en el mm/día de las
 * tendencias). Se prepara una sola vez por variable y la comparten el 3D, el 2D y la leyenda.
 */
export function useCalor(): Calor | null {
  const { variable } = useBusqueda()
  const fuente = useApp((s) => s.fuente)
  const v = conMalla(variable) ? variable : null
  const { data } = useQuery({
    queryKey: ['celdas', v, fuente],
    queryFn: async () => {
      const m = MALLAS[v!]
      return prepararCalor(
        (fuente === 'api' && (await celdasDeApi(v!))) || ((await m.local()).default as Malla),
        m.paradas,
      )
    },
    enabled: v != null && fuente != null,
    staleTime: Infinity,
    retry: false,
  })
  return v ? (data ?? null) : null
}
