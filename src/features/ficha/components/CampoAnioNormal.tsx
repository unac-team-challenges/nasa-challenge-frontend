import { Droplets } from 'lucide-react'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { num } from '@/utils/formato'
import { useDetalle } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { anioNormal, m3PorHectarea } from '@/features/ficha/utils/serie'
import { miles } from '@/features/ficha/utils/campo'

/**
 * Agricultor: «un año normal aquí», para comparar con lo que recuerda. Lluvia también en m³ de
 * agua por hectárea, la unidad con la que se riega. Avisa que es el promedio de una zona amplia.
 */
export function CampoAnioNormal() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const { serie: pts } = useDetalle(sel)
  if (!pts || pts.length < 4) return null
  const n = anioNormal(pts)
  const lluvia = variable === 'lluvia'
  const mm = (v: number) => `${miles(Math.round(v), idioma)} mm`
  const c = (v: number) => `${num(v, 1, idioma)} °C`

  return (
    <section
      aria-labelledby="normal-h"
      className="flex flex-col gap-2 rounded-m border border-line p-3.5"
    >
      <h3 id="normal-h" className="m-0 text-sm font-semibold">
        {t.normalH}
      </h3>
      <p className="m-0">
        {lluvia
          ? t.normalLluvia(mm(n.promedio), mm(n.bajo), mm(n.alto))
          : t.normalTemp(c(n.promedio), c(n.bajo), c(n.alto))}
      </p>
      {lluvia && (
        <p className="m-0 flex items-center gap-2 font-semibold">
          <Droplets className="size-5 flex-none text-up" aria-hidden="true" />
          {/* Redondeado a decenas: no tiene sentido más precisión con celdas de ~50 km */}
          {t.normalAgua(miles(Math.round(m3PorHectarea(n.promedio) / 10) * 10, idioma))}
        </p>
      )}
      <p className="m-0 text-xs text-muted">{t.normalNota}</p>
    </section>
  )
}
