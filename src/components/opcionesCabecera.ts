import { CloudRain, GraduationCap, Leaf, Sprout, Thermometer, type LucideIcon } from 'lucide-react'
import type { Variable } from '@/data/datos'
import type { Idioma, Perfil } from '@/i18n/textos'
import type { Busqueda } from '@/lib/busqueda'

/** Lo que comparten la cabecera de escritorio y la de celular */
export const ICONO_VARIABLE: Record<Variable, LucideIcon> = {
  lluvia: CloudRain,
  temperatura: Thermometer,
  vegetacion: Leaf,
}

export const ICONO_PERFIL: Record<Perfil, LucideIcon> = {
  agricultor: Sprout,
  estudiante: GraduationCap,
}

export const IDIOMAS = [
  ['es', 'ES', 'Español'],
  ['en', 'EN', 'English'],
] as const satisfies readonly (readonly [Idioma, string, string])[]

/** Al inicio viajan las opciones del mapa y el idioma (no el año ni la zona) */
export const aInicio = (p: Busqueda) => ({ variable: p.variable, perfil: p.perfil, lang: p.lang })
