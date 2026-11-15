import { useEffect, useRef } from 'react'
import { NOMBRE, REGION, zonasProbadas, type Rango, type Variable, type Zona } from '@/data/datos'
import { FRASES, TEXTOS, type Idioma, type Perfil } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { fmtP, fmtValor } from '@/utils/formato'
import { useDetalle, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { AntesDespues } from '@/features/ficha/components/AntesDespues'
import { FichaAgricultor } from '@/features/ficha/components/FichaAgricultor'
import { FichaEstudiante } from '@/features/ficha/components/FichaEstudiante'

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
  const { year_start: a } = rango
  if (d.status === 'pocos_datos') return P.few(z)
  const real = d.status === 'real'
  switch (perfil) {
    case 'agricultor':
      return real
        ? P.agricultorUp(z, mas ? P.farmMore[variable] : P.farmLess[variable], a)
        : P.agricultorCas(z)
    default:
      return real
        ? P.estudianteUp(
            fmtP(d.p_value, idioma),
            fmtP(d.q_value, idioma),
            m,
            fmtValor(d.slope_per_decade, variable, idioma),
          )
        : P.estudianteCas(fmtP(d.p_value, idioma), fmtP(d.q_value, idioma), m)
  }
}

/** Ficha-informe de la zona elegida (o la invitación a tocar el mapa). */
export function Ficha() {
  const idioma = useApp((s) => s.idioma)
  const { variable, perfil, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { api, rango, fuente } = useVista()
  const { nota } = useDetalle(sel)
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
        <>
          <p className="m-0">{t.fewCeldas(d.celdas, fuente, !api)}</p>
          <AntesDespues departamento={sel} />
        </>
      ) : perfil === 'agricultor' ? (
        <FichaAgricultor zona={d} />
      ) : (
        <FichaEstudiante zona={d} />
      )}

      <p className="m-0 border-t border-line pt-3 text-xs text-muted">{t.disclaimer}</p>
    </div>
  )
}
