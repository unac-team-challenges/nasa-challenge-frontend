import { useRef, useState } from 'react'
import { NOMBRE, PERIODOS } from '../data/datos'
import { TEXTOS } from '../i18n/textos'
import { fmtValor } from '../lib/formato'
import { useZonas } from '../lib/useZonas'
import { EscenaPeru } from '../mapa/escena'
import { Mapa2D } from '../mapa/Mapa2D'
import { Mapa3D } from '../mapa/Mapa3D'
import { useApp } from '../store'
import { colorDireccion } from '../lib/direccion'
import { Ficha } from './Ficha'
import { Leyenda } from './Leyenda'

const boton =
  'presionable inline-flex size-10 cursor-pointer items-center justify-center rounded-s border border-line-2 bg-panel/92 hover:border-fg'

/**
 * Explorador (v10): el mapa abre a todo el ancho con el informe minimizado;
 * al tocar una zona, el informe se abre solo.
 */
export function Explorador() {
  const { idioma, variable, sel, sinNino, informeMin, setInformeMin } = useApp()
  const { conWebgl, modoMapa, setModoMapa, periodo } = useApp()
  const en3d = modoMapa === '3d'
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const escena = useRef<EscenaPeru | null>(null)
  const [girando, setGirando] = useState(true)
  const d = sel ? zonas[sel] : null
  const etiquetaInforme = informeMin ? t.showReport : t.hideReport

  return (
    <section
      aria-label={t.explorador}
      className={`grid flex-1 grid-cols-1 min-[901px]:min-h-[560px] ${
        informeMin
          ? 'min-[901px]:grid-cols-[minmax(0,1fr)_56px]'
          : 'min-[901px]:grid-cols-[minmax(0,62fr)_minmax(340px,38fr)]'
      }`}
    >
      {/* Mapa */}
      <div className="relative flex min-w-0 flex-col border-b border-line min-[901px]:border-r min-[901px]:border-b-0">
        <div className="relative h-[62vh] min-h-80 flex-none min-[901px]:h-auto min-[901px]:flex-1">
          {/* En 2D el 3D se desmonta: libera la tarjeta gráfica */}
          {en3d ? <Mapa3D modo="explorar" controlRef={escena} alGirar={setGirando} /> : <Mapa2D />}
          <div className="pointer-events-none absolute top-3.5 right-4 left-4 z-[3] flex flex-col gap-2.5">
            <div className="pointer-events-auto flex flex-wrap items-baseline gap-2.5">
              <h2 className="m-0 font-display text-xl font-[650] tracking-display">
                {t.mapH[variable]}
              </h2>
              <span className="text-[13px] text-muted">
                {t.mapSub(PERIODOS[periodo].year_start, PERIODOS[periodo].year_end)}
              </span>
            </div>
            {!conWebgl && (
              <p className="pointer-events-auto m-0 max-w-136 rounded-m border border-accent bg-accent-soft px-3 py-2 text-[13px] text-fg">
                {t.noGl}
              </p>
            )}
            {sinNino && variable === 'lluvia' && (
              <p className="pointer-events-auto m-0 max-w-136 rounded-m border border-accent bg-accent-soft px-3 py-2 text-[13px] text-fg">
                {t.ninoOn}
              </p>
            )}
          </div>
          <Leyenda />
          <div className="absolute right-4 bottom-3.5 z-[3] flex gap-1.5">
            {conWebgl && (
              <div
                className="inline-flex overflow-hidden rounded-s border border-line-2 bg-panel/92"
                role="group"
                aria-label={t.vistaMapa}
              >
                {(['3d', '2d'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={modoMapa === m}
                    onClick={() => setModoMapa(m)}
                    className={`presionable min-h-10 cursor-pointer border-0 px-3 text-sm ${
                      modoMapa === m ? 'bg-fg font-semibold text-bg' : 'bg-transparent'
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className={`${boton} disabled:cursor-default disabled:opacity-40`}
              disabled={!en3d}
              aria-pressed={girando}
              aria-label={girando ? t.spinOn : t.spinOff}
              title={girando ? t.spinOn : t.spinOff}
              onClick={() => escena.current?.alternarGiro()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={`${boton} disabled:cursor-default disabled:opacity-40`}
              disabled={!en3d}
              aria-label={t.recenter}
              title={t.recenter}
              onClick={() => escena.current?.recentrar()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path
                  d="M12 2v4M12 18v4M2 12h4M18 12h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Informe (minimizable a una franja que muestra la zona y su valor) */}
      <aside
        className="relative flex min-w-0 overflow-hidden bg-panel"
        aria-label={etiquetaInforme}
      >
        <button
          type="button"
          aria-expanded={!informeMin}
          aria-controls="informe"
          aria-label={etiquetaInforme}
          title={etiquetaInforme}
          onClick={() => setInformeMin(!informeMin)}
          className={
            informeMin
              ? 'flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 border-0 bg-panel px-4 text-fg min-[901px]:h-full min-[901px]:flex-col min-[901px]:justify-start min-[901px]:px-0 min-[901px]:py-3.5'
              : 'presionable absolute top-3 right-3 z-[2] grid size-9 cursor-pointer place-items-center rounded-s border border-line-2 bg-panel text-fg hover:border-fg'
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
            <path
              d={informeMin ? 'M18 6l-6 6 6 6M12 6l-6 6 6 6' : 'M6 6l6 6-6 6M12 6l6 6-6 6'}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {informeMin && (
            <>
              <span className="font-display text-[15px] font-[650] tracking-display whitespace-nowrap min-[901px]:rotate-180 min-[901px]:[writing-mode:vertical-rl]">
                {sel ? NOMBRE[sel] : t.railHint}
              </span>
              {d && d.status !== 'pocos_datos' && (
                <span
                  className="text-[13px] min-[901px]:rotate-180 min-[901px]:[writing-mode:vertical-rl]"
                  style={{ color: `var(${colorDireccion(d.slope_per_decade, variable)})` }}
                >
                  {fmtValor(d.slope_per_decade, variable, idioma)}
                </span>
              )}
            </>
          )}
        </button>
        {!informeMin && (
          <div
            id="informe"
            className="min-w-0 flex-1 px-4 pt-5.5 pb-7 min-[901px]:overflow-y-auto min-[901px]:px-5.5"
            aria-live="polite"
          >
            <Ficha />
          </div>
        )}
      </aside>
    </section>
  )
}
