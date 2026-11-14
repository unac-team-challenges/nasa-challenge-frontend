import { TEXTOS } from '../i18n/textos'
import { useApp } from '../store'

/** Barra superior: marca, idioma y tema. Variable, perfil y expedientes llegan con el explorador. */
export function Cabecera() {
  const { idioma, setIdioma, alternarTema } = useApp()
  const t = TEXTOS[idioma]
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4.5 gap-y-2.5 border-b border-line bg-panel px-4 py-2.5">
      <a
        href="#inicio"
        className="mr-auto flex items-center gap-2.5 text-fg no-underline"
        aria-label={t.inicio}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" className="flex-none">
          <circle cx="13" cy="13" r="10" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <line
            x1="20.5"
            y1="20.5"
            x2="27"
            y2="27"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="7.5" y="9" width="3" height="7" rx="1" fill="var(--up)" />
          <rect x="11.5" y="13" width="3" height="5" rx="1" fill="var(--down)" />
          <rect x="15.5" y="7" width="3" height="9" rx="1" fill="var(--up)" />
        </svg>
        <b className="font-display text-base font-bold tracking-display sm:text-lg">{t.marca}</b>
      </a>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="presionable inline-flex min-h-10 cursor-pointer items-center rounded-s border border-line-2 bg-panel px-3.5 text-sm hover:border-fg"
          aria-label={t.cambiarIdioma}
          onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
        >
          {idioma === 'es' ? 'EN' : 'ES'}
        </button>
        <button
          type="button"
          className="presionable inline-flex size-10 cursor-pointer items-center justify-center rounded-s border border-line-2 bg-panel hover:border-fg"
          aria-label={t.cambiarTema}
          onClick={alternarTema}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  )
}
