import { ExternalLink } from 'lucide-react'
import { NOMBRE, ninoEn } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { fmtPct, num } from '@/utils/formato'
import { useDetalle, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { efectoNino } from '@/features/ficha/utils/serie'
import { listaAnios } from '@/features/ficha/utils/campo'

/** Comunicados oficiales de la Comisión ENFEN (estado del sistema de alerta de El Niño). */
const ENFEN = 'https://enfen.imarpe.gob.pe/comunicados/'

/**
 * Agricultor: «¿qué trae El Niño aquí?». Cuánto se apartaron de lo esperado (la tendencia), en
 * promedio, los años de El Niño en esta zona: en el norte suele llover mucho más; en el sur andino, a veces menos.
 */
export function CampoNino() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const { rango } = useVista()
  const { serie: pts } = useDetalle(sel)
  const zonas = useZonas()
  if (!pts || !sel || variable === 'vegetacion') return null // el NDVI no se explica con El Niño
  const e = efectoNino(pts, variable, ninoEn(rango), zonas[sel])
  const lluvia = variable === 'lluvia'

  return (
    <section
      aria-labelledby="nino-aqui-h"
      className="flex flex-col gap-2.5 rounded-m border border-line p-3.5"
    >
      <h3 id="nino-aqui-h" className="m-0 text-sm font-semibold">
        {t.ninoAquiH}
      </h3>
      {e ? (
        <>
          <span
            className="font-display text-[34px] leading-none font-[750] tracking-[-0.02em] tabular-nums"
            style={{ color: `var(${colorDireccion(e.promedio, variable)})` }}
          >
            {lluvia
              ? fmtPct(e.promedio)
              : `${e.promedio >= 0 ? '+' : '−'}${num(e.promedio, 1, idioma)} °C`}
          </span>
          <p className="m-0">
            {t.ninoAqui[variable](
              NOMBRE[sel],
              listaAnios(e.anios, idioma),
              lluvia ? `${Math.round(Math.abs(e.promedio))} %` : `${num(e.promedio, 1, idioma)} °C`,
              e.promedio >= 0,
            )}
          </p>
        </>
      ) : (
        <p className="m-0">{t.ninoSinAnios}</p>
      )}
      <a
        href={ENFEN}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 text-sm text-accent-text"
      >
        {t.ninoEnfen}
        <ExternalLink className="size-3.5" aria-hidden="true" />
        <span className="sr-only">{t.enlaceNueva}</span>
      </a>
    </section>
  )
}
