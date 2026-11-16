import { Aviso } from '@/features/ficha/components/Aviso'
import { SELVA } from '@/features/ficha/data/selva'
import { useCobertura } from '@/hooks/useCobertura'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { num } from '@/utils/formato'

/**
 * Árboles de la selva (MODIS MOD44B), donde el NDVI se satura y no ve la pérdida de bosque: el % del
 * suelo cubierto por árboles en 2001 y 2024 en un recuadro. Aparece en la ficha de Madre de Dios
 * (La Pampa, minería de oro) y de Loreto (Iquitos, el contraste).
 */
export function Selva({ departamento }: { departamento: string }) {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const local = SELVA[departamento]
  const api = useCobertura()?.[departamento]
  if (!local) return null
  // Las cifras vienen de la API si contesta; si no, de la copia de selva.ts (mismos valores)
  const z = { ...local, ...api }
  // En español manda el aviso de la API; en inglés (o sin API), la copia traducida
  const aviso = idioma === 'es' && api ? api.aviso : local.aviso?.[idioma]
  // Un rango probable que cruza el 0 no permite decir si sube o baja (Leandro: «no distinguible
  // de 0», no «estable»: el área de Iquitos está en el tope y no sirve como contraste)
  const distinguible = z.ciLow > 0 || z.ciHigh < 0
  const signo = z.sen > 0 ? '+' : z.sen < 0 ? '−' : ''
  const anios = [
    { anio: 2001, pct: z.pctAntes },
    { anio: 2024, pct: z.pctDespues },
  ]

  return (
    <section aria-labelledby="selva-h" className="flex flex-col gap-2.5 bloque-ficha">
      <h3 id="selva-h" className="m-0 text-sm font-semibold">
        {t.selvaH}
      </h3>
      <p className="m-0">
        {distinguible
          ? t.selvaTexto(
              local.nombre[idioma],
              Math.round(z.pctAntes),
              Math.round(z.pctDespues),
              z.bosqueAntes,
              z.bosqueDespues,
            )
          : t.selvaSinCambio(local.nombre[idioma], Math.round(z.pctDespues))}
      </p>
      {/* % del suelo con árboles, 2001 frente a 2024, en la misma escala de 0 a 100 */}
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {anios.map(({ anio, pct }) => (
          <li key={anio} className="flex items-center gap-2 text-sm">
            <span className="w-10 tabular-nums text-muted">{anio}</span>
            <span className="relative h-2.5 flex-1 rounded-full bg-line" aria-hidden="true">
              <span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${pct}%`, background: 'var(--map-green)' }}
              />
            </span>
            <b className="w-12 text-right font-semibold tabular-nums">{Math.round(pct)} %</b>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-muted">
        {distinguible ? t.status[z.status] : t.selvaNoDistinguible} ·{' '}
        {t.selvaTendencia(signo + num(z.sen, 1, idioma))}
      </p>
      <Aviso texto={aviso} idioma={idioma} />
      <p className="m-0 text-xs text-muted">{t.selvaCap}</p>
      <p className="m-0 text-xs text-muted">{t.selvaUnidad}</p>
    </section>
  )
}
