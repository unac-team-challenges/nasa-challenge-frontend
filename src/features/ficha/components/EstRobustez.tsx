import { useMemo } from 'react'
import { CircleCheck, CircleQuestionMark, CircleX } from 'lucide-react'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { fmtP, fmtValor } from '@/utils/formato'
import { useShallow } from 'zustand/react/shallow'
import { useApp } from '@/stores/app'
import { robustez } from '@/features/ficha/utils/estudiante'

const SELLO = {
  robusto: { icono: CircleCheck, color: 'var(--green)' },
  depende: { icono: CircleQuestionMark, color: 'var(--accent-text)' },
  nunca: { icono: CircleX, color: 'var(--muted)' },
  pocos: { icono: CircleQuestionMark, color: 'var(--muted)' },
} as const

/**
 * Estudiante: «¿se sostiene el resultado?». La misma zona en 2 periodos × con y sin El Niño,
 * con pendiente, q y estado, y un veredicto. Es la pregunta que hace un jurado de tesis.
 */
export function EstRobustez() {
  const { idioma, periodo, sinNino } = useApp(
    useShallow((s) => ({ idioma: s.idioma, periodo: s.periodo, sinNino: s.sinNino })),
  )
  const { variable, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const r = useMemo(() => (sel ? robustez(sel, variable) : null), [sel, variable])
  if (!sel || !r) return null
  const { icono: Sello, color } = SELLO[r.veredicto]
  const [cCaso, cPend, cQ, cEstado] = t.robCols

  return (
    <section
      aria-labelledby="rob-h"
      className="flex flex-col gap-3 rounded-m border border-line p-3.5"
    >
      <h3 id="rob-h" className="m-0 text-sm font-semibold">
        {t.robH}
      </h3>
      <div className="flex items-start gap-2.5">
        <Sello className="size-6 flex-none" style={{ color }} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{t.robVer[r.veredicto]}</span>
          {r.cambiaSigno && <span className="text-sm">{t.robSigno}</span>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-1 pr-2 font-normal">{cCaso}</th>
              <th className="py-1 pr-2 text-right font-normal">{cPend}</th>
              <th className="py-1 pr-2 text-right font-normal">{cQ}</th>
              <th className="py-1 font-normal">{cEstado}</th>
            </tr>
          </thead>
          <tbody>
            {r.casos.map((c) => {
              const z = c.zona
              const actual = c.periodo === periodo && c.sinNino === sinNino
              const pocos = !z || z.status === 'pocos_datos'
              return (
                <tr
                  key={`${c.periodo}-${c.sinNino}`}
                  className={`border-t border-line ${actual ? 'bg-panel-2 font-semibold' : ''}`}
                >
                  <th scope="row" className="py-1.5 pr-2 text-left font-[inherit]">
                    {t.robCaso(c.rango.year_start, c.rango.year_end, c.sinNino)}
                    {actual && <span className="sr-only"> ({t.robActual})</span>}
                  </th>
                  <td
                    className="py-1.5 pr-2 text-right whitespace-nowrap"
                    style={
                      pocos
                        ? undefined
                        : { color: `var(${colorDireccion(z.slope_per_decade, variable)})` }
                    }
                  >
                    {pocos ? '—' : fmtValor(z.slope_per_decade, variable, idioma)}
                  </td>
                  <td className="py-1.5 pr-2 text-right whitespace-nowrap">
                    {pocos ? '—' : fmtP(z.q_value, idioma)}
                  </td>
                  <td className="py-1.5">{t.status[z?.status ?? 'pocos_datos']}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="m-0 text-xs text-muted">{t.robFuente}</p>
    </section>
  )
}
