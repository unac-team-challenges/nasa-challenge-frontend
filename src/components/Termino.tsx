import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { TEXTOS, type Termino as Id } from '@/i18n/textos'
import { useApp } from '@/stores/app'

/** Solo el idioma viaja a /metodologia (las demás opciones son del mapa) */
const conIdioma = (p: { lang?: 'es' | 'en' }) => ({ lang: p.lang })

/**
 * Palabra técnica subrayada: lleva a su definición en el glosario de /metodologia (`#g-<id>`).
 * «Volver» en esa página (o el atrás del navegador) regresa a la ficha.
 */
export function Termino({ id, children }: { id: Id; children: ReactNode }) {
  const idioma = useApp((s) => s.idioma)
  return (
    <Link
      to="/metodologia"
      search={conIdioma}
      hash={`g-${id}`}
      hashScrollIntoView={{ block: 'start' }}
      title={TEXTOS[idioma].terminoVer}
      className="text-inherit underline decoration-dotted decoration-1 underline-offset-[3px] hover:text-accent-text hover:decoration-solid"
    >
      {children}
    </Link>
  )
}
