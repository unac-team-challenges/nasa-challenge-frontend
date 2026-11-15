import { useQuery } from '@tanstack/react-query'
import { celdasDeApi, type Malla } from '@/api/consultas'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { PARADAS_LLUVIA, prepararCalor, type Calor } from '@/features/mapa/utils/calor'

/**
 * Malla por celda del mapa de color: temperatura (frío → calor) o lluvia (seco → azul profundo).
 * Temperatura: de la API si la sesión la usa; si no, o si falla, de la copia local (mismos números).
 * Lluvia: solo la copia local (mm/año de NASA POWER, mismas celdas). Cada copia va en un chunk aparte
 * para no pesar en la carga inicial. Se prepara una sola vez y la comparten el 3D, el 2D y la leyenda.
 */
export function useCalor(): Calor | null {
  const { variable } = useBusqueda()
  const fuente = useApp((s) => s.fuente)
  const { data } = useQuery({
    queryKey: ['celdas', variable, fuente],
    queryFn: async () => {
      if (variable === 'lluvia') {
        const m = (await import('@/data/celdas_lluvia.json')).default
        // El archivo de lluvia llama `valor` a lo que la malla de temperatura llama `t2m`
        const celdas = m.celdas.map(({ lat, lon, valor }) => ({ lat, lon, t2m: valor }))
        return prepararCalor({ ...m, celdas } as Malla, PARADAS_LLUVIA)
      }
      return prepararCalor(
        (fuente === 'api' && (await celdasDeApi())) ||
          ((await import('@/data/celdas_temperatura.json')).default as Malla),
      )
    },
    enabled: fuente != null,
    staleTime: Infinity,
    retry: false,
  })
  return data ?? null
}
