import { lazy, Suspense } from 'react'
import { CircleCheck, CircleQuestionMark, CircleX } from 'lucide-react'
import type { Zona } from '@/data/datos'
import type { TendenciaImerg } from '@/api/consultas'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { veredictoDosFuentes, type Veredicto } from '@/features/ficha/utils/dosFuentes'
import { GraficoSkeleton } from '@/components/Esperas'

// Recharts se descarga aparte, como los otros gráficos de la ficha
const GraficoDosFuentes = lazy(() =>
  import('@/features/ficha/components/GraficoDosFuentes').then((m) => ({
    default: m.GraficoDosFuentes,
  })),
)

interface Props {
  /** La zona con la lluvia principal (NASA POWER). */
  power: Zona
  /** La misma zona en la segunda fuente (GPM IMERG). */
  imerg: TendenciaImerg
  idioma: Idioma
}

/** Ícono y color del veredicto: sí (verde), no (acento), ni sí ni no (apagado). */
const SELLO: Record<Veredicto, { icono: typeof CircleCheck; color: string }> = {
  coinciden: { icono: CircleCheck, color: 'var(--green)' },
  coincidenDebil: { icono: CircleCheck, color: 'var(--green)' },
  noCoinciden: { icono: CircleX, color: 'var(--accent-text)' },
  dudoso: { icono: CircleQuestionMark, color: 'var(--muted)' },
  pocos: { icono: CircleQuestionMark, color: 'var(--muted)' },
}

/**
 * «¿Coinciden dos fuentes de NASA?» (idea del prototipo v4): la lluvia del modelo (POWER, la que
 * muestra el mapa) frente a la de los satélites (IMERG). Solo en la ficha del estudiante: primero
 * la respuesta, con un sello; luego las dos pendientes con su rango probable. Si no coinciden,
 * explica por qué el mapa usa POWER.
 */
export function DosFuentes({ power, imerg, idioma }: Props) {
  const t = TEXTOS[idioma]
  // Se compara por rangos probables, no solo por el signo (ver veredictoDosFuentes)
  const veredicto = veredictoDosFuentes(power, imerg)
  const sube = power.slope_per_decade >= 0
  const frase = {
    pocos: t.dosPocos,
    coinciden: t.dosSi(sube),
    coincidenDebil: t.dosSiDebil(sube),
    noCoinciden: t.dosNo(sube),
    dudoso: t.dosDudoso,
  }[veredicto]
  const fuentes = [
    { ...t.dosFuente.power, d: power },
    { ...t.dosFuente.imerg, d: imerg },
  ]
  const { icono: Sello, color } = SELLO[veredicto]

  return (
    <section aria-labelledby="dos-fuentes-h" className="flex flex-col gap-3 bloque-ficha">
      <h3 id="dos-fuentes-h" className="m-0 text-sm font-semibold">
        {t.dosH}
      </h3>

      {/* La respuesta primero */}
      <div className="flex items-start gap-2.5">
        <Sello className="size-7 flex-none" style={{ color }} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] leading-tight font-semibold">
            {t.dosVeredicto[veredicto]}
          </span>
          <span className="text-sm">{frase}</span>
        </div>
      </div>

      {veredicto === 'pocos' ? null : (
        <Suspense fallback={<GraficoSkeleton />}>
          <GraficoDosFuentes
            idioma={idioma}
            filas={fuentes.map(({ nombre, tipo, d }) => ({
              nombre,
              tipo,
              slope_per_decade: d.slope_per_decade,
              ci_low: d.ci_low,
              ci_high: d.ci_high,
            }))}
          />
        </Suspense>
      )}

      {veredicto === 'noCoinciden' && <p className="m-0 text-xs text-muted">{t.dosPorQue}</p>}
    </section>
  )
}
