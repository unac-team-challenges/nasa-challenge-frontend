import { useQuery } from '@tanstack/react-query'
import { vegetacionDeApi } from '@/api/consultas'

/** Cifras del Caso 2 desde la API, pedidas una vez. Sin API o con error: undefined (se usa caso2.ts). */
export function useVegetacion() {
  return useQuery({
    queryKey: ['vegetacion'],
    queryFn: vegetacionDeApi,
    staleTime: Infinity,
    retry: false,
  }).data
}
