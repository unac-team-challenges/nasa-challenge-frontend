import { ExternalLink } from 'lucide-react'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'

/** Pronósticos y avisos oficiales del tiempo en el Perú. */
const SENAMHI = 'https://www.senamhi.gob.pe/'
/** Comunicados oficiales de la Comisión ENFEN sobre El Niño. */
const ENFEN = 'https://enfen.imarpe.gob.pe/comunicados/'

/**
 * Agricultor: a dónde ir por pronósticos y avisos oficiales. No son consejos nuestros: solo el
 * camino a quien los da.
 */
export function CampoSeguir() {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const enlaces = [
    { href: SENAMHI, texto: t.seguirSenamhi },
    { href: ENFEN, texto: t.seguirEnfen },
  ]

  return (
    <section
      aria-labelledby="seguir-h"
      className="flex flex-col gap-2.5 rounded-m border border-line p-3.5"
    >
      <h3 id="seguir-h" className="m-0 text-sm font-semibold">
        {t.seguirH}
      </h3>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {enlaces.map(({ href, texto }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sm text-accent-text"
            >
              {texto}
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{t.enlaceNueva}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
