import { lazy } from 'react'
import { Download } from 'lucide-react'
import { NOMBRE, ninoEn, zonasProbadas, type Zona } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { fmtPct, fmtValor } from '@/utils/formato'
import { useDetalle, useSegundaFuente, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { AntesDespues } from '@/features/ficha/components/AntesDespues'
import { ComoLoSabemos } from '@/features/ficha/components/ComoLoSabemos'
import { DosFuentes } from '@/features/ficha/components/DosFuentes'
import { Figura } from '@/features/ficha/components/Figura'
import { serieCsv, type Punto } from '@/features/ficha/utils/serie'
import { Button } from '@/components/ui/button'

// Recharts y el gráfico se descargan aparte, al abrir la primera ficha
const GraficoSerie = lazy(() =>
  import('@/features/ficha/components/GraficoSerie').then((m) => ({ default: m.GraficoSerie })),
)

/**
 * Zona de contraste para la pista "sube aquí, baja allá": la de tendencia contraria
 * más fuerte, prefiriendo las que tienen "cambio real".
 */
function zonaContraste(d: Zona, zonas: Record<string, Zona>) {
  const contrarias = Object.values(zonas).filter(
    (z) =>
      z.id !== d.id &&
      z.status !== 'pocos_datos' &&
      Math.sign(z.slope_per_decade) !== Math.sign(d.slope_per_decade),
  )
  if (!contrarias.length) return null
  const puntaje = (z: Zona) =>
    (z.status === 'real' ? 1e6 : 0) + Math.abs(z.pct_change_per_decade ?? z.slope_per_decade)
  return contrarias.sort((x, y) => puntaje(y) - puntaje(x))[0]
}

/** Baja la serie como CSV (se arma en el navegador; no pide nada a la API). */
function descargar(nombre: string, texto: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Ficha del estudiante: «¿cómo sé que esto es verdad?». La serie completa con la tendencia y su
 * rango probable, preguntas para investigar, la serie en CSV, las dos fuentes y el método abierto.
 */
export function FichaEstudiante({ zona: d }: { zona: Zona }) {
  const { idioma, sinNino } = useApp()
  const { variable, sel, anio, seleccionar } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { api, rango } = useVista()
  const { serie: pts, estado, reintentar } = useDetalle(sel)
  const imerg = useSegundaFuente()
  const lluvia = variable === 'lluvia'
  const color = colorDireccion(d.slope_per_decade, variable)
  const fmt = (v: number) => fmtValor(v, variable, idioma)
  const td = zonaContraste(d, zonas)
  const serie: Punto[] = pts ?? []

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <span
          className="font-display text-[38px] leading-none font-[750] tracking-[-0.02em] min-[521px]:text-[46px]"
          style={{ color: `var(${color})` }}
        >
          {fmt(d.slope_per_decade)}
        </span>
        <span className="text-[15px]">
          {lluvia && d.pct_change_per_decade != null
            ? t.pctDecade(fmtPct(d.pct_change_per_decade))
            : t.perDecade}
        </span>
        <span className="text-[13px] text-muted">{t.range(fmt(d.ci_low), fmt(d.ci_high))}</span>
      </div>

      <Figura
        titulo={t.serieH}
        estado={estado}
        reintentar={reintentar}
        conNino={lluvia}
        pie={t.chartCap(lluvia, sinNino, ninoEn(rango).join(', '))}
      >
        <GraficoSerie
          zona={d}
          variable={variable}
          pts={pts}
          sinNino={sinNino}
          idioma={idioma}
          color={color}
          anio={anio}
        />
      </Figura>

      <section
        aria-labelledby="preguntas-h"
        className="flex flex-col gap-2.5 rounded-m border border-line p-3.5"
      >
        <h3 id="preguntas-h" className="m-0 text-sm font-semibold">
          {t.preguntasH}
        </h3>
        <ol className="m-0 flex flex-col gap-1.5 pl-5">
          {t.preguntas(variable, td ? NOMBRE[td.id] : null).map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        {serie.length > 1 && (
          <div>
            <Button
              onClick={() =>
                descargar(
                  `${NOMBRE[d.id]}-${variable}-${serie[0].y}-${serie[serie.length - 1].y}.csv`,
                  serieCsv(serie, variable),
                )
              }
            >
              <Download aria-hidden="true" />
              {t.csvBtn}
            </Button>
          </div>
        )}
      </section>

      {lluvia && imerg?.[d.id] && (
        <DosFuentes power={d} imerg={imerg[d.id]} idioma={idioma} perfil="estudiante" />
      )}

      {td && (
        <div className="flex flex-col gap-2.5 rounded-m border border-line p-3.5">
          <h3 className="m-0 text-sm font-semibold">{t.clueH}</h3>
          <p className="m-0">
            {t.clue(
              NOMBRE[td.id],
              t.verb[variable][td.slope_per_decade >= 0 ? 0 : 1],
              fmt(Math.abs(td.slope_per_decade)).replace('+', ''),
              t.status[td.status].toLowerCase(),
            )}
          </p>
          <div>
            <Button onClick={() => seleccionar(td.id)}>{t.clueBtn(NOMBRE[td.id])}</Button>
          </div>
        </div>
      )}

      <AntesDespues departamento={d.id} />

      <ComoLoSabemos
        zona={d}
        variable={variable}
        idioma={idioma}
        api={api}
        m={zonasProbadas(zonas)}
        abierto
      />
    </>
  )
}
