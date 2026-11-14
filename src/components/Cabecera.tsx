import type { Periodo, Variable } from '../data/datos'
import { ORDEN_PERFILES, TEXTOS, type Perfil } from '../i18n/textos'
import { useApp } from '../store'

/**
 * Barra superior: marca, variable, perfil, idioma y tema.
 * En celular pasa a 2 filas: la tira de variable y perfil se desliza de lado (v12).
 * Pendiente: el menú de expedientes.
 */
export function Cabecera() {
  const { idioma, setIdioma, alternarTema, variable, setVariable, perfil, setPerfil } = useApp()
  const { periodo, setPeriodo } = useApp()
  const t = TEXTOS[idioma]
  const variables = Object.entries(t.variables) as [Variable, string][]
  const periodos = Object.entries(t.periodos) as [Periodo, string][]
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
      <div className="order-3 -mx-1 flex flex-[1_1_100%] flex-nowrap items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] min-[901px]:order-none min-[901px]:mx-0 min-[901px]:flex-none min-[901px]:overflow-visible min-[901px]:p-0">
        <div
          className="inline-flex flex-none overflow-hidden rounded-s border border-line-2"
          role="group"
          aria-label={t.variableLbl}
        >
          {variables.map(([v, nombre]) => (
            <button
              key={v}
              type="button"
              aria-pressed={variable === v}
              onClick={() => setVariable(v)}
              className={`presionable min-h-10 cursor-pointer border-0 px-3 text-sm ${
                variable === v ? 'bg-fg font-semibold text-bg' : 'bg-transparent'
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>
        <div
          className="inline-flex flex-none overflow-hidden rounded-s border border-line-2"
          role="group"
          aria-label={t.periodoLbl}
        >
          {periodos.map(([p, nombre]) => (
            <button
              key={p}
              type="button"
              aria-pressed={periodo === p}
              onClick={() => setPeriodo(p)}
              className={`presionable min-h-10 cursor-pointer border-0 px-3 text-sm whitespace-nowrap ${
                periodo === p ? 'bg-fg font-semibold text-bg' : 'bg-transparent'
              }`}
            >
              {nombre}
            </button>
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
