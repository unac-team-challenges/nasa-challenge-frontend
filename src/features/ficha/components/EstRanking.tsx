import { lazy, Suspense } from 'react'
import { NOMBRE } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { ranking } from '@/features/ficha/utils/estudiante'
import { DescargarFigura } from '@/features/ficha/components/DescargarFigura'
import { GraficoSkeleton } from '@/components/Esperas'

// Recharts se descarga aparte, como los otros gráficos de la ficha
const GraficoRanking = lazy(() =>
  import('@/features/ficha/components/GraficoRanking').then((m) => ({
    default: m.GraficoRanking,
  })),
)

/** Estudiante: dónde está su zona entre los 25 departamentos, con la pendiente y el IC de cada uno. */
export function EstRanking() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel, seleccionar } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  if (!sel) return null
  const r = ranking(zonas, sel)

  return (
    <section aria-labelledby="rank-h" className="flex flex-col gap-2.5">
      <h3 id="rank-h" className="m-0 text-sm font-semibold">
        {t.rankH}
      </h3>
      {r.puesto != null && <p className="m-0">{t.rankPuesto(r.puesto, r.total, NOMBRE[sel])}</p>}
      <figure className="m-0 flex flex-col gap-1.5">
        <Suspense fallback={<GraficoSkeleton />}>
          <GraficoRanking
            orden={r.orden}
            id={sel}
            variable={variable}
            idioma={idioma}
            ir={seleccionar}
          />
        </Suspense>
        <figcaption className="text-xs text-muted">{t.rankCap}</figcaption>
      </figure>
      <DescargarFigura nombre={`ranking-${variable}`} />
    </section>
  )
}
