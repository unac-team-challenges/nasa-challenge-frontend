import { useState } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { anomaliasAnio, FUENTE_LOCAL } from '@/data/datos'
import { claveMapa } from '@/utils/direccion'
import { useBusqueda } from '@/lib/busqueda'
import { fmtAnomalia, fmtValor } from '@/utils/formato'
import { useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'

const CLAVE = 'leyenda-abierta'

/** La última elección del usuario ('1' abierta, '0' cerrada), o null si nunca eligió. */
function eleccionGuardada(): boolean | null {
  try {
    const v = localStorage.getItem(CLAVE)
    return v === null ? null : v === '1'
  } catch {
    return null
  }
}

function guardarEleccion(abierta: boolean) {
  try {
    localStorage.setItem(CLAVE, abierta ? '1' : '0')
  } catch {
    /* sin almacenamiento (modo privado): vuelve al valor por defecto */
  }
}

/** Leyenda ilustrada y plegable (v6): tres mini columnas, texturas, escala y qué es la variable. */
export function Leyenda() {
  const { idioma, periodo } = useApp()
  const { variable, anio } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { rango, fuente } = useVista()
  // Lo que el usuario dejó la última vez; si nunca eligió, abierta en escritorio y cerrada en
  // celular para no tapar el mapa
  const [abierta, setAbierta] = useState(
    () => eleccionGuardada() ?? !matchMedia('(max-width: 900px)').matches,
  )
  const elegir = (abre: boolean) => {
    setAbierta(abre)
    guardarEleccion(abre)
  }
  // En temperatura, subir es más calor (ocre) y hundirse es más frío (azul)
  const sube = `var(--map-${claveMapa(1, variable)})`
  const baja = `var(--map-${claveMapa(-1, variable)})`
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
      <details
        className="group"
        open={abierta}
        // Al montar, el navegador avisa con el mismo valor: solo cuenta si cambió
        onToggle={(e) => e.currentTarget.open !== abierta && elegir(e.currentTarget.open)}
      >
        <summary className="flex min-h-8 cursor-pointer items-center gap-1.5 text-sm font-semibold group-open:pr-9">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 16.6v.1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t.legSum}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="flex-none transition-transform group-open:rotate-180"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
      {abierta && (
        <button
          type="button"
          aria-label={t.legMin}
          title={t.legMin}
          onClick={() => elegir(false)}
          className="absolute top-1.5 right-1.5 grid size-8 cursor-pointer place-items-center rounded-s border-0 bg-transparent text-fg hover:bg-line"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
