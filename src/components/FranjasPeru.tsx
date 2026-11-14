import { anomaliasPeru, PERIODOS, type Periodo } from '../data/datos'
import { TEXTOS } from '../i18n/textos'
import { colorAnomalia, pct } from '../lib/color'
import { useApp } from '../store'

/** Franjas del Perú: una por año, con la lluvia nacional frente al promedio del periodo. */
export function FranjasPeru({ periodo = 'largo' }: { periodo?: Periodo }) {
  const idioma = useApp((s) => s.idioma)
  // Se suscribe al tema para volver a pintar: los colores se leen de las variables CSS
  useApp((s) => s.tema)
  const t = TEXTOS[idioma]
  const { filas, max } = anomaliasPeru('lluvia', periodo)
  const franjas = filas.map((fila) => ({ ...fila, color: colorAnomalia(fila.a, max) }))
  const { year_start: a, year_end: b } = PERIODOS[periodo]

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <div className="flex h-[34px] flex-none gap-px overflow-hidden rounded-s">
        {franjas.map((fila) => (
          <span
            key={fila.y}
            className="min-w-0 flex-1"
            style={{ background: fila.color }}
            title={t.stripeTitle(fila.y, pct(fila.a))}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{a}</span>
        <span>{b}</span>
      </div>
      <figcaption className="text-[13px] text-muted">{t.stripesCap(a, b)}</figcaption>
    </figure>
  )
}
