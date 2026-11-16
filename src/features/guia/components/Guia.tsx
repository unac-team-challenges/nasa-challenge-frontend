import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { marcarVista, useGuia, yaVista } from '@/features/guia/estado'
import { PASOS, UI, ZONA_EJEMPLO, type Etiquetas } from '@/features/guia/pasos'

interface Caja {
  top: number
  left: number
  width: number
  height: number
}

/** Margen del resaltado alrededor del elemento (px) */
const AIRE = 6
/** Espacio mínimo para poner la tarjeta encima o debajo del elemento (px) */
const ALTO_TARJETA = 220

/** El primer elemento visible del selector. En celular, los controles de escritorio existen pero
 * están ocultos (display: none) y el visible es el botón «⋯». */
function buscar(selector: string): Element | null {
  const todos = [...document.querySelectorAll(selector)]
  return todos.find((el) => el.getClientRects().length > 0) ?? todos[0] ?? null
}

/** La caja del elemento recortada a la pantalla: el mapa o el informe pueden ser más altos */
function medir(el: Element): Caja {
  const r = el.getBoundingClientRect()
  const top = Math.max(r.top - AIRE, 0)
  const left = Math.max(r.left - AIRE, 0)
  const bottom = Math.min(r.bottom + AIRE, innerHeight)
  const right = Math.min(r.right + AIRE, innerWidth)
  return { top, left, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) }
}

const igual = (a: Caja | null, b: Caja | null) =>
  a === b ||
  (!!a &&
    !!b &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height))

const reducido = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Tour por pasos para quien entra por primera vez: oscurece la pantalla, resalta una parte real
 * (mapa, leyenda, variables, perfil, tiempo, informe, controles, metodología) y la explica en
 * palabras simples. Arranca solo en la primera visita al explorador y se repite con «?».
 */
