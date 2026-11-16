import { Mountain } from 'lucide-react'
import { useBusqueda } from '@/lib/busqueda'
import { TEXTOS, type Perfil } from '@/i18n/textos'
import type { Zona } from '@/data/datos'
import { colorDireccion } from '@/utils/direccion'
import { fmtPct, fmtValor } from '@/utils/formato'
import { useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Confianza } from '@/features/ficha/components/Confianza'
import { MedidorTendencia } from '@/features/ficha/components/MedidorTendencia'
import { escalaTendencia } from '@/features/ficha/utils/serie'
import { titularCampo } from '@/features/ficha/utils/campo'

/**
 * El cambio. Agricultor: cuánto cambió en todo el periodo, en palabras de chacra («Desde 2001,
 * llueve como un quinto menos que antes»; el calor, también en metros de altura), el medidor con
 * palabras y, en la misma tarjeta, qué tan seguro es: así el titular y su confianza no se leen
 * como dos bloques que dicen lo mismo. Estudiante: la pendiente con su unidad, el rango probable y
 * el medidor con valores (la confianza va aparte, con la prueba).
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
    const { claro, titular, debajo, metros } = titularCampo(d, variable, rango, idioma)
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span
            className="font-display text-[28px] leading-[1.1] font-[750] tracking-[-0.015em] min-[521px]:text-[32px]"
            style={{ color: claro ? `var(${color})` : 'var(--muted)' }}
          >
            {titular}
          </span>
          <span className="text-[13px] text-muted">{debajo}</span>
        </div>
        {/* El calor en metros de altura: solo si el cambio es claro */}
        {metros != null && (
          <div className="flex flex-col gap-1">
            {/* Como la gota de «Un año normal aquí»: el ícono dentro de la misma línea */}
            <p className="m-0 flex items-center gap-2 font-semibold">
              <Mountain className="size-5 flex-none text-muted" aria-hidden="true" />
              {t.campoAltura(`${metros} m`, sube)}
            </p>
            <p className="m-0 text-xs text-muted">{t.campoAlturaNota}</p>
          </div>
        )}
        <MedidorTendencia
          zona={d}
          variable={variable}
          idioma={idioma}
          escala={escala}
          modo="campo"
        />
        <Confianza zona={d} perfil={perfil} />
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
