import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { NOMBRE, type Variable, type Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { fmtValor } from '@/utils/formato'

/**
 * Celular: dónde termina la cabecera de la página en pantalla (0 si está oculta). Se esconde al
 * bajar y vuelve al subir con una transición: se mide su borde real en cada cuadro de esa
 * transición, así la barra de la zona baja y sube pegada a ella.
 */
function useBordeCabecera() {
  const [borde, setBorde] = useState(0)
  useEffect(() => {
    const cab = document.querySelector<HTMLElement>('header[data-oculta]')
    if (!cab) return
    let cuadro = 0
    let animando = false
    const medir = () => setBorde(Math.max(0, Math.round(cab.getBoundingClientRect().bottom)))
    const seguir = () => {
      medir()
      if (animando) cuadro = requestAnimationFrame(seguir)
    }
    const alMover = () => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(medir)
    }
    const empieza = () => {
      animando = true
      cancelAnimationFrame(cuadro)
      seguir()
    }
    const termina = () => {
      animando = false
      alMover()
    }
    alMover()
    addEventListener('scroll', alMover, { passive: true })
    addEventListener('resize', alMover)
    cab.addEventListener('transitionrun', empieza)
    cab.addEventListener('transitionend', termina)
    cab.addEventListener('transitioncancel', termina)
    return () => {
      cancelAnimationFrame(cuadro)
      removeEventListener('scroll', alMover)
      removeEventListener('resize', alMover)
      cab.removeEventListener('transitionrun', empieza)
      cab.removeEventListener('transitionend', termina)
      cab.removeEventListener('transitioncancel', termina)
    }
  }, [])
  return borde
}

/** Si el nombre grande de la zona ya salió por arriba de la pantalla (la barra lleva key por zona) */
function useNombreFuera(sel: string) {
  const [fuera, setFuera] = useState(false)
  useEffect(() => {
    // Sin IntersectionObserver (navegadores viejos, jsdom) la barra simplemente no aparece
    if (typeof IntersectionObserver === 'undefined') return
    let obs: IntersectionObserver | undefined
    // La ficha entra después de la presentación del departamento: se busca el título cuando aparece
    const buscar = () => {
      const h = document.querySelector('#informe [data-ficha] h2')
      if (!h) return false
      obs = new IntersectionObserver(([e]) =>
        setFuera(!e.isIntersecting && e.boundingClientRect.top < 0),
      )
      obs.observe(h)
      return true
    }
    const espera = buscar()
      ? undefined
      : new MutationObserver(() => buscar() && espera?.disconnect())
    espera?.observe(document.body, { childList: true, subtree: true })
    return () => {
      espera?.disconnect()
      obs?.disconnect()
    }
  }, [sel])
  return fuera
}

/**
 * Celular: barra fija con la zona y cuánto cambió, para no perderse en un informe largo.
 * Aparece cuando el nombre grande sale de la pantalla; «Mapa» sube al mapa.
 */
export function BarraZona({
  sel,
  zona,
  variable,
  idioma,
}: {
  sel: string
  zona: Zona
  variable: Variable
  idioma: Idioma
}) {
  const t = TEXTOS[idioma]
  const top = useBordeCabecera()
  const fuera = useNombreFuera(sel)
  const conValor = zona.status !== 'pocos_datos'
  const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    // Envoltura de alto 0 y pegajosa: la barra flota sin empujar el informe
    <div className="sticky z-[3] -mx-4 h-0 min-[901px]:hidden" style={{ top }}>
      <div
        data-visible={fuera}
        aria-hidden={!fuera}
        inert={!fuera}
        className="absolute inset-x-0 top-0 flex h-13 items-center gap-3 border-b border-line bg-panel/95 px-4 shadow-[0_10px_24px_-18px_var(--shadow)] backdrop-blur-md transition-[opacity,translate] duration-200 data-[visible=false]:pointer-events-none data-[visible=false]:-translate-y-2 data-[visible=false]:opacity-0 motion-reduce:transition-none"
      >
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-display text-[17px] font-bold tracking-display">
            {NOMBRE[sel]}
          </span>
          <span className="truncate text-xs text-muted">
            {conValor && (
              <span
                className="font-semibold tabular-nums"
                style={{ color: `var(${colorDireccion(zona.slope_per_decade, variable)})` }}
              >
                {fmtValor(zona.slope_per_decade, variable, idioma)} {t.perDecade}
                {' · '}
              </span>
            )}
            {t.status[zona.status]}
          </span>
        </div>
        <button
          type="button"
          onClick={() => scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' })}
          className="presionable flex min-h-11 flex-none cursor-pointer items-center gap-1.5 rounded-m border border-line-2 bg-panel px-3 text-sm font-semibold text-fg"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          {t.verMapa}
        </button>
      </div>
    </div>
  )
}
