import { useEffect, useRef } from 'react'
import { anomaliasPeru } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { colorAnomalia } from '@/lib/color'
import { useBusqueda } from '@/lib/busqueda'
import { fmtAnomalia } from '@/lib/formato'
import { useRango } from '@/lib/useZonas'
import { useApp } from '@/store'
import { Button } from '@/components/ui/button'

/** Milisegundos por año al reproducir. Las columnas se interpolan entre años: el avance se ve suave. */
const PASO_MS = 850

/**
 * Máquina del tiempo (v4–v9 del prototipo): barra vertical pegada al borde derecho del mapa,
 * con el último año arriba, las franjas del Perú como riel, un deslizador y Play.
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
    // Si está en la tendencia o en el último año, empieza desde el principio
    if (anio == null || anio >= b) setAnio(a)
    setReproduciendo(true)
  }

  return (
    <div
      role="group"
      aria-label={t.timeAria}
      className="absolute top-3.5 right-4 bottom-[70px] z-[3] flex w-[68px] flex-col items-center gap-2 rounded-m border border-line bg-panel/94 px-1 py-2 min-[901px]:w-24 min-[901px]:px-2 min-[901px]:py-2.5"
    >
      <Button
        size="sm"
        aria-pressed={anio == null}
        onClick={() => setAnio(null)}
        title={t.timeBackTrend}
        className="min-h-[34px] w-full px-1 text-xs aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:font-semibold aria-pressed:text-bg"
      >
        {t.timeTrend}
      </Button>

      <span
        className={`text-center font-display leading-[1.1] font-bold tracking-display ${
          anio == null ? 'text-xs min-[901px]:text-[15px]' : 'text-lg min-[901px]:text-[22px]'
        }`}
        aria-live="polite"
      >
        {anio ?? `${a}–${b}`}
      </span>

      <span className="text-xs text-muted">{b}</span>
      <div className="flex min-h-20 flex-1 justify-center gap-1.5">
        {/* Riel: una franja por año (el más reciente arriba); cada una lleva a su año */}
        <div className="flex w-3 flex-none flex-col-reverse gap-px overflow-hidden rounded-[4px] min-[901px]:w-4">
          {filas.map((fila) => {
            const etiqueta = t.tipTime('Perú', fmtAnomalia(fila.a, variable, idioma), fila.y)
            return (
              <button
                key={fila.y}
                type="button"
                className="min-h-0 flex-1 cursor-pointer border-0 p-0"
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
        <input
          type="range"
          min={a}
          max={b}
          step={1}
          value={anio ?? b}
          aria-label={t.timeYear}
          aria-valuetext={anio == null ? t.timeTrend : String(anio)}
          onChange={(e) => {
            setReproduciendo(false)
            setAnio(Number(e.target.value))
          }}
          className="m-0 h-auto w-5 cursor-pointer accent-accent [direction:rtl] [writing-mode:vertical-lr]"
        />
      </div>
      <span className="text-xs text-muted">{a}</span>

      <Button
        size="icon"
        className="size-[34px]"
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
    </div>
  )
}
