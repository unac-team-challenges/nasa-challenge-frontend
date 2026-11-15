import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { NOMBRE } from '../data/datos'
import { TEXTOS } from '../i18n/textos'
import { ALTO_MAPA_CELULAR } from '../lib/disposicion'
import { fmtValor } from '../lib/formato'
import { useRango, useZonas } from '../lib/useZonas'
import { escenaActiva } from '../mapa/escena'
import { useApp } from '../store'
import { colorDireccion } from '../lib/direccion'
import { Ficha } from './Ficha'
import { BarraTiempo } from './BarraTiempo'
import { Leyenda } from './Leyenda'

const boton =
  'presionable inline-flex size-10 cursor-pointer items-center justify-center rounded-s border border-line-2 bg-panel/92 hover:border-fg'

/** Ancho del informe abierto en escritorio y de su franja minimizada. */
const ANCHO_INFORME = 'clamp(340px, 38vw, 560px)'
const FRANJA = 56
/**
 * Explorador: el mapa es el fondo de toda la pantalla y el informe se desliza encima, a la
 * derecha. Antes el informe cambiaba las columnas de la grilla: el lienzo 3D cambiaba de
 * tamaño de golpe y la página parpadeaba al elegir una zona. Ahora el lienzo no se toca: la
 * cámara corre el Perú a la izquierda del informe (setPanel) y todo se anima.
 */
export function Explorador() {
  const { idioma, variable, sel, sinNino, informeMin, setInformeMin, seleccionar } = useApp()
  const { conWebgl, modoMapa, setModoMapa, anio, girando } = useApp()
  const en3d = modoMapa === '3d'
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const rango = useRango()
  const d = sel ? zonas[sel] : null
  const etiquetaInforme = informeMin ? t.showReport : t.hideReport
  const informe = useRef<HTMLElement>(null)
  const [anchoInforme, setAnchoInforme] = useState(0)

  // El informe tapa parte del mapa: la escena corre el Perú para que quede a la vista
  useEffect(() => {
    const el = informe.current
    if (!el) return
    const ro = new ResizeObserver(() => setAnchoInforme(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    escenaActiva.current?.setPanel(informeMin ? FRANJA : anchoInforme)
  }, [informeMin, anchoInforme, modoMapa])

  const volverAlInicio = () => {
    seleccionar(null)
    setInformeMin(true)
    escenaActiva.current?.recentrar()
  }
  const estilo = {
    '--ancho-informe': ANCHO_INFORME,
    '--tapa': informeMin ? `${FRANJA}px` : 'var(--ancho-informe)',
  } as CSSProperties

  return (
    <section
      aria-label={t.explorador}
      style={estilo}
      className="pointer-events-none relative z-[1] flex flex-1 flex-col min-[901px]:min-h-[560px]"
    >
      {/* Zona del mapa: en celular, el alto del mapa; en escritorio, todo menos el informe */}
      <div
        className={`relative flex-none ${ALTO_MAPA_CELULAR} min-[901px]:absolute min-[901px]:inset-y-0 min-[901px]:left-0 min-[901px]:right-[var(--tapa)] min-[901px]:h-auto min-[901px]:transition-[right] min-[901px]:duration-500 min-[901px]:ease-[cubic-bezier(0.2,0.8,0.2,1)]`}
      >
        <div className="entrada-suave">
          <div className="pointer-events-none absolute top-3.5 right-24 left-4 z-[3] flex flex-col gap-2.5 min-[901px]:right-32">
            <div className="vidrio pointer-events-auto flex flex-wrap items-baseline gap-x-2.5 self-start rounded-m px-3 py-1.5">
              <h2 className="m-0 font-display text-xl font-[650] tracking-display">
                {t.mapH[variable]}
              </h2>
              <span className="text-[13px] text-muted">
                {anio == null ? t.mapSub(rango.year_start, rango.year_end) : t.legTimeNote(anio)}
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
          <div className="pointer-events-auto contents">
            <Leyenda />
            <BarraTiempo />
          </div>
          <div className="pointer-events-auto absolute right-4 bottom-3.5 z-[3] flex gap-1.5">
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
              onClick={() => escenaActiva.current?.alternarGiro()}
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
              className={boton}
              aria-label={t.recenter}
              title={t.recenter}
              onClick={volverAlInicio}
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

      {/* Informe: en escritorio se desliza sobre el mapa; minimizado deja una franja de 56 px */}
      <aside
        ref={informe}
        className={`pointer-events-auto relative flex min-w-0 overflow-hidden border-line bg-panel min-[901px]:absolute min-[901px]:inset-y-0 min-[901px]:right-0 min-[901px]:w-[var(--ancho-informe)] min-[901px]:border-l min-[901px]:shadow-[-12px_0_32px_var(--shadow)] min-[901px]:transition-transform min-[901px]:duration-500 min-[901px]:ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          informeMin ? 'min-[901px]:translate-x-[calc(100%-56px)]' : ''
        }`}
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
              ? 'flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 border-0 bg-panel px-4 text-fg min-[901px]:h-full min-[901px]:w-14 min-[901px]:flex-none min-[901px]:flex-col min-[901px]:justify-start min-[901px]:px-0 min-[901px]:py-3.5'
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
            <div key={sel ?? 'ninguna'} className="entrada">
              <Ficha />
            </div>
          </div>
        )}
      </aside>
    </section>
  )
}
