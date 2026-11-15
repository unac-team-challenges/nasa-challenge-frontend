import { useNavigate, useParams, useRouterState, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { VARIABLES, type Variable } from '@/data/datos'
import { ORDEN_PERFILES, type Idioma, type Perfil } from '@/i18n/textos'
import { useApp } from '@/stores/app'

/**
 * Lo que va en la URL (y se comparte): /zona/20?variable=temperatura&perfil=agricultor&anio=2017
 * (la zona va en la ruta; el resto, en la búsqueda).
 * Un valor inválido se ignora (nunca rompe la página). Zustand guarda solo el estado global de la sesión.
 */
const esquema = z.object({
  variable: z
    .enum(VARIABLES as [Variable, ...Variable[]])
    .optional()
    .catch(undefined),
  perfil: z
    .enum(ORDEN_PERFILES as [Perfil, ...Perfil[]])
    .optional()
    .catch(undefined),
  /** Idioma: sin él, español. Un enlace compartido en inglés se abre en inglés. */
  lang: z.enum(['es', 'en']).optional().catch(undefined),
  /** Capa del mapa: «vegetacion» muestra los 5 recuadros con vegetación medida en vez de la variable */
  capa: z.enum(['vegetacion']).optional().catch(undefined),
  /** Año de la máquina del tiempo (sin él se ve la tendencia) */
  anio: z.coerce.number().int().min(1981).max(2100).optional().catch(undefined),
})

/**
 * Todos los valores van como texto simple (?zona=20): el router por defecto los pasa por JSON
 * y dejaría ?zona=%2220%22. La conversión a número (anio) la hace el esquema.
 */
export const parseSearch = (s: string) => Object.fromEntries(new URLSearchParams(s))
export const stringifySearch = (o: Record<string, unknown>) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(o)) if (v != null) p.set(k, String(v))
  const t = p.toString()
  return t ? `?${t}` : ''
}

/** Ubigeo de departamento: "01"–"25" (regex corregido de 07-stack-decidido: no acepta 00, 26 ni 99). */
export const esUbigeo = (id: string) => /^(0[1-9]|1\d|2[0-5])$/.test(id)

export type Busqueda = z.output<typeof esquema>

export const validarBusqueda = (s: Record<string, unknown>): Busqueda => esquema.parse(s)

/**
 * Año de la máquina del tiempo (null = tendencia). Va aparte de useBusqueda a propósito: al
 * arrastrar la barra cambia muchas veces por segundo, y solo deben redibujarse quienes lo usan.
 */
export function useAnio(): number | null {
  // En el modo Vegetación no hay máquina del tiempo: un ?anio suelto no se aplica
  return useSearch({
    strict: false,
    select: (s) => {
      const b = s as Busqueda
      return b.capa === 'vegetacion' || b.variable === 'vegetacion' ? null : (b.anio ?? null)
    },
  })
}

/**
 * Variable, perfil y zona de la URL, con sus funciones para cambiarlos (sin apilar historial).
 * Cada valor se lee con un selector: el componente se redibuja solo si cambia ese valor, no al
 * cambiar el año (para el año, useAnio).
 */
export function useBusqueda() {
  const variable = useSearch({ strict: false, select: (s) => (s as Busqueda).variable })
  const perfil = useSearch({ strict: false, select: (s) => (s as Busqueda).perfil })
  const capa = useSearch({ strict: false, select: (s) => (s as Busqueda).capa })
  const id = useParams({ strict: false, select: (p) => (p as { id?: string }).id })
  const navigate = useNavigate()
  // El modo Vegetación es del explorador: en la portada o en la metodología, ?capa no cambia nada
  const enMapa = useRouterState({
    select: (r) => r.location.pathname === '/explorar' || r.location.pathname.startsWith('/zona/'),
  })
  // El botón «Vegetación» y ?variable=vegetacion son lo mismo: la malla de los 25 departamentos con
  // los 5 recuadros medidos encima
  const vegetacion = enMapa && (capa === 'vegetacion' || variable === 'vegetacion')
  const poner = (cambio: Partial<Busqueda>) =>
    navigate({
      to: '.',
      search: (p: Busqueda) => ({ ...p, ...cambio }),
      replace: true,
      resetScroll: false,
    })
  return {
    variable: vegetacion ? ('vegetacion' as const) : (variable ?? 'lluvia'),
    perfil: perfil ?? 'agricultor',
    sel: id ?? null,
    /** Modo «Vegetación»: la malla de NDVI de los 25 departamentos y los 5 recuadros medidos encima */
    vegetacion,
    setVariable: (variable: Variable) => {
      useApp.getState().setSinNino(false)
      // Al salir del modo Vegetación también se suelta un ?anio que no se veía
      return poner({ variable, capa: undefined, ...(capa ? { anio: undefined } : {}) })
    },
    /** Entra al modo Vegetación (sin máquina del tiempo); desde la portada, lleva al explorador */
    setVegetacion: () => {
      useApp.getState().setReproduciendo(false)
      return navigate({
        to: id ? '/zona/$id' : '/explorar',
        params: id ? { id } : {},
        search: (p: Busqueda) => ({ ...p, capa: 'vegetacion' as const, anio: undefined }),
        replace: true,
      })
    },
    setPerfil: (perfil: Perfil) => poner({ perfil }),
    /** El idioma queda también en la URL (solo `en`; el español es el valor por defecto) */
    setIdioma: (idioma: Idioma) => {
      useApp.getState().setIdioma(idioma)
      return poner({ lang: idioma === 'en' ? 'en' : undefined })
    },
    /** Elegir una zona abre el informe. `desdeMapa`: la presentación solo sale si se tocó el mapa. */
    seleccionar: (zona: string | null, desdeMapa = false) => {
      useApp.setState({ zonaDesdeMapa: desdeMapa })
      if (zona) useApp.getState().setInformeMin(false)
      return zona
        ? navigate({
            to: '/zona/$id',
            params: { id: zona },
            search: (p: Busqueda) => p,
            replace: true,
            resetScroll: false,
          })
        : navigate({
            to: '/explorar',
            search: (p: Busqueda) => p,
            replace: true,
            resetScroll: false,
          })
    },
    setAnio: (anio: number | null) => {
      if (anio == null) useApp.getState().setReproduciendo(false)
      return poner({ anio: anio ?? undefined })
    },
  }
}
