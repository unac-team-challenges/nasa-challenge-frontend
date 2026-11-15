import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { VARIABLES, type Variable } from '@/data/datos'
import { ORDEN_PERFILES, type Perfil } from '@/i18n/textos'
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

/** Variable, perfil, zona y año de la URL, con sus funciones para cambiarlos (sin apilar historial). */
export function useBusqueda() {
  const s = useSearch({ strict: false }) as Busqueda
  const { id } = useParams({ strict: false }) as { id?: string }
  const navigate = useNavigate()
  const poner = (cambio: Partial<Busqueda>) =>
    navigate({ to: '.', search: (p: Busqueda) => ({ ...p, ...cambio }), replace: true })
  return {
    variable: s.variable ?? 'lluvia',
    perfil: s.perfil ?? 'agricultor',
    sel: id ?? null,
    anio: s.anio ?? null,
    setVariable: (variable: Variable) => {
      useApp.getState().setSinNino(false)
      return poner({ variable })
    },
    setPerfil: (perfil: Perfil) => poner({ perfil }),
    /** Elegir una zona abre el informe */
    seleccionar: (zona: string | null) => {
      if (zona) useApp.getState().setInformeMin(false)
      return zona
        ? navigate({
            to: '/zona/$id',
            params: { id: zona },
            search: (p: Busqueda) => p,
            replace: true,
          })
        : navigate({ to: '/explorar', search: (p: Busqueda) => p, replace: true })
    },
    setAnio: (anio: number | null) => {
      if (anio == null) useApp.getState().setReproduciendo(false)
      return poner({ anio: anio ?? undefined })
    },
  }
}
