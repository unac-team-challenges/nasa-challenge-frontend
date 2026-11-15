import { useBusqueda } from '@/lib/busqueda'
import { TEXTOS, type Perfil } from '@/i18n/textos'
import type { Zona } from '@/data/datos'
import { colorDireccion } from '@/utils/direccion'
import { fmtPct, fmtValor } from '@/utils/formato'
import { useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { MedidorTendencia } from '@/features/ficha/components/MedidorTendencia'
import { escalaTendencia } from '@/features/ficha/utils/serie'
import { cifraCampo } from '@/features/ficha/utils/campo'

/**
 * El cambio por década. Agricultor: una frase («Cada 10 años llueve un 8 % menos») y el medidor
 * con palabras. Estudiante: la pendiente con su unidad, el rango probable y el medidor con valores.
 */
export function Tendencia({ zona: d, perfil }: { zona: Zona; perfil: Perfil }) {
  const idioma = useApp((s) => s.idioma)
  const { variable } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { rango } = useVista()
  const lluvia = variable === 'lluvia'
  const sube = d.slope_per_decade >= 0
  const color = colorDireccion(d.slope_per_decade, variable)
  const fmt = (v: number) => fmtValor(v, variable, idioma)
  const escala = escalaTendencia(Object.values(zonas), variable)

  if (perfil === 'agricultor') {
    const cifra = cifraCampo(d, variable, idioma)
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span
            className="font-display text-[28px] leading-[1.1] font-[750] tracking-[-0.015em] min-[521px]:text-[32px]"
            style={{ color: `var(${color})` }}
          >
            {t.campoFrase[variable](cifra, sube)}
          </span>
          <span className="text-[13px] text-muted">
            {t.campoPeriodo(rango.year_start, rango.year_end)}
          </span>
        </div>
        <MedidorTendencia
          zona={d}
          variable={variable}
          idioma={idioma}
          escala={escala}
          modo="campo"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
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
      <MedidorTendencia
        zona={d}
        variable={variable}
        idioma={idioma}
        escala={escala}
        modo="tecnico"
      />
      <p className="m-0 text-xs text-muted">{t.formula}</p>
    </div>
  )
}
