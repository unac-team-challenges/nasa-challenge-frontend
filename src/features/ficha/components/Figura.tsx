import { Suspense, type ReactNode } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda, useSinNino } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { ErrorSerie } from '@/components/Errores'
import { GraficoSkeleton } from '@/components/Esperas'

interface Props {
  titulo: string
  /** Estado de la serie anual (useDetalle) */
  estado: 'cargando' | 'error' | 'ok'
  reintentar: () => void
  pie: string
  /** Lluvia: se ofrece quitar los años de El Niño */
  conNino: boolean
  /** Lo que va debajo del gráfico (frase de los peores años, botón del CSV) */
  extra?: ReactNode
  /** El gráfico (cargado aparte, con lazy) */
  children: ReactNode
}

/**
 * Gráfico de la ficha con su título, su pie y sus estados: esqueleto mientras baja Recharts o la
 * serie, aviso con «Reintentar» si la serie no llegó.
 */
export function Figura({ titulo, estado, reintentar, pie, conNino, extra, children }: Props) {
  const idioma = useApp((s) => s.idioma)
  const sinNino = useSinNino()
  const { setSinNino } = useBusqueda()
  const t = TEXTOS[idioma]
  return (
    <section className="flex flex-col gap-2.5" aria-label={titulo}>
      <h3 className="m-0 text-sm font-semibold">{titulo}</h3>
      <figure className="m-0 flex flex-col gap-1.5">
        {estado === 'error' ? (
          <ErrorSerie reintentar={reintentar} />
        ) : estado === 'cargando' ? (
          <GraficoSkeleton />
        ) : (
          <Suspense fallback={<GraficoSkeleton />}>{children}</Suspense>
        )}
        {pie && <figcaption className="text-xs text-muted">{pie}</figcaption>}
      </figure>
      {conNino && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            className="size-[18px] accent-accent"
            checked={sinNino}
            onChange={(e) => setSinNino(e.target.checked)}
          />
          {t.ninoToggle}
        </label>
      )}
      {extra}
    </section>
  )
}
