import { useQuery } from '@tanstack/react-query'
import { coberturaDeApi } from '@/api/consultas'

/** Árboles de la selva desde la API, pedidos una vez. Sin API o con error: undefined (se usa selva.ts). */
export function useCobertura() {
  return useQuery({
    queryKey: ['cobertura-arboles'],
    queryFn: coberturaDeApi,
    staleTime: Infinity,
    retry: false,
  }).data
}
