import { Link } from '@tanstack/react-router'
import type { Variable } from '@/data/datos'
import { ORDEN_PERFILES, TEXTOS, type Perfil } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

/**
 * Barra superior: marca, variable, perfil, idioma y tema.
 * En celular pasa a 2 filas: la tira de variable y perfil se desliza de lado (v12).
 */
export function Cabecera() {
  const { idioma, alternarTema } = useApp()
  const { variable, setVariable, perfil, setPerfil, setIdioma } = useBusqueda()
  const t = TEXTOS[idioma]
  const variables = Object.entries(t.variables) as [Variable, string][]
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b min-[360px]:gap-x-4.5 border-line bg-panel px-4 py-2.5">
      <Link
        to="/"
        search={(p) => ({ variable: p.variable, perfil: p.perfil, lang: p.lang })}
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
      </Link>
      <div className="order-3 -mx-1 flex flex-[1_1_100%] flex-nowrap items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] min-[901px]:order-none min-[901px]:mx-0 min-[901px]:flex-none min-[901px]:overflow-visible min-[901px]:p-0">
        <div
          className="inline-flex flex-none overflow-hidden rounded-s border border-line-2"
          role="group"
          aria-label={t.variableLbl}
        >
          {variables.map(([v, nombre]) => (
            <Button
              key={v}
              variant="toggle"
              size="sm"
              aria-pressed={variable === v}
              onClick={() => setVariable(v)}
            >
              {nombre}
            </Button>
          ))}
        </div>
        <label className="sr-only" htmlFor="perfil">
          {t.perfilLbl}
        </label>
        <select
          id="perfil"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as Perfil)}
          className="min-h-10 flex-none cursor-pointer rounded-s border border-line-2 bg-panel pr-2 pl-3.5 text-sm hover:border-fg"
        >
          {ORDEN_PERFILES.map((p) => (
            <option key={p} value={p}>
              {t.perfiles[p][0]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link to="/metodologia">{t.metodologiaCorto}</Link>
        </Button>
        {/* Menos de 360 px: un solo botón (globo + idioma actual) que cambia al otro */}
        <Button
          className="gap-1 px-2 min-[360px]:hidden"
          lang={idioma}
          aria-label={`${t.cambiarIdioma} (${idioma.toUpperCase()})`}
          onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
            </g>
          </svg>
          {idioma.toUpperCase()}
        </Button>
        <div
          className="hidden overflow-hidden rounded-s border border-line-2 min-[360px]:inline-flex"
          role="group"
          aria-label={t.cambiarIdioma}
        >
          {(['es', 'en'] as const).map((i) => (
            <Button
              key={i}
              variant="toggle"
              size="sm"
              lang={i}
              aria-pressed={idioma === i}
              onClick={() => setIdioma(i)}
            >
              {i.toUpperCase()}
            </Button>
          ))}
        </div>
        <Button size="icon" aria-label={t.cambiarTema} onClick={alternarTema}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" fill="currentColor" />
          </svg>
        </Button>
      </div>
    </header>
  )
}