export function Guia() {
  const paso = useGuia((s) => s.paso)
  const idioma = useApp((s) => s.idioma)
  const { sel, seleccionar } = useBusqueda()
  const [caja, setCaja] = useState<Caja | null>(null)
  const siguienteRef = useRef<HTMLButtonElement>(null)
  /** El tour abrió el departamento de ejemplo: al cerrar se deja la vista como estaba */
  const abrioEjemplo = useRef(false)

  // Antes de pintar, para que la pista de AyudaModo no alcance a asomarse debajo del tour
  useLayoutEffect(() => {
    if (yaVista()) return
    marcarVista()
    useGuia.getState().abrir()
  }, [])

  const t = TEXTOS[idioma]
  const etiquetas: Etiquetas = {
    variableLbl: t.variableLbl,
    perfilLbl: t.perfilLbl,
    timeAria: t.timeAria,
  }
  const actual = paso == null ? null : PASOS[paso]
  const selector = actual?.ancla?.(etiquetas) ?? null

  const cerrar = () => {
    if (abrioEjemplo.current) {
      abrioEjemplo.current = false
      void seleccionar(null)
      useApp.getState().setInformeMin(true)
    }
    useGuia.getState().cerrar()
  }

  /** Va al paso pedido; salta los que no tienen su ancla en pantalla (la barra de tiempo no
   * existe en el modo vegetación). Pasado el último, cierra. */
  const ir = (destino: number, dir: 1 | -1) => {
    let n = destino
    while (n >= 0 && n < PASOS.length) {
      const ancla = PASOS[n].ancla?.(etiquetas)
      if (!ancla || buscar(ancla)) break
      n += dir
    }
    if (n >= PASOS.length) return cerrar()
    if (n < 0) return
    useGuia.getState().ir(n)
  }

  // El paso de ejemplo abre un departamento (el elegido, o Piura si no hay ninguno)
  useEffect(() => {
    if (!actual?.ejemplo) return
    if (sel) {
      useApp.getState().setInformeMin(false)
      return
    }
    abrioEjemplo.current = true
    void seleccionar(ZONA_EJEMPLO, false)
    // Solo al entrar al paso: sel cambia por esta misma acción
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso])

  // Lleva el elemento a la vista. El de la cabecera, arriba del todo: en celular la cabecera
  // se esconde al bajar.
  useEffect(() => {
    if (!selector) return
    const el = buscar(selector)
    if (!el) return
    if (el.closest('header')) scrollTo({ top: 0 })
    else el.scrollIntoView?.({ block: 'nearest', behavior: reducido() ? 'auto' : 'smooth' })
  }, [selector])

  // Sigue al elemento cuadro a cuadro: el informe se desliza, el mapa cambia de tamaño y la
  // página se desplaza. Solo se actualiza el estado cuando la caja de verdad cambió.
  useEffect(() => {
    if (paso == null) return
    let id = 0
    const seguir = () => {
      const el = selector ? buscar(selector) : null
      const nueva = el ? medir(el) : null
      setCaja((vieja) => (igual(vieja, nueva) ? vieja : nueva))
      id = requestAnimationFrame(seguir)
    }
    id = requestAnimationFrame(seguir)
    return () => cancelAnimationFrame(id)
  }, [paso, selector])

  useEffect(() => {
    if (paso == null) return
    siguienteRef.current?.focus()
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      else if (e.key === 'ArrowRight') ir(paso + 1, 1)
      else if (e.key === 'ArrowLeft') ir(paso - 1, -1)
    }
    addEventListener('keydown', tecla)
    return () => removeEventListener('keydown', tecla)
  })

  if (paso == null || !actual) return null
  const ui = UI[idioma]
  const { titulo, cuerpo } = actual.texto[idioma]
  const ultimo = paso === PASOS.length - 1

  // La tarjeta va debajo del elemento si cabe, si no encima; si el elemento ocupa casi toda la
  // pantalla (el mapa), abajo al centro.
  const ancho = Math.min(360, innerWidth - 32)
  let posicion: CSSProperties
  if (!caja) {
    posicion = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  } else {
    const centro = caja.left + caja.width / 2 - ancho / 2
    const left = Math.min(Math.max(centro, 16), innerWidth - ancho - 16)
    const abajo = innerHeight - (caja.top + caja.height)
    if (abajo >= ALTO_TARJETA) posicion = { top: caja.top + caja.height + 12, left }
    else if (caja.top >= ALTO_TARJETA) posicion = { bottom: innerHeight - caja.top + 12, left }
    else posicion = { bottom: 16, left: (innerWidth - ancho) / 2 }
  }

  // En <body>: el explorador es pointer-events-none y su z-[1] dejaría la cabecera (z-20) encima
  return createPortal(
    <div className="pointer-events-auto fixed inset-0 z-[70]">
      {/* Sin hueco cuando el paso no señala nada: toda la pantalla queda oscura */}
      {caja ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-m outline-2 outline-accent motion-safe:transition-all motion-safe:duration-300"
          style={{ ...caja, boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.6)' }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/60" />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guia-titulo"
        aria-describedby="guia-cuerpo"
        className="fixed flex flex-col gap-2.5 rounded-m border border-line bg-panel p-4 text-fg shadow-[0_12px_32px_var(--shadow)]"
        style={{ ...posicion, width: ancho }}
      >
        <p className="m-0 text-xs text-muted">{ui.contador(paso + 1, PASOS.length)}</p>
        <h2 id="guia-titulo" className="m-0 font-display text-lg font-[650] tracking-display">
          {titulo}
        </h2>
        <p id="guia-cuerpo" className="m-0 text-sm leading-relaxed">
          {cuerpo}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Button variant="ghost" size="sm" className="mr-auto px-2 text-muted" onClick={cerrar}>
            {ui.saltar}
          </Button>
          {paso > 0 && (
            <Button size="sm" onClick={() => ir(paso - 1, -1)}>
              {ui.atras}
            </Button>
          )}
          <Button
            ref={siguienteRef}
            size="sm"
            className="bg-accent text-accent-fg hover:bg-accent/90"
            onClick={() => ir(paso + 1, 1)}
          >
            {ultimo ? ui.listo : ui.siguiente}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
