import { GENERADO, parametroDe, type Variable, type Zona } from '@/data/datos'
import type { DatosApi } from '@/api/consultas'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { fmtP, fmtValor, num } from '@/utils/formato'

interface Props {
  zona: Zona
  variable: Variable
  idioma: Idioma
  api: DatosApi | null
  /** Zonas que entraron en la corrección de Benjamini-Hochberg */
  m: number
  /** El estudiante lo ve abierto; el agricultor, cerrado al final */
  abierto: boolean
}

/** «Cómo lo sabemos»: método, pendiente, p, q, autocorrelación y fuente de la zona. */
export function ComoLoSabemos({ zona: d, variable, idioma, api, m, abierto }: Props) {
  const t = TEXTOS[idioma]
  const fmt = (v: number) => fmtValor(v, variable, idioma)
  return (
    <details className="border-t border-line pt-3" open={abierto}>
      <summary className="flex min-h-8 cursor-pointer items-center font-semibold">{t.howH}</summary>
      <dl className="mt-2.5 mb-0 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3.5 gap-y-1.5 text-sm">
        <dt className="text-muted">{t.howMethod}</dt>
        <dd className="m-0">{t.howMethodV}</dd>
        <dt className="text-muted">{t.howSlope}</dt>
        <dd className="m-0">{t.howSlopeV(fmt(d.slope_per_decade))}</dd>
        <dt className="text-muted">p_value</dt>
        <dd className="m-0">{fmtP(d.p_value, idioma)}</dd>
        <dt className="text-muted">q_value</dt>
        <dd className="m-0">{fmtP(d.q_value, idioma)}</dd>
        <dd className="col-span-full m-0 text-[13px] text-muted">{t.qExpl(m)}</dd>
        {d.motivo && (
          <>
            <dt className="text-muted">{t.howMotivo}</dt>
            <dd className="m-0">
              {(api && t.avisoFijo?.(variable, d.lag1, d.motivo)) || d.motivo}
            </dd>
          </>
        )}
        <dt className="text-muted">{t.howN}</dt>
        <dd className="m-0">
          {d.n_years} ({d.year_start}–{d.year_end})
        </dd>
        <dt className="text-muted">{t.howCeldas}</dt>
        <dd className="m-0">{d.celdas}</dd>
        <dt className="text-muted">{t.howLag}</dt>
        <dd className="m-0">{d.lag1 == null ? '—' : num(d.lag1, 2, idioma)}</dd>
        <dd className="col-span-full m-0 text-[13px] text-muted">{t.lagExpl}</dd>
        {/* Ficha técnica: lo que pide la sección de método de una tesis */}
        <dt className="text-muted">{t.tecCorreccion}</dt>
        <dd className="m-0">{t.tecCorreccionV(m)}</dd>
        <dt className="text-muted">{t.tecCriterio}</dt>
        <dd className="m-0">{t.tecCriterioV}</dd>
        {!api && (
          <>
            <dt className="text-muted">{t.tecGenerado}</dt>
            <dd className="m-0">{GENERADO}</dd>
          </>
        )}
        <dt className="text-muted">{t.howDatos}</dt>
        <dd className="m-0">{api ? t.datosApi : t.datosLocal}</dd>
        <dt className="text-muted">{t.howSrc}</dt>
        <dd className="m-0">
          {api ? (
            api.fuente
          ) : (
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noopener"
              className="text-accent-text"
            >
              NASA POWER ({parametroDe(variable)}, MERRA-2)
            </a>
          )}
        </dd>
      </dl>
    </details>
  )
}
