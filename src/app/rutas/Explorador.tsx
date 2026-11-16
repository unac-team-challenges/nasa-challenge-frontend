import type { CSSProperties } from 'react'
import { CircleHelp } from 'lucide-react'
import { NOMBRE, REGION } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { ALTO_MAPA_CELULAR } from '@/utils/disposicion'
import { fmtValor } from '@/utils/formato'
import { useRango, useZonas } from '@/hooks/useZonas'
import { escenaActiva } from '@/features/mapa/escena/activa'
import { Mapa2D } from '@/features/mapa/components/Mapa2D'
import { useShallow } from 'zustand/react/shallow'
import { useApp } from '@/stores/app'
import { useAnio, useBusqueda, useSinNino } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { AyudaModo } from '@/features/tiempo/components/AyudaModo'
import { BarraTiempo } from '@/features/tiempo/components/BarraTiempo'
import { Ficha } from '@/features/ficha/components/Ficha'
import { Leyenda } from '@/features/mapa/components/Leyenda'
import { Popover } from 'radix-ui'
import { BotonCompartir } from '@/components/BotonCompartir'
import { useMargenMapa } from '@/hooks/useMargenMapa'
import { Button } from '@/components/ui/button'
import { PanelVegetacion } from '@/app/rutas/PanelVegetacion'
import { FRANJA, useInforme } from '@/app/rutas/useInforme'
import { RETRASO_INFO_S, usePresentacionZona } from '@/app/rutas/usePresentacionZona'
import { Guia } from '@/features/guia/components/Guia'
import { useGuia } from '@/features/guia/estado'
import { UI as UI_GUIA } from '@/features/guia/pasos'

const boton = 'bg-panel/92'

/** Ancho del informe abierto en escritorio y de su franja minimizada. */
const ANCHO_INFORME = 'clamp(21.25rem, 38vw, 35rem)'

/**
 * Explorador: el mapa es el fondo de toda la pantalla y el informe se desliza encima, a la
 * derecha. Antes el informe cambiaba las columnas de la grilla: el lienzo 3D cambiaba de
 * tamaño de golpe y la página parpadeaba al elegir una zona. Ahora el lienzo no se toca: la
 * cámara corre el Perú a la izquierda del informe (setPanel) y todo se anima.
 */
