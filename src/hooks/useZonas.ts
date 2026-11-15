import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import {
  datosDeApi,
  detalleDeApi,
  imergDeApi,
  type DatosApi,
  type TendenciaImerg,
} from '@/api/consultas'
import imergLocal from '@/data/imerg.json'
import {
  FUENTE_LOCAL,
  PERIODOS,
  serie,
  zonasDe,
  type Rango,
  type Variable,
  type Zona,
} from '@/data/datos'
import { useApp, type Fuente } from '@/stores/app'
import { useBusqueda, usePeriodo, useSinNino } from '@/lib/busqueda'
import type { Ruta } from '@/hooks/ruta'

/** Las dos variables de la API, pedidas una sola vez al abrir la web. */
function useDatosApi() {
  return useQuery({ queryKey: ['api'], queryFn: datosDeApi, staleTime: Infinity, retry: false })
}

/**
 * Fuente de la sesión: la fija lo primero que pase.
 *   - La API contesta: 'api' si trajo datos; 'local' si falló o vino incompleta.
 *   - Se entra al mapa antes de que conteste: 'local' toda la sesión (sin saltos).
 * Mientras tanto (null) la portada muestra la copia local.
 */
export function decidirFuente(
  actual: Fuente | null,
  ruta: Ruta,
  cargando: boolean,
  datos: unknown,
): Fuente | null {
  if (actual) return actual
  if (!cargando) return datos ? 'api' : 'local'
  return ruta === 'explorar' ? 'local' : null
}

/** Pide la API al abrir la web y fija la fuente (se llama una vez, en App). */
export function useDecidirFuente(ruta: Ruta) {
  const { isPending, data } = useDatosApi()
  const actual = useApp((s) => s.fuente)
  const fijar = useApp((s) => s.fijarFuente)
  const nueva = decidirFuente(actual, ruta, isPending, data)
  useEffect(() => {
    if (nueva && !actual) fijar(nueva)
  }, [nueva, actual, fijar])
}

/**
 * Lo que se ve de una variable: datos de la API (o null = copia local), sus años y su fuente.
 * La API solo cubre la vista principal (2001–2024, con El Niño): la variante sin El Niño
 * y la máquina del tiempo usan la copia local hasta que el contrato las incluya.
 */
export function useVista(v?: Variable): { api: DatosApi | null; rango: Rango; fuente: string } {
  const elegida = useBusqueda().variable
  const variable = v ?? elegida
  const periodo = usePeriodo()
  const sinNino = useSinNino()
  const decidida = useApp((s) => s.fuente)
  const { data } = useDatosApi()
  const api =
    decidida === 'api' && periodo === 'reciente' && !sinNino ? (data?.[variable] ?? null) : null
  return api
    ? { api, rango: api.rango, fuente: api.fuente }
    : { api: null, rango: PERIODOS[periodo], fuente: FUENTE_LOCAL }
}

/** Años de la tendencia que se ve. */
export function useRango(v?: Variable): Rango {
  return useVista(v).rango
}

/** Estadística por zona de la variable elegida: API si está completa; si no, copia local. */
export function useZonas(): Record<string, Zona> {
  return useZonasDe(useBusqueda().variable)
}

/** Lo mismo para una variable dada (p. ej. la que no se está viendo, para «¿Y el calor?»). */
export function useZonasDe(variable: Variable): Record<string, Zona> {
  const periodo = usePeriodo()
  const sinNino = useSinNino()
  const { api } = useVista(variable)
  const local = useMemo(() => zonasDe(variable, periodo, sinNino), [variable, periodo, sinNino])
  return api?.zonas ?? local
}

/**
 * Serie anual y aviso de una zona, de la misma fuente que sus tendencias (para que el gráfico cuadre).
 * Con la API, serie = null mientras carga o si falla: no se mezcla con la copia local.
 */
export function useDetalle(id: string | null): {
  serie: { y: number; v: number }[] | null
  nota: string | null
  /** Con la API: cargando mientras llega, error si no llegó (la copia local siempre está lista) */
  estado: 'cargando' | 'error' | 'ok'
  reintentar: () => void
} {
  const { variable } = useBusqueda()
  const sinNino = useSinNino()
  const { api, rango } = useVista()
  const { data, refetch } = useQuery({
    queryKey: ['detalle', variable, id],
    queryFn: () => detalleDeApi(id!, variable),
    enabled: !!api && !!id,
    staleTime: Infinity,
    // Sin placeholderData: al cambiar de variable la serie anterior (otra unidad) no se reutiliza.
  })
  const local = useMemo(
    () => (id ? serie(id, variable, rango, sinNino) : null),
    [id, variable, rango, sinNino],
  )
  if (api) {
    // detalleDeApi devuelve null si la API falló o vino vacía
    const estado = data === undefined ? 'cargando' : data === null ? 'error' : 'ok'
    return { serie: data?.serie ?? null, nota: data?.nota ?? null, estado, reintentar: refetch }
  }
  return { serie: local, nota: null, estado: 'ok', reintentar: refetch }
}

/**
 * Segunda fuente de lluvia (GPM IMERG) para «¿Coinciden dos fuentes de NASA?».
 * De la API si la sesión usa la API; si no, de la copia local (src/data/imerg.json, los mismos
 * números). Solo existe para la tendencia 2001–2024 con El Niño, y solo se compara cuando la lluvia
 * principal es la de POWER (con un backend viejo, la API servía IMERG como lluvia principal).
 */
export function useSegundaFuente(): Record<string, TendenciaImerg> | null {
  const decidida = useApp((s) => s.fuente)
  const sinNino = useSinNino()
  const periodo = usePeriodo()
  const { api } = useVista('lluvia')
  const { data } = useQuery({
    queryKey: ['imerg'],
    queryFn: imergDeApi,
    enabled: decidida === 'api',
    staleTime: Infinity,
    retry: false,
  })
  if (sinNino || periodo !== 'reciente') return null
  // Si la lluvia de la ficha viene de la API, IMERG también: un backend sin lluvia_imerg (el viejo,
  // con IMERG como lluvia principal) da null y no se compara. Si viene de la copia local, la de IMERG.
  if (api) return data ?? null
  return imergLocal.zonas as Record<string, TendenciaImerg>
}
