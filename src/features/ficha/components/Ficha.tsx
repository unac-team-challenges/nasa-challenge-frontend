import { useEffect, useRef } from 'react'
import { NOMBRE, REGION, zonasProbadas } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useDetalle, useSegundaFuente, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { AntesDespues } from '@/features/ficha/components/AntesDespues'
import { CampoAnioNormal } from '@/features/ficha/components/CampoAnioNormal'
import { CampoAniosMalos } from '@/features/ficha/components/CampoAniosMalos'
import { CampoNino } from '@/features/ficha/components/CampoNino'
import { CampoSeguir } from '@/features/ficha/components/CampoSeguir'
import { ComoLoSabemos } from '@/features/ficha/components/ComoLoSabemos'
import { Confianza } from '@/features/ficha/components/Confianza'
import { DosFuentes } from '@/features/ficha/components/DosFuentes'
import { PistaContraste } from '@/features/ficha/components/PistaContraste'
import { SerieZona } from '@/features/ficha/components/SerieZona'
import { Tendencia } from '@/features/ficha/components/Tendencia'

/**
 * Ficha-informe de la zona elegida (o la invitación a tocar el mapa).
 * Los dos perfiles ven los mismos datos, en el mismo orden: tendencia, confianza, serie, dos
 * fuentes y verdor del valle. Cada bloque cambia cómo lo muestra (palabras de campo para el
 * agricultor, la estadística para el estudiante), nunca qué dato muestra. El agricultor suma
 * lecturas de esa misma serie pensadas para su campaña (años malos, El Niño, año normal) y
 * a dónde ir por avisos oficiales; «¿Coinciden dos fuentes?» queda solo para el estudiante.
 */
export function Ficha() {
  const idioma = useApp((s) => s.idioma)
  const { variable, perfil, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { api, fuente } = useVista()
  const { nota } = useDetalle(sel)
  const imerg = useSegundaFuente()
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
  const pocos = d.status === 'pocos_datos'
  const dos = variable === 'lluvia' && imerg?.[sel]
  const campo = perfil === 'agricultor'

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

      {!pocos && <Tendencia zona={d} perfil={perfil} />}
      <Confianza zona={d} perfil={perfil} />
      {/* Solo el agricultor: lo que necesita para su campaña, sacado de la misma serie anual */}
      {campo && !pocos && (
        <>
          <CampoAniosMalos />
          <CampoNino />
          <CampoAnioNormal />
        </>
      )}
      {pocos ? (
        <p className="m-0">{t.fewCeldas(d.celdas, fuente, !api)}</p>
      ) : (
        <SerieZona zona={d} perfil={perfil} />
      )}
      {/* Solo el estudiante: al agricultor no le sirve comparar fuentes */}
      {dos && !campo && <DosFuentes power={d} imerg={dos} idioma={idioma} />}
      <AntesDespues departamento={sel} perfil={perfil} />
      {!pocos && <PistaContraste zona={d} />}
      {campo && <CampoSeguir />}
      {!pocos && (
        <ComoLoSabemos
          zona={d}
          variable={variable}
          idioma={idioma}
          api={api}
          m={zonasProbadas(zonas)}
          abierto={perfil === 'estudiante'}
        />
      )}

      <p className="m-0 border-t border-line pt-3 text-xs text-muted">{t.disclaimer}</p>
    </div>
  )
}
