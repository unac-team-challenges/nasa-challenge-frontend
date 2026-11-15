import { useEffect, useRef } from 'react'
import { anomaliasPeru } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { colorAnomalia } from '@/utils/color'
import { useBusqueda } from '@/lib/busqueda'
import { fmtAnomalia } from '@/utils/formato'
import { useRango } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

/** Milisegundos por año al reproducir. Las columnas se interpolan entre años: el avance se ve suave. */
const PASO_MS = 850

/**
 * Máquina del tiempo (v4–v9 del prototipo). En escritorio: barra vertical pegada al borde derecho
 * del mapa, con el último año arriba. En celular (< 900 px): la misma barra acostada, pegada al
 * borde de abajo, con el año más antiguo a la izquierda (el dedo se mueve de lado, no choca con
 * el desplazamiento de la página). Las franjas del Perú son el riel; encima va el deslizador.
 */
export function BarraTiempo() {
  const { idioma, periodo, reproduciendo, setReproduciendo } = useApp()
  const { variable, anio, setAnio } = useBusqueda()
  // El Play lee el año y la función más recientes sin reiniciar su reloj
  const vivo = useRef({ anio, setAnio })
  useEffect(() => {
    vivo.current = { anio, setAnio }
  })
  useApp((s) => s.tema) // los colores de las franjas se leen del tema
  const t = TEXTOS[idioma]
  const rango = useRango()
  const { year_start: a, year_end: b } = rango
  const { filas, max } = anomaliasPeru(variable, periodo, rango)

  // Al cambiar de variable o de El Niño cambia el rango: el año elegido se ajusta para no quedar fuera
  useEffect(() => {
    if (anio != null && (anio < a || anio > b)) setAnio(Math.min(Math.max(anio, a), b))
  }, [anio, a, b, setAnio])

  // Play: avanza un año cada PASO_MS y se detiene al llegar al final
  useEffect(() => {
    if (!reproduciendo) return
    const id = setInterval(() => {
      const { anio: actual, setAnio } = vivo.current
      if (actual == null || actual >= b) {
        if (actual != null) useApp.getState().setReproduciendo(false)
        else setAnio(a)
        return
      }
      setAnio(actual + 1)
    }, PASO_MS)
    return () => clearInterval(id)
  }, [reproduciendo, a, b])

  const alternarPlay = () => {
    if (reproduciendo) {
      setReproduciendo(false)
      return
    }
    // Si está en el último año, empieza desde el principio
    if (anio == null || anio >= b) setAnio(a)
    setReproduciendo(true)
  }

  const porAnio = anio != null

  return (
    <div
      role="group"
      aria-label={t.timeAria}
      data-cubre-mapa
      className={`absolute inset-x-4 bottom-3.5 z-[3] flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-m border border-line bg-panel/94 px-2 py-1 min-[901px]:inset-x-auto min-[901px]:top-3.5 min-[901px]:right-4 min-[901px]:w-24 min-[901px]:flex-col min-[901px]:flex-nowrap min-[901px]:gap-2 min-[901px]:px-2 min-[901px]:py-2.5 ${
        porAnio ? 'min-[901px]:bottom-[70px]' : 'min-[901px]:bottom-auto'
      }`}
    >
      {/* Dos modos: la tendencia de todo el periodo o un año suelto. Celular: lado a lado; escritorio: apilados. */}
      <div
        role="group"
        aria-label={t.timeModeAria}
        className="order-1 flex flex-none overflow-hidden rounded-s border border-line-2 min-[901px]:w-full min-[901px]:flex-col"
      >
        <Button
          variant="toggle"
          size="sm"
          aria-pressed={!porAnio}
          onClick={() => setAnio(null)}
          title={t.timeTrendTitle(a, b)}
          className="min-h-8 px-2 text-xs min-[901px]:min-h-[34px] min-[901px]:px-1"
        >
          {t.timeTrend}
        </Button>
        <Button
          variant="toggle"
          size="sm"
          aria-pressed={porAnio}
          onClick={() => setAnio(b)}
          title={t.timeByYearTitle}
          className="min-h-8 border-l border-line-2 px-2 text-xs min-[901px]:min-h-[34px] min-[901px]:border-t min-[901px]:border-l-0 min-[901px]:px-1"
        >
          {t.timeByYear}
        </Button>
      </div>

      <span
        className={`order-2 flex-1 font-display leading-[1.1] font-bold tracking-display min-[901px]:flex-none min-[901px]:text-center ${
          porAnio ? 'text-lg min-[901px]:text-[22px]' : 'text-sm min-[901px]:text-[15px]'
        }`}
        aria-live="polite"
      >
        {anio ?? `${a}–${b}`}
      </span>

      {porAnio && (
        <>
          {/* Celular: una fila de abajo (año más antiguo a la izquierda). Escritorio: columna (el último año arriba). */}
          <div className="order-4 flex basis-full items-center gap-2 min-[901px]:order-3 min-[901px]:min-h-20 min-[901px]:flex-1 min-[901px]:basis-auto min-[901px]:flex-col">
            <span className="order-1 text-xs text-muted min-[901px]:order-3">{a}</span>
            <div className="relative order-2 flex min-h-5 flex-1 items-center min-[901px]:w-full min-[901px]:justify-center min-[901px]:gap-1.5">
              {/* Riel: una franja por año; cada una lleva a su año */}
              <div className="flex h-3 flex-1 flex-row gap-px overflow-hidden rounded-[4px] min-[901px]:h-auto min-[901px]:w-4 min-[901px]:flex-none min-[901px]:flex-col-reverse min-[901px]:self-stretch">
                {filas.map((fila) => {
                  const etiqueta = t.tipTime('Perú', fmtAnomalia(fila.a, variable, idioma), fila.y)
                  return (
                    <button
                      key={fila.y}
                      type="button"
                      className="min-h-0 min-w-0 flex-1 cursor-pointer border-0 p-0"
                      style={{
                        background: colorAnomalia(fila.a, max, variable),
                        boxShadow: anio === fila.y ? 'inset 0 0 0 2px var(--fg)' : undefined,
                      }}
                      title={etiqueta}
                      aria-label={etiqueta}
                      aria-current={anio === fila.y}
                      tabIndex={-1}
                      onClick={() => {
                        setReproduciendo(false)
                        setAnio(fila.y)
                      }}
                    />
                  )
                })}
              </div>
              {/* Celular: horizontal, encima del riel. Escritorio: vertical, al lado. */}
              <input
                type="range"
                min={a}
                max={b}
                step={1}
                value={anio}
                aria-label={t.timeYear}
                aria-valuetext={String(anio)}
                onChange={(e) => {
                  setReproduciendo(false)
                  setAnio(Number(e.target.value))
                }}
                className="deslizador-riel absolute inset-0 m-0 size-full cursor-pointer min-[901px]:static min-[901px]:h-auto min-[901px]:w-5 min-[901px]:accent-accent min-[901px]:[direction:rtl] min-[901px]:[writing-mode:vertical-lr]"
              />
            </div>
            <span className="order-3 text-xs text-muted min-[901px]:order-1">{b}</span>
          </div>

          <Button
            size="icon"
            className="order-3 size-8 min-[901px]:order-4 min-[901px]:size-[34px]"
            onClick={alternarPlay}
            aria-label={reproduciendo ? t.timePause : t.timePlay(a, b)}
            title={reproduciendo ? t.timePause : t.timePlay(a, b)}
          >
            {reproduciendo ? (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5l12 7-12 7z" fill="currentColor" />
              </svg>
            )}
          </Button>
        </>
      )}
    </div>
  )
}
