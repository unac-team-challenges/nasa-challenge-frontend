import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type CSSProperties, type MouseEvent } from 'react'
import { ORDEN_PERFILES, TEXTOS, type Perfil } from '@/i18n/textos'
import { ALTO_MAPA_CELULAR } from '@/utils/disposicion'
import { useVista } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
/** El texto sale (index.css .saliendo) antes de cambiar de pantalla; el mapa sigue y vuela. */
const SALIDA_MS = 320

/**
 * Portada: el mapa 3D es el fondo de la pantalla con el Perú a la derecha (lo corre la escena);
 * a la izquierda, la pregunta, los perfiles y el botón, cada bloque en su panel.
 * El mapa lo dibuja App y es el mismo del explorador: al entrar, la cámara vuela sin recargar.
 */
export function Portada() {
  const { idioma, conWebgl } = useApp()
  const navigate = useNavigate()
  const t = TEXTOS[idioma]
  // La portada habla de la lluvia: sus años y su fuente
  const { rango, fuente } = useVista('lluvia')
  const { year_start: a, year_end: b } = rango
  const [saliendo, setSaliendo] = useState(false)

  const explorar = (perfil?: Perfil) => {
    const ir = () => navigate({ to: '/explorar', search: (s) => (perfil ? { ...s, perfil } : s) })
    if (reducido()) {
      ir()
      return
    }
    setSaliendo(true)
    setTimeout(ir, SALIDA_MS)
  }

  return (
    <section
      aria-labelledby="home-h"
      className={`pointer-events-none relative z-[1] flex flex-1 flex-col ${saliendo ? 'saliendo' : ''}`}
    >
      {/* En celular el mapa va arriba: este espacio lo deja ver */}
      <div className={`relative flex-none ${ALTO_MAPA_CELULAR} min-[901px]:hidden`}>
        {conWebgl && (
          <p className="vidrio absolute right-4 bottom-3 left-4 m-0 rounded-s px-3 py-1.5 text-[12px] text-muted">
            {t.heroCap(a, b)}
          </p>
        )}
      </div>
      <div className="flex flex-1 items-center px-4 py-6 min-[901px]:px-8">
        <div className="pointer-events-auto flex w-full max-w-136 flex-col gap-3">
          <div className="vidrio entrada rounded-l px-5 py-5">
            <h1
              id="home-h"
              className="m-0 font-display text-[clamp(32px,4vw,54px)] leading-[1.02] font-bold tracking-[-0.02em]"
            >
              {t.heroH}
            </h1>
            <p className="m-0 mt-3 max-w-120 text-[17px] text-muted">{t.heroLead(a, b)}</p>
          </div>
          <div
            className="vidrio entrada flex flex-col gap-2.5 rounded-l px-4 py-3.5"
            style={{ '--retraso': '0.08s' } as CSSProperties}
          >
            <h2 className="m-0 text-[15px] font-semibold">{t.whoH}</h2>
            <div className="grid grid-cols-1 gap-2 min-[521px]:grid-cols-2">
              {ORDEN_PERFILES.map((p) => {
                const [nombre, pista] = t.perfiles[p]
                return (
                  <button
                    key={p}
                    type="button"
                    className="presionable flex min-h-16 cursor-pointer flex-col gap-0.5 rounded-m border border-line-2 bg-panel px-3.5 py-3 text-left transition-colors hover:border-accent"
                    onClick={() => explorar(p)}
                  >
                    <b className="text-[15px]">{nombre}</b>
                    <span className="text-[13px] text-muted">{pista}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div
            className="vidrio entrada flex flex-wrap items-center gap-x-4 gap-y-2 rounded-l px-4 py-3"
            style={{ '--retraso': '0.16s' } as CSSProperties}
          >
            <Button asChild variant="default">
              <Link
                to="/explorar"
                search={(s) => s}
                onClick={(e: MouseEvent) => {
                  // clic normal: el texto sale y luego se navega; con Ctrl/⌘ el navegador abre otra pestaña
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                  e.preventDefault()
                  explorar()
                }}
              >
                {t.exploreBtn}
              </Link>
            </Button>
            <span className="text-[13px] text-muted">{t.fuenteReal(fuente)}</span>
            <Link
              to="/metodologia"
              search={(p) => ({ lang: p.lang })}
              className="text-[13px] text-accent-text"
            >
              {t.metodologiaEnlace}
            </Link>
          </div>
        </div>
      </div>
      {/* "Arrastra para girar" solo tiene sentido en 3D */}
      {conWebgl && (
        <p className="vidrio absolute right-4 bottom-3.5 m-0 hidden max-w-[44%] rounded-s px-3 py-1.5 text-[13px] text-muted min-[901px]:block">
          {t.heroCap(a, b)}
        </p>
      )}
    </section>
  )
}
