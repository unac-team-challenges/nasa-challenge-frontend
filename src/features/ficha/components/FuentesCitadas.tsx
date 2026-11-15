import { ExternalLink } from 'lucide-react'
import { TEXTOS, type Perfil } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { FUENTES, type IdFuente } from '@/features/ficha/data/causas'

/**
 * Las fuentes de un bloque. Agricultor: «Fuente:» con el nombre corto y el enlace. Estudiante:
 * la referencia completa en APA, con su DOI o enlace.
 */
export function FuentesCitadas({ ids, perfil }: { ids: IdFuente[]; perfil: Perfil }) {
  const t = TEXTOS[useApp((s) => s.idioma)]
  const unicas = [...new Set(ids)]
  if (perfil === 'agricultor')
    return (
      <p className="m-0 text-xs text-muted">
        {t.causasFuente}:{' '}
        {unicas.map((id, i) => (
          <span key={id}>
            {i > 0 && ' · '}
            <a href={FUENTES[id].url} target="_blank" rel="noopener" className="text-accent-text">
              {FUENTES[id].corta}
            </a>
          </span>
        ))}
        <span className="sr-only"> {t.enlaceNueva}</span>
      </p>
    )
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{t.causasRefs}</span>
      <ol className="m-0 flex flex-col gap-1.5 pl-5 text-xs">
        {unicas.map((id) => (
          <li key={id}>
            {FUENTES[id].apa}{' '}
            <a
              href={FUENTES[id].url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 break-all text-accent-text"
            >
              {FUENTES[id].url}
              <ExternalLink className="size-3 flex-none" aria-hidden="true" />
              <span className="sr-only">{t.enlaceNueva}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
