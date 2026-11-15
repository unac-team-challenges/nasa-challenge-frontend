import { useLayoutEffect, useState } from 'react'
import { useApp } from '@/stores/app'
import { margenMapa, SIN_MARGEN } from '@/utils/margenMapa'

/**
 * Mide cuánto tapan los paneles marcados con `data-cubre-mapa` dentro de la caja del mapa y lo
 * deja en el store, para que el mapa 2D se encuadre en lo que queda libre. Devuelve la ref de la caja.
 */
export function useMargenMapa<T extends HTMLElement>() {
  // Ref con callback: la caja puede montarse tarde (el explorador espera sus datos)
  const [caja, ref] = useState<T | null>(null)

  useLayoutEffect(() => {
    if (!caja) return
    let paneles: Element[] = []
    const medir = () => {
      // Con algo desplegado (la leyenda abierta) es una hoja que la persona abrió a propósito:
      // se conserva la última medida, para que el mapa no se mueva al abrirla
      if (caja.querySelector('details[open]')) return
      const m = margenMapa(
        caja.getBoundingClientRect(),
        paneles.map((p) => p.getBoundingClientRect()),
      )
      const a = useApp.getState().margenMapa
      if (a.arriba !== m.arriba || a.abajo !== m.abajo) useApp.setState({ margenMapa: m })
    }
    const ro = new ResizeObserver(medir)
    // Los paneles pueden aparecer o irse (avisos, leyenda): se vuelven a buscar al cambiar la caja
    const observar = () => {
      ro.disconnect()
      ro.observe(caja)
      paneles = [...caja.querySelectorAll('[data-cubre-mapa]')]
      paneles.forEach((p) => ro.observe(p))
      medir()
    }
    // Varios cambios del DOM seguidos (etiquetas, avisos) se miden una sola vez por cuadro
    let cuadro = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(observar)
    })
    mo.observe(caja, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    })
    observar()
    return () => {
      cancelAnimationFrame(cuadro)
      ro.disconnect()
      mo.disconnect()
      useApp.setState({ margenMapa: SIN_MARGEN })
    }
  }, [caja])

  return ref
}
