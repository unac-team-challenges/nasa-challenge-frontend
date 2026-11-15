import { lazy, Suspense, useEffect, useRef } from 'react'
import {
  NOMBRE,
  ninoEn,
  REGION,
  zonasProbadas,
  type Rango,
  type Variable,
  type Zona,
} from '../data/datos'
import { FRASES, TEXTOS, type Idioma, type Perfil } from '../i18n/textos'
import { useBusqueda } from '../lib/busqueda'
import { colorDireccion } from '../lib/direccion'
import { fmtP, fmtPct, fmtValor, mayuscula, num } from '../lib/formato'
import { useDetalle, useVista, useZonas } from '../lib/useZonas'
import { useApp } from '../store'
import { AntesDespues } from './AntesDespues'
import { ErrorSerie } from './Errores'
import { GraficoSkeleton } from './Esperas'
import { Button } from './ui/button'

// Recharts y el gráfico se descargan aparte, al abrir la primera ficha
const GraficoSerie = lazy(() => import('./GraficoSerie').then((m) => ({ default: m.GraficoSerie })))

const ESTADOS = ['real', 'posible_casualidad', 'pocos_datos'] as const

function frase(
  d: Zona,
  perfil: Perfil,
  variable: Variable,
  rango: Rango,
  idioma: Idioma,
  m: number,
) {
  const P = FRASES[idioma]
  const z = NOMBRE[d.id]
  const mas = d.slope_per_decade >= 0
  const { year_start: a, year_end: b } = rango
  if (d.status === 'pocos_datos') return P.few(z)
  const real = d.status === 'real'
  const val = fmtValor(Math.abs(d.slope_per_decade), variable, idioma).replace('+', '')
  switch (perfil) {
    case 'agricultor':
      return real
        ? P.agricultorUp(z, mas ? P.farmMore[variable] : P.farmLess[variable], a)
        : P.agricultorCas(z)
    case 'municipalidad':
      return real
        ? P.municipalidadUp(z, P.noun[variable], val, mas, a, b)
        : P.municipalidadCas(z, mayuscula(P.noun[variable]))
    case 'estudiante':
      return real
        ? P.estudianteUp(
            fmtP(d.p_value, idioma),
            fmtP(d.q_value, idioma),
            m,
            fmtValor(d.slope_per_decade, variable, idioma),
          )
        : P.estudianteCas(fmtP(d.p_value, idioma), fmtP(d.q_value, idioma), m)
    default:
      return real
        ? P.publicoUp(z, mas ? P.more[variable] : P.less[variable], a)
        : P.publicoCas(z, P.noun[variable])
  }
}

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

/** Ficha-informe de la zona elegida (o la invitación a tocar el mapa). */
export function Ficha() {
  const { idioma, sinNino, setSinNino } = useApp()
  const { variable, perfil, sel, seleccionar, anio } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { api, rango, fuente } = useVista()
  const { serie: pts, nota, estado, reintentar } = useDetalle(sel)
  const raiz = useRef<HTMLDivElement>(null)

  // Fundido de 220 ms al cambiar de zona (v18), no al cambiar otros datos
  useEffect(() => {
    const el = raiz.current
    if (!el || !sel || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.animate(
      [
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'none' },
      ],
      {
        duration: 220,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    )
  }, [sel])

  if (!sel) {
    return (
      <div className="flex flex-col gap-3.5">
        <h2 className="m-0 mr-11 font-display text-[26px] leading-[1.1] font-bold tracking-display">
          {t.tapH}
        </h2>
        <p className="m-0 text-muted">{t.tapP[variable]}</p>
        <p className="m-0 border-t border-line pt-3 text-xs text-muted">{t.disclaimer}</p>
      </div>
    )
  }

  const d = zonas[sel]
  const m = zonasProbadas(zonas)
  const st = d.status
  const color = st === 'pocos_datos' ? '--muted' : colorDireccion(d.slope_per_decade, variable)
  const lluvia = variable === 'lluvia'
  const td = zonaContraste(d, zonas)
  const fmt = (v: number) => fmtValor(v, variable, idioma)
  const aniosNino = ninoEn(rango).join(', ')

  const insignia =
    st === 'real'
      ? 'bg-fg text-bg'
      : st === 'pocos_datos'
        ? 'border-[1.5px] border-dashed border-muted text-muted'
        : 'border border-fg [background-image:repeating-linear-gradient(135deg,var(--line)_0_3px,transparent_3px_7px)]'

  return (
    <div ref={raiz} className="flex flex-col gap-4.5">
      <div className="mr-11 flex flex-col gap-0.5">
        <span className="text-[13px] text-muted">{t.kind(REGION[sel])}</span>
        <h2 className="m-0 font-display text-[32px] leading-[1.05] font-bold tracking-[-0.015em]">
          {NOMBRE[sel]}
        </h2>
        <span className="text-[13px] text-muted">{t.src(variable, d.celdas, fuente, !api)}</span>
        {nota && <span className="text-[13px] text-muted">{t.notaFija ?? nota}</span>}
      </div>

      <div
        className="flex flex-col gap-2 rounded-m border-l-4 bg-panel-2 p-3.5"
        style={{ borderLeftColor: `var(${color})` }}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex gap-[5px]" aria-hidden="true">
            {ESTADOS.map((s) => (
              <i
                key={s}
                className={`block size-3 rounded-full ${s === st ? 'bg-fg' : 'bg-line'}`}
              />
            ))}
          </span>
          <span className={`rounded-full px-2.5 py-[3px] text-sm font-semibold ${insignia}`}>
            {t.status[st]}
          </span>
        </div>
        <p className="m-0 text-base">{frase(d, perfil, variable, rango, idioma, m)}</p>
      </div>

      {st === 'pocos_datos' ? (
        <p className="m-0">{t.fewCeldas(d.celdas, fuente, !api)}</p>
      ) : (
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
          <figure className="m-0 flex flex-col gap-1.5">
            {estado === 'error' ? (
              <ErrorSerie reintentar={reintentar} />
            ) : estado === 'cargando' ? (
              <GraficoSkeleton />
            ) : (
              <Suspense fallback={<GraficoSkeleton />}>
                <GraficoSerie
                  zona={d}
                  variable={variable}
                  pts={pts}
                  sinNino={sinNino}
                  idioma={idioma}
                  color={color}
                  anio={anio}
                />
              </Suspense>
            )}
            <figcaption className="text-xs text-muted">
              {t.chartCap(lluvia, sinNino, aniosNino)}
            </figcaption>
          </figure>
          {lluvia && (
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
        </>
      )}

      <AntesDespues departamento={sel} />

      {td && st !== 'pocos_datos' && (
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

      {st !== 'pocos_datos' && (
        <details className="border-t border-line pt-3" open={perfil === 'estudiante'}>
          <summary className="flex min-h-8 cursor-pointer items-center font-semibold">
            {t.howH}
          </summary>
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
                <dd className="m-0">{(api && t.avisoFijo?.(variable, d.lag1)) || d.motivo}</dd>
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
                  NASA POWER ({variable === 'lluvia' ? 'PRECTOTCORR' : 'T2M'})
                </a>
              )}
            </dd>
          </dl>
        </details>
      )}

      <p className="m-0 border-t border-line pt-3 text-xs text-muted">{t.disclaimer}</p>
    </div>
  )
}
