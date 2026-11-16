import { memo, useEffect, useRef } from 'react'
import { NOMBRE, REGION, zonasProbadas } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useDetalle, useSegundaFuente, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { AntesDespues } from '@/features/ficha/components/AntesDespues'
import { CampoAnioNormal } from '@/features/ficha/components/CampoAnioNormal'
import { CampoAniosMalos } from '@/features/ficha/components/CampoAniosMalos'
import { CampoNino } from '@/features/ficha/components/CampoNino'
import { CampoOtraVariable } from '@/features/ficha/components/CampoOtraVariable'
import { CampoSeguir } from '@/features/ficha/components/CampoSeguir'
import { CausasConsecuencias } from '@/features/ficha/components/CausasConsecuencias'
import { ComoLoSabemos } from '@/features/ficha/components/ComoLoSabemos'
import { Confianza } from '@/features/ficha/components/Confianza'
import { SelectorZona } from '@/features/ficha/components/SelectorZona'
import { DosFuentes } from '@/features/ficha/components/DosFuentes'
import { EstLimitaciones } from '@/features/ficha/components/EstLimitaciones'
import { EstRanking } from '@/features/ficha/components/EstRanking'
import { EstRecursos } from '@/features/ficha/components/EstRecursos'
import { EstRobustez } from '@/features/ficha/components/EstRobustez'
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
 * El estudiante suma lo que pide una tesis: robustez, ranking, limitaciones, descargas y cita.
 * Va con memo: no tiene props, así que no se redibuja cuando se redibuja la ruta (al cambiar el
 * año de la barra de tiempo); solo cuando cambia lo que lee.
 */
export const Ficha = memo(function Ficha() {
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
        <SelectorZona className="self-start" />
        <p className="m-0 border-t border-line pt-3 text-xs text-muted">{t.disclaimer}</p>
      </div>
    )
  }

  const d = zonas[sel]
  const pocos = d.status === 'pocos_datos'
  const dos = variable === 'lluvia' && imerg?.[sel]
  const campo = perfil === 'agricultor'

  return (
    <div ref={raiz} data-ficha className="aparece-hijos flex flex-col gap-4.5">
      <div className="mr-11 flex flex-col gap-0.5">
        <span className="flex items-center justify-between gap-2 text-[13px] text-muted">
          {t.kind(REGION[sel])}
          <SelectorZona className="max-w-44 flex-none" />
        </span>
        <h2 className="m-0 font-display text-[32px] leading-[1.05] font-bold tracking-[-0.015em]">
          {NOMBRE[sel]}
        </h2>
        <span className="text-[13px] text-muted">{t.src(variable, d.celdas, fuente, !api)}</span>
        {nota && <span className="text-[13px] text-muted">{t.notaFija ?? nota}</span>}
      </div>

      {!pocos && <Tendencia zona={d} perfil={perfil} />}
      {/* El agricultor ve la confianza dentro de la tendencia; sin cifras, aquí sola */}
      {(!campo || pocos) && <Confianza zona={d} perfil={perfil} />}
      {/* Agricultor: la otra variable en una frase («¿Y el calor?») */}
      {campo && <CampoOtraVariable />}
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
      {/* Solo el estudiante: lo que necesita para defender el resultado en una tesis */}
      {!campo && !pocos && (
        <>
          <EstRobustez />
          <EstRanking />
        </>
      )}
      {!pocos && <CausasConsecuencias zona={d} perfil={perfil} />}
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
      {!campo && (
        <>
          {d.n_years > 0 && <EstLimitaciones anios={d.n_years} />}
          <EstRecursos />
        </>
      )}

      <p className="m-0 border-t border-line pt-3 text-xs text-muted">{t.disclaimer}</p>
    </div>
  )
})
