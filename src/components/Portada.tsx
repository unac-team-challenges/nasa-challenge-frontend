import { PERIODOS } from '../data/datos'
import { ORDEN_PERFILES, TEXTOS } from '../i18n/textos'
import { Mapa3D } from '../mapa/Mapa3D'
import { useApp } from '../store'

/** Portada: el Perú en 3D, la pregunta, los 2 perfiles (agricultor y estudiante) y el botón principal. */
export function Portada() {
  const { idioma, setPerfil, conWebgl } = useApp()
  const t = TEXTOS[idioma]
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
          <p className="m-0 max-w-120 text-lg text-muted">{t.heroLead}</p>
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
                    onClick={() => {
                      setPerfil(p)
                      location.hash = 'explorar'
                    }}
                  >
                    <b className="text-[15px]">{nombre}</b>
                    <span className="text-[13px] text-muted">{pista}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href="#explorar"
              className="presionable inline-flex min-h-10 items-center rounded-s border border-accent bg-accent px-3.5 text-sm font-semibold text-accent-fg no-underline"
            >
              {t.exploreBtn}
            </a>
            <span className="text-[13px] text-muted">{t.fuenteReal}</span>
          </div>
        </div>
        <div className="relative order-first min-h-100 overflow-hidden rounded-l border border-line min-[901px]:order-none min-[901px]:min-h-105">
          <Mapa3D modo="inicio" />
          {/* "Arrastra para girar" solo tiene sentido en 3D */}
          {conWebgl && (
            <p className="pointer-events-none absolute right-4 bottom-3.5 left-4 z-[2] m-0 text-[13px] text-muted">
              {t.heroCap(PERIODOS.largo.year_start, PERIODOS.largo.year_end)}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
