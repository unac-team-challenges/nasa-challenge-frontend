import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { NOMBRE, REGION } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { ALTO_MAPA_CELULAR } from '@/utils/disposicion'
import { fmtValor } from '@/utils/formato'
import { useRango, useZonas } from '@/hooks/useZonas'
import { escenaActiva } from '@/features/mapa/escena/escena'
import { Mapa2D } from '@/features/mapa/components/Mapa2D'
import { useApp } from '@/stores/app'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { AyudaModo } from '@/features/tiempo/components/AyudaModo'
import { BarraTiempo } from '@/features/tiempo/components/BarraTiempo'
import { Ficha } from '@/features/ficha/components/Ficha'
import { Leyenda } from '@/features/mapa/components/Leyenda'
import { Popover } from 'radix-ui'
import { Button } from '@/components/ui/button'

const boton = 'bg-panel/92'

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
/** Ancho del informe abierto en escritorio y de su franja minimizada. */
const ANCHO_INFORME = 'clamp(340px, 38vw, 560px)'
const FRANJA = 56
/** Presentación del departamento elegido: entra, se queda y sale (ms, igual que en index.css). */
const PRESENTACION_MS = 1900
/** La información aparece cuando la presentación ya se está yendo. */
const RETRASO_INFO_S = 1.3

/**
 * Explorador: el mapa es el fondo de toda la pantalla y el informe se desliza encima, a la
 * derecha. Antes el informe cambiaba las columnas de la grilla: el lienzo 3D cambiaba de
 * tamaño de golpe y la página parpadeaba al elegir una zona. Ahora el lienzo no se toca: la
 * cámara corre el Perú a la izquierda del informe (setPanel) y todo se anima.
 */
