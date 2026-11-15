import { ArrowRight } from 'lucide-react'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { useDetalle } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { aniosMalosPorMitad, compararMalos } from '@/features/ficha/utils/serie'

/**
 * Agricultor: «¿los años malos vienen más seguido?». Arriba, la respuesta en dos cifras (antes →
 * ahora). Abajo, cada año como una casilla con su número, como un calendario: los años secos (o
 * calurosos) van pintados, así se ve cuáles fueron sin leer un gráfico.
 */
export function CampoAniosMalos() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const { serie: pts } = useDetalle(sel)
  const mitades = pts ? aniosMalosPorMitad(pts, variable) : null
  if (!mitades) return null
  const { antes, ahora } = mitades
  // Lluvia: lo malo es el año seco; vegetación, el de poco verdor; temperatura, el caluroso. Los dos salen en el mismo color.
  const color = `var(${colorDireccion(variable === 'temperatura' ? 1 : -1, variable)})`
  const tipo = t.malosPunto[variable]

  return (
    <section
      aria-labelledby="malos-h"
      className="flex flex-col gap-3.5 rounded-m border border-line p-3.5"
    >
      <h3 id="malos-h" className="m-0 text-sm font-semibold">
        {t.malosH[variable]}
      </h3>

      {/* La respuesta: cuántos años malos antes y ahora */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {[antes, ahora].map((m, i) => (
          <div key={m.desde} className={`flex flex-col ${i ? 'col-start-3' : ''}`}>
            <span className="text-xs text-muted">
              {i ? t.malosAhora : t.malosAntes} · {m.desde}–{m.hasta}
            </span>
            <span className="font-display text-[30px] leading-none font-[750] tabular-nums">
              {m.malos}
              <span className="ml-1 font-sans text-sm font-normal text-muted">
                {t.malosDe(m.anios.length)}
              </span>
            </span>
          </div>
        ))}
        <ArrowRight className="col-start-2 row-start-1 size-5 text-muted" aria-hidden="true" />
      </div>
      <p className="m-0 font-semibold">
        {t.malosResumen[variable](compararMalos(antes, ahora), antes.malos, ahora.malos)}
      </p>

      {/* Cada año, una casilla con su número */}
      <div className="flex flex-col gap-2">
        {[antes, ahora].map((m, i) => (
          <div key={m.desde} className="flex flex-col gap-1">
            <span className="text-xs text-muted">{i ? t.malosAhora : t.malosAntes}</span>
            <ol
              className="m-0 grid list-none grid-cols-6 gap-1 p-0 min-[400px]:grid-cols-12"
              aria-label={`${m.desde}–${m.hasta}`}
            >
              {m.anios.map((a) => (
                <li
                  key={a.y}
                  className="flex h-7 items-center justify-center rounded-[4px] border text-[11px] font-semibold tabular-nums"
                  style={
                    a.malo
                      ? { background: color, borderColor: color, color: 'var(--panel)' }
                      : { borderColor: 'var(--line)', color: 'var(--muted)' }
                  }
                >
                  <span aria-hidden="true">{String(a.y).slice(2)}</span>
                  <span className="sr-only">
                    {a.y}
                    {a.malo ? `: ${tipo}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={{ background: color }} />
          {t.malosDef[variable]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] border border-line" />
          {t.malosOtro}
        </span>
      </div>
      <p className="m-0 text-xs text-muted">{t.malosLeer}</p>
    </section>
  )
}