export function Explorador() {
  const {
    idioma,
    informeMin,
    setInformeMin,
    zonaDesdeMapa,
    conWebgl,
    modoMapa,
    setModoMapa,
    girando,
  } = useApp(
    useShallow((s) => ({
      idioma: s.idioma,
      informeMin: s.informeMin,
      setInformeMin: s.setInformeMin,
      zonaDesdeMapa: s.zonaDesdeMapa,
      conWebgl: s.conWebgl,
      modoMapa: s.modoMapa,
      setModoMapa: s.setModoMapa,
      girando: s.girando,
    })),
  )
  const cajaMapa = useMargenMapa<HTMLDivElement>()
  const { variable, sel, seleccionar, vegetacion } = useBusqueda()
  const anio = useAnio()
  const sinNino = useSinNino()
  const en3d = modoMapa === '3d'
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const rango = useRango()
  const d = sel ? zonas[sel] : null
  const etiquetaInforme = informeMin ? t.showReport : t.hideReport
  const informe = useInforme(sel, informeMin, modoMapa)
  const { intro, abrirTarde } = usePresentacionZona(sel, informeMin, zonaDesdeMapa)
  const guiaAbierta = useGuia((s) => s.paso != null)
  const abrirGuia = useGuia((s) => s.abrir)

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
      <BotonCompartir className={boton} />
      <Button
        size="icon"
        className={boton}
        aria-label={UI_GUIA[idioma].ver}
        title={UI_GUIA[idioma].ver}
        onClick={abrirGuia}
      >
        <CircleHelp className="size-[18px]" aria-hidden="true" />
      </Button>
    </>
  )

  return (
    <section
      aria-label={t.explorador}
      style={estilo}
      // overflow-x-clip: el informe minimizado se corre a la derecha y no debe ensanchar la página
      className="pointer-events-none relative z-[1] flex flex-1 flex-col escritorio:min-h-[560px] escritorio:overflow-x-clip"
    >
      {/* Zona del mapa: en celular, el alto del mapa; en escritorio, todo menos el informe */}
      <div
        ref={cajaMapa}
        data-guia="mapa"
        className={`relative flex-none ${ALTO_MAPA_CELULAR} escritorio:absolute escritorio:inset-y-0 escritorio:left-0 escritorio:right-[var(--tapa)] escritorio:h-auto escritorio:transition-[right] escritorio:duration-500 escritorio:ease-[cubic-bezier(0.2,0.8,0.2,1)]`}
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
          <div
            data-cubre-mapa
            className="pointer-events-none absolute top-3.5 right-4 left-4 z-[3] flex flex-col gap-2.5 escritorio:right-32"
          >
            <div className="vidrio pointer-events-auto flex flex-wrap items-baseline gap-x-2.5 self-start rounded-m px-3 py-1.5">
              <h2 className="m-0 font-display text-sm font-[650] tracking-display escritorio:text-xl">
                {vegetacion ? (
                  t.mapHVeg
                ) : (
                  <>
                    {t.mapH[variable]} ·{' '}
                    {anio == null
                      ? t.mapModoTendencia(rango.year_start, rango.year_end)
                      : t.mapModoAnio(anio)}
                  </>
                )}
              </h2>
              <span className="hidden text-[13px] text-muted escritorio:inline">
                {vegetacion ? t.mapSubVeg : anio == null ? t.mapSub : t.mapSubAnio}
              </span>
            </div>
            {/* La guía explica lo mismo en su paso de la barra de tiempo: no van juntas */}
            {!vegetacion && !guiaAbierta && <AyudaModo />}
            {!conWebgl && (
              <p className="pointer-events-auto m-0 max-w-136 rounded-m border border-accent bg-accent-soft px-3 py-2 text-[13px] text-fg">
                {t.noGl}
              </p>
            )}
            {sinNino && variable === 'lluvia' && !vegetacion && (
              <p className="pointer-events-auto m-0 max-w-136 rounded-m border border-accent bg-accent-soft px-3 py-2 text-[13px] text-fg">
                {t.ninoOn}
              </p>
            )}
          </div>
          <div className="pointer-events-auto contents">
            <Leyenda />
            {/* La vegetación no tiene máquina del tiempo (solo 5 lugares, 2001 frente a 2024) */}
            {!vegetacion && <BarraTiempo />}
          </div>
          {/* Escritorio: los controles a la vista. Celular: detrás de un solo botón «⋯», para dejar el mapa libre */}
          <div
            data-guia="controles"
            className="pointer-events-auto absolute right-4 bottom-3.5 z-[3] hidden gap-1.5 escritorio:flex"
          >
            {controles}
          </div>
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                size="icon"
                data-guia="controles"
                className={`${boton} pointer-events-auto absolute right-4 bottom-[calc(var(--alto-barra,2.75rem)+1.375rem)] z-[3] escritorio:hidden`}
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
        data-guia="informe"
        className={`pointer-events-auto relative flex min-w-0 overflow-hidden border-line bg-panel escritorio:absolute escritorio:inset-y-0 escritorio:right-0 escritorio:w-[var(--ancho-informe)] escritorio:border-l escritorio:shadow-[-12px_0_32px_var(--shadow)] escritorio:transition-transform escritorio:duration-500 escritorio:ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          informeMin ? 'escritorio:translate-x-[calc(100%-56px)]' : ''
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
              ? 'flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 border-0 bg-panel px-4 text-fg escritorio:h-full escritorio:w-14 escritorio:flex-none escritorio:flex-col escritorio:justify-start escritorio:px-0 escritorio:py-3.5'
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
              <span className="font-display text-[15px] font-[650] tracking-display whitespace-nowrap escritorio:rotate-180 escritorio:[writing-mode:vertical-rl]">
                {sel ? NOMBRE[sel] : t.railHint}
              </span>
              {d && d.status !== 'pocos_datos' && !vegetacion && (
                <span
                  className="text-[13px] escritorio:rotate-180 escritorio:[writing-mode:vertical-rl]"
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
            className="min-w-0 flex-1 px-4 pt-5.5 pb-7 escritorio:overflow-y-auto escritorio:px-5.5"
            aria-live="polite"
          >
            {/* La información entra suave cuando termina la presentación del departamento */}
            <div
              className="entrada"
              style={{ '--retraso': intro ? `${RETRASO_INFO_S}s` : '0s' } as CSSProperties}
            >
              {vegetacion ? <PanelVegetacion /> : <Ficha />}
            </div>
          </div>
        )}
      </aside>
      <Guia />
    </section>
  )
}
