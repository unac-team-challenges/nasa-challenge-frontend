import { lazy } from 'react'
import { ninoEn, zonasProbadas, type Zona } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { num } from '@/utils/formato'
import { useDetalle, useSegundaFuente, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { AntesDespues } from '@/features/ficha/components/AntesDespues'
import { ComoLoSabemos } from '@/features/ficha/components/ComoLoSabemos'
import { DosFuentes } from '@/features/ficha/components/DosFuentes'
import { Figura } from '@/features/ficha/components/Figura'
import { peoresAnios } from '@/features/ficha/utils/serie'

// Recharts y el gráfico se descargan aparte, al abrir la primera ficha
const GraficoAnomalias = lazy(() =>
  import('@/features/ficha/components/GraficoAnomalias').then((m) => ({
    default: m.GraficoAnomalias,
  })),
)

/** Une años con «y» / «and»: "2004, 2016 y 1992". */
function lista(anios: number[], y: string) {
  return anios.length < 2 ? anios.join('') : `${anios.slice(0, -1).join(', ')} ${y} ${anios.at(-1)}`
}

/**
 * Ficha del agricultor: «¿qué está pasando en mi tierra y qué vigilo?». La cifra en palabras de
 * campo, cada año frente a lo normal, el verdor del valle y qué vigilar. El método, al final y cerrado.
 */
export function FichaAgricultor({ zona: d }: { zona: Zona }) {
  const { idioma, sinNino } = useApp()
  const { variable, sel, anio } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { api, rango } = useVista()
  const { serie: pts, estado, reintentar } = useDetalle(sel)
  const imerg = useSegundaFuente()
  const lluvia = variable === 'lluvia'
  const sube = d.slope_per_decade >= 0
  const color = colorDireccion(d.slope_per_decade, variable)
  // Lluvia en % (se entiende mejor que los mm); temperatura en °C
  const cifra =
    lluvia && d.pct_change_per_decade != null
      ? `${Math.round(Math.abs(d.pct_change_per_decade))} %`
      : lluvia
        ? `${Math.round(Math.abs(d.slope_per_decade))} mm`
        : `${num(d.slope_per_decade, 2, idioma)} °C`
  const peores = pts && pts.length >= 5 ? peoresAnios(pts, variable) : []
  const consejos = t.vigilar[variable][sube ? 'sube' : 'baja']

  return (
    <>
      <div className="flex flex-col gap-1">
        <span
          className="font-display text-[30px] leading-[1.05] font-[750] tracking-[-0.015em] min-[521px]:text-[34px]"
          style={{ color: `var(${color})` }}
        >
          {t.campoCambio[variable](cifra, sube)}
        </span>
        <span className="text-[13px] text-muted">
          {t.campoPeriodo(rango.year_start, rango.year_end)}
        </span>
        {d.status !== 'real' && (
          <span className="text-[15px] font-semibold">{t.campoNoSeguro}</span>
        )}
        {peores.length > 0 && (
          <span className="text-[15px]">
            {t.campoPeores[variable](lista(peores, idioma === 'es' ? 'y' : 'and'))}
          </span>
        )}
      </div>

      <Figura
        titulo={t.anomH}
        estado={estado}
        reintentar={reintentar}
        conNino={lluvia}
        pie={t.anomCap(
          variable,
          rango.year_start,
          rango.year_end,
          sinNino,
          ninoEn(rango).join(', '),
        )}
      >
        <GraficoAnomalias
          id={d.id}
          variable={variable}
          pts={pts}
          sinNino={sinNino}
          idioma={idioma}
          anio={anio}
        />
      </Figura>

      <section
        aria-labelledby="vigilar-h"
        className="flex flex-col gap-2.5 rounded-m border border-line p-3.5"
      >
        <h3 id="vigilar-h" className="m-0 text-sm font-semibold">
          {t.vigilarH}
        </h3>
        <p className="m-0">{t.vigilarIntro(d.status === 'real')}</p>
        <ul className="m-0 flex flex-col gap-1.5 pl-5">
          {consejos.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="m-0 text-xs text-muted">{t.vigilarNota}</p>
      </section>

      <AntesDespues departamento={d.id} />

      {lluvia && imerg?.[d.id] && (
        <DosFuentes power={d} imerg={imerg[d.id]} idioma={idioma} perfil="agricultor" />
      )}

      <ComoLoSabemos
        zona={d}
        variable={variable}
        idioma={idioma}
        api={api}
        m={zonasProbadas(zonas)}
        abierto={false}
      />
    </>
  )
}
