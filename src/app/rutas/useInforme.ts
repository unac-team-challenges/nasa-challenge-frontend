import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { escenaActiva } from '@/features/mapa/escena/activa'
import type { ModoVista } from '@/stores/app'

/** Ancho de la franja del informe minimizado (px). */
export const FRANJA = 56

/**
 * Devuelve la ref del informe y se encarga de dos cosas:
 * - Si el informe nuevo es más corto, el navegador baja la página sin avisar: se lleva la vista
 *   al principio del informe (nunca al mapa). Si cabe, la posición no se toca.
 * - El informe tapa parte del mapa: la escena corre el Perú para que quede a la vista.
 */
export function useInforme(sel: string | null, informeMin: boolean, modoMapa: ModoVista) {
  const informe = useRef<HTMLElement>(null)
  const [anchoInforme, setAnchoInforme] = useState(0)

  const ultimoY = useRef(0)
  useEffect(() => {
    const guardar = () => (ultimoY.current = window.scrollY)
    window.addEventListener('scroll', guardar, { passive: true })
    return () => window.removeEventListener('scroll', guardar)
  }, [])
  useLayoutEffect(() => {
    if (window.scrollY < ultimoY.current - 1) informe.current?.scrollIntoView({ block: 'start' })
  }, [sel])

  useEffect(() => {
    const el = informe.current
    if (!el) return
    const ro = new ResizeObserver(() => setAnchoInforme(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    escenaActiva.current?.setPanel(informeMin ? FRANJA : anchoInforme)
  }, [informeMin, anchoInforme, modoMapa])

  return informe
}
