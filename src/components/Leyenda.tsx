import { useState } from 'react'
import { TEXTOS } from '../i18n/textos'
import { anomaliasAnio, FUENTE_LOCAL } from '../data/datos'
import { claveMapa } from '../lib/direccion'
import { fmtAnomalia, fmtValor } from '../lib/formato'
import { useVista, useZonas } from '../lib/useZonas'
import { useApp } from '../store'

/** Leyenda ilustrada y plegable (v6): tres mini columnas, texturas, escala y qué es la variable. */
export function Leyenda() {
  const { idioma, variable } = useApp()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { rango, fuente } = useVista()
  // Abierta en escritorio; en celular empieza cerrada para no tapar el mapa
  const [abierta, setAbierta] = useState(() => !matchMedia('(max-width: 900px)').matches)
  // En temperatura, subir es más calor (ocre) y hundirse es más frío (azul)
  const sube = `var(--map-${claveMapa(1, variable)})`
  const baja = `var(--map-${claveMapa(-1, variable)})`
  const { anio, periodo } = useApp()
  const cols = anio == null ? t.legCols[variable] : t.legColsT
  const maxima = Math.max(
    ...Object.values(zonas)
      .filter((d) => d.status !== 'pocos_datos')
      .map((d) => Math.abs(d.slope_per_decade)),
  )

  const columna = (x: number, arriba: number, abajo: number, relleno: string) => {
    const w = 38
    const d = 10
    const h = abajo - arriba
    return (
      <g style={{ fill: relleno }}>
        <polygon
          points={`${x},${arriba} ${x + d},${arriba - 6} ${x + w + d},${arriba - 6} ${x + w},${arriba}`}
          fillOpacity={0.75}
        />
        <rect x={x} y={arriba} width={w} height={Math.max(h, 2)} />
        <polygon
          points={`${x + w},${arriba} ${x + w + d},${arriba - 6} ${x + w + d},${abajo - 6} ${x + w},${abajo}`}
          fillOpacity={0.55}
        />
      </g>
    )
  }
  const rotulo = (cx: number, [a, b]: [string, string]) => (
    <>
      <text
        x={cx}
        y={100}
        textAnchor="middle"
        fontSize={11}
        fontWeight={650}
        style={{ fill: 'var(--fg)' }}
      >
        {a}
      </text>
      <text x={cx} y={113} textAnchor="middle" fontSize={10} style={{ fill: 'var(--muted)' }}>
        {b}
      </text>
    </>
  )
  const muestra = 'h-3.5 w-[18px] flex-none rounded-[3px] box-border'

  return (
    <div className="absolute bottom-16 left-4 z-[3] grid max-w-[min(340px,calc(100%-110px))] gap-1.5 rounded-m border border-line bg-panel/92 px-3 py-2.5 text-[13px] min-[901px]:bottom-3.5 min-[901px]:max-w-[min(340px,calc(100%-140px))]">
      <details open={abierta} onToggle={(e) => setAbierta(e.currentTarget.open)}>
        <summary className="flex min-h-7 cursor-pointer items-center gap-1.5 text-sm font-semibold">
          {t.legSum}
        </summary>
        <svg
          viewBox="0 0 330 118"
          className="mt-1.5 block h-auto w-full max-w-[250px]"
          role="img"
          aria-label={cols.map((c) => c.join(': ')).join('. ')}
        >
          <line
            x1={4}
            y1={56}
            x2={326}
            y2={56}
            style={{ stroke: 'var(--muted)' }}
            strokeDasharray="4 4"
          />
          {columna(36, 16, 56, sube)}
          {columna(146, 52, 56, 'var(--muted)')}
          {columna(256, 70, 84, baja)}
          <text x={322} y={51} textAnchor="end" fontSize={9.5} style={{ fill: 'var(--muted)' }}>
            {t.noChange}
          </text>
          {rotulo(60, cols[0])}
          {rotulo(170, cols[1])}
          {rotulo(280, cols[2])}
        </svg>
        <div className="mt-1 grid grid-cols-3 gap-x-2.5 gap-y-1.5 text-xs">
          {/* En modo año el color es la anomalía: pleno y rayado no aplican (como el prototipo) */}
          {anio == null && (
            <>
              <span className="flex items-center gap-1.5">
                <span className={muestra} style={{ background: sube }} />
                {t.texReal}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className={muestra}
                  style={{
                    background: `repeating-linear-gradient(135deg, ${sube} 0 3px, transparent 3px 6px)`,
                    border: `1px solid ${sube}`,
                    opacity: 0.85,
                  }}
                />
                {t.texCas}
              </span>
            </>
          )}
          <span className="flex items-center gap-1.5">
            <span className={`${muestra} border-2 border-dashed border-muted`} />
            {t.texFew}
          </span>
        </div>
        <p className="m-0 mt-1 text-xs text-fg">
          {anio == null
            ? t.scaleTrend(fmtValor(maxima, variable, idioma).replace('+', ''))
            : t.scaleTime(
                fmtAnomalia(anomaliasAnio(variable, periodo, rango).max, variable, idioma).replace(
                  '+',
                  '',
                ),
              )}
        </p>
        <p className="m-0 text-xs text-muted">
          {/* La máquina del tiempo usa la copia local */}
          {t.varDef[variable](anio == null ? fuente : FUENTE_LOCAL)}
        </p>
      </details>
    </div>
  )
}
