import { anomaliasPeru } from '../data/ejemplo'
import { TEXTOS } from '../i18n/textos'
import { colorAnomalia, pct } from '../lib/color'
import { useApp } from '../store'

/** Franjas del Perú: una por año, con la anomalía nacional frente al promedio 2000–2025. */
export function FranjasPeru() {
  const { idioma, variable } = useApp()
  // Se suscribe al tema para volver a pintar: los colores se leen de las variables CSS
  useApp((s) => s.tema)
  const t = TEXTOS[idioma]
  const { filas, max } = anomaliasPeru(variable)
  const franjas = filas.map((f) => ({ ...f, color: colorAnomalia(f.a, max, variable === 'ndvi') }))

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <div className="flex h-[34px] flex-none gap-px overflow-hidden rounded-s">
        {franjas.map((f) => (
          <span
            key={f.y}
            className="min-w-0 flex-1"
            style={{ background: f.color }}
            title={t.stripeTitle(f.y, pct(f.a))}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{franjas[0].y}</span>
        <span>{franjas[franjas.length - 1].y}</span>
      </div>
      <figcaption className="text-[13px] text-muted">{t.stripesCap}</figcaption>
    </figure>
  )
}
