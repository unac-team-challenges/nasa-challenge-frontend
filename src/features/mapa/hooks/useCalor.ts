import { useQuery } from '@tanstack/react-query'
import { celdasDeApi, type Malla } from '@/api/consultas'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { PARADAS_LLUVIA, PARADAS_VEG, prepararCalor, type Calor } from '@/features/mapa/utils/calor'

/**
 * Malla por celda del mapa de color: temperatura (frío → calor) o lluvia (seco → azul profundo).
 * Temperatura: de la API si la sesión la usa; si no, o si falla, de la copia local (mismos números).
 * Lluvia: igual (mm/año de NASA POWER, campo `valor`). Cada copia va en un chunk aparte
 * para no pesar en la carga inicial. Se prepara una sola vez y la comparten el 3D, el 2D y la leyenda.
 * Vegetación (variable o modo): el NDVI de MODIS por celda de 0,25° (2001–2024), de la API o de su copia local.
 */
export function useCalor(): Calor | null {
  const { variable, vegetacion } = useBusqueda()
  const fuente = useApp((s) => s.fuente)
  // La variable Vegetación y el modo Vegetación pintan la misma malla de NDVI
  const ndvi = vegetacion || variable === 'vegetacion'
  const { data } = useQuery({
    queryKey: ['celdas', ndvi ? 'vegetacion' : variable, fuente],
    queryFn: async () => {
      if (ndvi)
        return prepararCalor(
          (fuente === 'api' && (await celdasDeApi('vegetacion'))) ||
            ((await import('@/data/celdas_vegetacion.json')).default as Malla),
          PARADAS_VEG,
        )
      if (variable === 'lluvia') {
        // API (mm/año, campo `valor`) o, si no hay, la copia local con las mismas celdas
        const m =
          (fuente === 'api' && (await celdasDeApi('lluvia'))) ||
          ((await import('@/data/celdas_lluvia.json')).default as Malla)
        return prepararCalor(m, PARADAS_LLUVIA)
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
