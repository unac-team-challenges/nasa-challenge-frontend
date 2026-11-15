import { useQuery } from '@tanstack/react-query'
import { celdasDeApi, type Malla } from '@/api/consultas'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { PARADAS_LLUVIA, PARADAS_VEG, prepararCalor, type Calor } from '@/features/mapa/utils/calor'

/**
 * Malla por celda del mapa de color: temperatura (frío → calor) o lluvia (seco → azul profundo).
 * Temperatura: de la API si la sesión la usa; si no, o si falla, de la copia local (mismos números).
 * Lluvia: solo la copia local (mm/año de NASA POWER, mismas celdas). Cada copia va en un chunk aparte
 * para no pesar en la carga inicial. Se prepara una sola vez y la comparten el 3D, el 2D y la leyenda.
 * Modo Vegetación: el NDVI de MODIS por celda de 0,25° (2001–2024), de la API o de su copia local.
 */
export function useCalor(): Calor | null {
  const { variable, vegetacion } = useBusqueda()
  const fuente = useApp((s) => s.fuente)
  const { data } = useQuery({
    queryKey: ['celdas', vegetacion ? 'vegetacion' : variable, fuente],
    queryFn: async () => {
      if (vegetacion)
        return prepararCalor(
          (fuente === 'api' && (await celdasDeApi('vegetacion'))) ||
            ((await import('@/data/celdas_vegetacion.json')).default as Malla),
          PARADAS_VEG,
        )
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
