import { Link, useNavigate } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { ORDEN_PERFILES, TEXTOS } from '../i18n/textos'
import { useVista } from '../lib/useZonas'
import { useApp } from '../store'
import { MapaSkeleton } from './Esperas'
import { Button } from './ui/button'

// three.js pesa casi la mitad de la web: se descarga aparte mientras se ve el esqueleto
const Mapa3D = lazy(() => import('../mapa/Mapa3D').then((m) => ({ default: m.Mapa3D })))

/** Portada: el Perú en 3D, la pregunta, los 2 perfiles (agricultor y estudiante) y el botón principal. */
export function Portada() {
  const { idioma, conWebgl } = useApp()
  const navigate = useNavigate()
  const t = TEXTOS[idioma]
  // La portada habla de la lluvia: sus años y su fuente
  const { rango, fuente } = useVista('lluvia')
  const { year_start: a, year_end: b } = rango
  return (
    <section aria-labelledby="home-h" className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 items-stretch gap-6 px-4 py-6 min-[901px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex max-w-136 flex-col justify-center gap-5.5 py-6">
          <h1
            id="home-h"
            className="m-0 font-display text-[clamp(34px,4.6vw,58px)] leading-[1.02] font-bold tracking-[-0.02em]"
          >
            {t.heroH}
          </h1>
          <p className="m-0 max-w-120 text-lg text-muted">{t.heroLead(a, b)}</p>
          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 text-[15px] font-semibold">{t.whoH}</h2>
            <div className="grid grid-cols-1 gap-2 min-[521px]:grid-cols-2">
              {ORDEN_PERFILES.map((p) => {
                const [nombre, pista] = t.perfiles[p]
                return (
                  <button
                    key={p}
                    type="button"
                    className="presionable flex min-h-16 cursor-pointer flex-col gap-0.5 rounded-m border border-line-2 bg-panel px-3.5 py-3 text-left hover:border-accent"
                    onClick={() =>
                      navigate({ to: '/explorar', search: (s) => ({ ...s, perfil: p }) })
                    }
                  >
                    <b className="text-[15px]">{nombre}</b>
                    <span className="text-[13px] text-muted">{pista}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button asChild variant="default">
              <Link to="/explorar" search={(s) => s}>
                {t.exploreBtn}
              </Link>
            </Button>
            <span className="text-[13px] text-muted">{t.fuenteReal(fuente)}</span>
            <Link to="/metodologia" className="text-[13px] text-accent-text">
              {t.metodologiaEnlace}
            </Link>
          </div>
        </div>
        <div className="relative order-first min-h-100 overflow-hidden rounded-l border border-line min-[901px]:order-none min-[901px]:min-h-105">
          <Suspense fallback={<MapaSkeleton />}>
            <Mapa3D modo="inicio" />
          </Suspense>
          {/* "Arrastra para girar" solo tiene sentido en 3D */}
          {conWebgl && (
            <p className="pointer-events-none absolute right-4 bottom-3.5 left-4 z-[2] m-0 text-[13px] text-muted">
              {t.heroCap(a, b)}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
