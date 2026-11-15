import { useQuery } from '@tanstack/react-query'
import { celdasDeApi, type Malla } from '@/api/consultas'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { prepararCalor, type Calor } from '@/features/mapa/utils/calor'

/**
 * Malla de temperatura por celda (mapa de calor), solo con la variable temperatura.
 * De la API si la sesión la usa; si no, o si falla, de la copia local (mismos números), que va en
 * un chunk aparte para no pesar en la carga inicial. Se prepara una sola vez y la comparten el 3D,
 * el 2D y la leyenda.
 */
export function useCalor(): Calor | null {
  const { variable, vegetacion } = useBusqueda()
  const fuente = useApp((s) => s.fuente)
  const { data } = useQuery({
    queryKey: ['celdas', fuente],
    queryFn: async () =>
      prepararCalor(
        (fuente === 'api' && (await celdasDeApi())) ||
          ((await import('@/data/celdas_temperatura.json')).default as Malla),
      ),
    enabled: variable === 'temperatura' && fuente != null,
    staleTime: Infinity,
    retry: false,
  })
  // En el modo Vegetación los departamentos quedan de fondo: sin mapa de calor
  return variable === 'temperatura' && !vegetacion ? (data ?? null) : null
}
