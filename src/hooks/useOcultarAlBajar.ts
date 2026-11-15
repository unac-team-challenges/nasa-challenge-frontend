import { useEffect, useRef, useState, type RefObject } from 'react'

/** Desplazamiento mínimo (px) para decidir una dirección: evita parpadear con temblores del dedo. */
export const UMBRAL = 8

/**
 * Si la barra debe estar oculta. Siempre se ve cerca del tope de la página (`alto` es lo que mide);
 * lejos de él se oculta al bajar y vuelve al subir. Un movimiento menor al umbral no cambia nada.
 */
export function ocultaDespues(oculta: boolean, y: number, delta: number, alto: number) {
  if (y <= alto) return false
  if (delta > UMBRAL) return true
  if (delta < -UMBRAL) return false
  return oculta
}

/**
 * Oculta una barra fija al bajar y la devuelve al subir, solo mientras la consulta `mq` se cumple.
 * Una barra con el foco dentro no se oculta (lo resuelve el CSS con `focus-within`).
 */
export function useOcultarAlBajar(barra: RefObject<HTMLElement | null>, mq: string) {
  const [oculta, setOculta] = useState(false)
  const ultima = useRef(0)

  useEffect(() => {
    const consulta = matchMedia(mq)
    let cuadro = 0
    const alVer = () => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => {
        const y = Math.max(0, scrollY)
        const delta = y - ultima.current
        const alto = barra.current?.offsetHeight ?? 0
        // Los movimientos chicos se acumulan: la referencia solo avanza al pasar el umbral
        if (Math.abs(delta) >= UMBRAL || y <= alto) ultima.current = y
        setOculta((o) => ocultaDespues(o, y, delta, alto))
      })
    }
    const activar = () => {
      removeEventListener('scroll', alVer)
      if (consulta.matches) {
        ultima.current = scrollY
        addEventListener('scroll', alVer, { passive: true })
      } else setOculta(false)
    }
    activar()
    consulta.addEventListener('change', activar)
    return () => {
      cancelAnimationFrame(cuadro)
      removeEventListener('scroll', alVer)
      consulta.removeEventListener('change', activar)
    }
  }, [barra, mq])

  return oculta
}