export function Explorador() {
  const { idioma, sinNino, informeMin, setInformeMin, zonaDesdeMapa } = useApp()
  const { conWebgl, modoMapa, setModoMapa, girando } = useApp()
  const { variable, sel, anio, seleccionar } = useBusqueda()
  const en3d = modoMapa === '3d'
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const rango = useRango()
  const d = sel ? zonas[sel] : null
  const etiquetaInforme = informeMin ? t.showReport : t.hideReport
  const informe = useRef<HTMLElement>(null)
  const [anchoInforme, setAnchoInforme] = useState(0)

  // Presentación breve del departamento elegido; luego aparece su información. Se decide al
  // renderizar (patrón «ajustar estado cuando cambia una prop»), no en un efecto.
  const [intro, setIntro] = useState<{ id: string; n: number } | null>(null)
  const [abrirTarde, setAbrirTarde] = useState(false)
  const [previa, setPrevia] = useState({ sel, informeMin })
  if (sel !== previa.sel || informeMin !== previa.informeMin) {
    setPrevia({ sel, informeMin })
    if (sel !== previa.sel) {
      const animar = !!sel && zonaDesdeMapa && !reducido()
      setIntro(animar && sel ? { id: sel, n: (intro?.n ?? 0) + 1 } : null)
      // si el informe estaba cerrado, se abre cuando la presentación termina
      setAbrirTarde(animar && previa.informeMin)
    }
  }
  useEffect(() => {
    if (!intro) return
    const fin = setTimeout(() => setIntro(null), PRESENTACION_MS)
    return () => clearTimeout(fin)
  }, [intro])

  // Si el informe nuevo es más corto, el navegador baja la página sin avisar: se lleva la vista
  // al principio del informe (nunca al mapa). Si cabe, la posición no se toca.
  const ultimoY = useRef(0)
  useEffect(() => {
    const guardar = () => (ultimoY.current = window.scrollY)
    window.addEventListener('scroll', guardar, { passive: true })
    return () => window.removeEventListener('scroll', guardar)
  }, [])
  useLayoutEffect(() => {
    if (window.scrollY < ultimoY.current - 1) informe.current?.scrollIntoView({ block: 'start' })
  }, [sel])

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
    useApp.setState((s) => ({ reinicio2d: s.reinicio2d + 1 }))
  }
  // El informe y la zona del mapa se mueven juntos, cuando la presentación ya se va
  const demoraPanel = !informeMin && abrirTarde ? `${RETRASO_INFO_S - 0.2}s` : '0s'
  const estilo = {
    '--ancho-informe': ANCHO_INFORME,
    '--tapa': informeMin ? `${FRANJA}px` : 'var(--ancho-informe)',
  } as CSSProperties

  // Los controles del mapa, en un solo lugar: en escritorio van a la vista y en celular, en el menú «⋯»
  const controles = (
    <>
      {conWebgl && (
        <div
          className="inline-flex overflow-hidden rounded-s border border-line-2 bg-panel/92"
          role="group"
          aria-label={t.vistaMapa}
        >
          {(['3d', '2d'] as const).map((m) => (
            <Button
              key={m}
              variant="toggle"
              size="sm"
              aria-pressed={modoMapa === m}
              onClick={() => setModoMapa(m)}
            >
              {m.toUpperCase()}
            </Button>
          ))}
        </div>
      )}
      <Button
        size="icon"
        className={boton}
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
      </Button>
      <Button
        size="icon"
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
      </Button>
    </>
  )

  return (
    <section
      aria-label={t.explorador}
      style={estilo}
      className="pointer-events-none relative z-[1] flex flex-1 flex-col min-[901px]:min-h-[560px]"
    >
      {/* Zona del mapa: en celular, el alto del mapa; en escritorio, todo menos el informe */}
      <div
        className={`relative flex-none ${ALTO_MAPA_CELULAR} min-[901px]:absolute min-[901px]:inset-y-0 min-[901px]:left-0 min-[901px]:right-[var(--tapa)] min-[901px]:h-auto min-[901px]:transition-[right] min-[901px]:duration-500 min-[901px]:ease-[cubic-bezier(0.2,0.8,0.2,1)]`}
        style={{ transitionDelay: demoraPanel }}
      >
        {intro && (
          <div
            key={intro.n}
            className="presentacion absolute inset-0 z-[4] grid place-items-center px-4 text-center"
            aria-hidden="true"
          >
            <div>
              <p className="presentacion-nombre">{NOMBRE[intro.id]}</p>
              <p className="presentacion-sub">{t.introDepto[REGION[intro.id]]}</p>
            </div>
          </div>
        )}
        {conWebgl && !en3d && (
          <div className="pointer-events-auto absolute inset-0">
            <Mapa2D />
          </div>
        )}
        <div className="entrada-suave">
          <div className="pointer-events-none absolute top-3.5 right-4 left-4 z-[3] flex flex-col gap-2.5 min-[901px]:right-32">
            <div className="vidrio pointer-events-auto flex flex-wrap items-baseline gap-x-2.5 self-start rounded-m px-3 py-1.5">
              <h2 className="m-0 font-display text-sm font-[650] tracking-display min-[901px]:text-xl">
                {t.mapH[variable]} ·{' '}
                {anio == null
                  ? t.mapModoTendencia(rango.year_start, rango.year_end)
                  : t.mapModoAnio(anio)}
              </h2>
              <span className="hidden text-[13px] text-muted min-[901px]:inline">
                {anio == null ? t.mapSub : t.mapSubAnio}
              </span>
            </div>
            <AyudaModo />
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
          {/* Escritorio: los controles a la vista. Celular: detrás de un solo botón «⋯», para dejar el mapa libre */}
          <div className="pointer-events-auto absolute right-4 bottom-3.5 z-[3] hidden gap-1.5 min-[901px]:flex">
            {controles}
          </div>
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                size="icon"
                className={`${boton} pointer-events-auto absolute right-4 z-[3] min-[901px]:hidden ${
                  anio == null ? 'bottom-[66px]' : 'bottom-[86px]'
                }`}
                aria-label={t.mapaControles}
                title={t.mapaControles}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="5" cy="12" r="1.8" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                  <circle cx="19" cy="12" r="1.8" fill="currentColor" />
                </svg>
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={8}
                collisionPadding={16}
                aria-label={t.mapaControles}
                className="z-[60] flex gap-1.5 rounded-m border border-line bg-panel p-1.5 shadow-[0_8px_24px_var(--shadow)]"
              >
                {controles}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      {/* Informe: en escritorio se desliza sobre el mapa; minimizado deja una franja de 56 px */}
      <aside
        ref={informe}
        className={`pointer-events-auto relative flex min-w-0 overflow-hidden border-line bg-panel min-[901px]:absolute min-[901px]:inset-y-0 min-[901px]:right-0 min-[901px]:w-[var(--ancho-informe)] min-[901px]:border-l min-[901px]:shadow-[-12px_0_32px_var(--shadow)] min-[901px]:transition-transform min-[901px]:duration-500 min-[901px]:ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          informeMin ? 'min-[901px]:translate-x-[calc(100%-56px)]' : ''
        }`}
        style={{ transitionDelay: demoraPanel }}
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
              : 'toque44 presionable absolute top-3 right-3 z-[2] grid size-9 cursor-pointer place-items-center rounded-s border border-line-2 bg-panel text-fg hover:border-fg'
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
            {/* La información entra suave cuando termina la presentación del departamento */}
            <div
              className="entrada"
              style={{ '--retraso': intro ? `${RETRASO_INFO_S}s` : '0s' } as CSSProperties}
            >
              <Ficha />
            </div>
          </div>
        )}
      </aside>
    </section>
  )
}
