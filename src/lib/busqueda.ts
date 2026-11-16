import {
  useNavigate,
  useParams,
  useRouter,
  useRouterState,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import { VARIABLES, type Periodo, type Variable } from '@/data/datos'
import { ORDEN_PERFILES, type Idioma, type Perfil } from '@/i18n/textos'
import { useApp } from '@/stores/app'

const PERIODOS_URL: Periodo[] = ['largo', 'reciente']

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
  /** Idioma: sin él, inglés. `?lang=es` abre en español. */
  lang: z.enum(['es', 'en']).optional().catch(undefined),
  /** Periodo de la tendencia: sin él, `reciente` (2001–2024). `largo` es 1981–2024. */
  periodo: z
    .enum(PERIODOS_URL as [Periodo, ...Periodo[]])
    .optional()
    .catch(undefined),
  /** `1` = tendencia sin los años de El Niño (solo lluvia); sin él, con todos los años. */
  sinnino: z.literal('1').optional().catch(undefined),
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

// Los enlaces viejos con ?capa=vegetacion («Lugares medidos», ya quitado) abren la variable Vegetación
export const validarBusqueda = (s: Record<string, unknown>): Busqueda =>
  esquema.parse(s.capa === 'vegetacion' ? { ...s, variable: 'vegetacion' } : s)

/**
 * Año de la máquina del tiempo (null = tendencia). Va aparte de useBusqueda a propósito: al
 * arrastrar la barra cambia muchas veces por segundo, y solo deben redibujarse quienes lo usan.
 */
export function useAnio(): number | null {
  return useSearch({ strict: false, select: (s) => (s as Busqueda).anio ?? null })
}

/** Periodo de la tendencia (de la URL; `reciente` por defecto). */
export function usePeriodo(): Periodo {
  return useSearch({ strict: false, select: (s) => (s as Busqueda).periodo ?? 'reciente' })
}

/** ¿La tendencia va sin los años de El Niño? (de la URL) */
export function useSinNino(): boolean {
  return useSearch({ strict: false, select: (s) => (s as Busqueda).sinnino === '1' })
}

/**
 * Variable, perfil y zona de la URL, con sus funciones para cambiarlos (sin apilar historial).
 * Cada valor se lee con un selector: el componente se redibuja solo si cambia ese valor, no al
 * cambiar el año (para el año, useAnio).
 */
export function useBusqueda() {
  const variable = useSearch({ strict: false, select: (s) => (s as Busqueda).variable })
  const perfil = useSearch({ strict: false, select: (s) => (s as Busqueda).perfil })
  const id = useParams({ strict: false, select: (p) => (p as { id?: string }).id })
  const navigate = useNavigate()
  // La vista de verdor es del explorador: en la portada la vegetación va en columnas como las demás
  const enMapa = useRouterState({
    select: (r) => r.location.pathname === '/explorar' || r.location.pathname.startsWith('/zona/'),
  })
  // El 2D no tiene bosque: ahí la vegetación se ve como las demás variables
  const en3d = useApp((s) => s.modoMapa === '3d')
  const vegetacion = enMapa && en3d && variable === 'vegetacion'
  const router = useRouter() // sin suscripción: la ruta se lee solo al hacer clic
  const poner = (cambio: Partial<Busqueda>) => {
    // En la metodología la variable y el perfil no tienen dónde verse: se va al mapa con ellos
    const alMapa = !('lang' in cambio) && router.state.location.pathname.startsWith('/metodologia')
    return navigate({
      to: alMapa ? '/explorar' : '.',
      search: (p: Busqueda) => ({ ...p, ...cambio }),
      replace: !alMapa, // ir al mapa sí entra al historial: «atrás» vuelve a la metodología
      resetScroll: alMapa,
    })
  }
  return {
    variable: variable ?? 'lluvia',
    perfil: perfil ?? 'agricultor',
    sel: id ?? null,
    /**
     * Vista de verdor: la variable Vegetación en el explorador. El mapa 3D sube cada departamento
     * según su verdor medio y planta el bosque; el informe sigue con la tendencia (los datos no cambian).
     */
    vegetacion,
    // Cambiar de variable quita «sin El Niño» (solo existe para la lluvia)
    setVariable: (variable: Variable) => poner({ variable, sinnino: undefined }),
    /** Cambiar el periodo detiene la reproducción de la barra de tiempo. */
    setPeriodo: (periodo: Periodo) => {
      useApp.getState().setReproduciendo(false)
      return poner({ periodo: periodo === 'reciente' ? undefined : periodo })
    },
    setSinNino: (sin: boolean) => poner({ sinnino: sin ? '1' : undefined }),
    setPerfil: (perfil: Perfil) => poner({ perfil }),
    /** El idioma queda también en la URL (solo `es`; el inglés es el valor por defecto) */
    setIdioma: (idioma: Idioma) => {
      useApp.getState().setIdioma(idioma)
      return poner({ lang: idioma === 'es' ? 'es' : undefined })
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
