import { describe, expect, it } from 'vitest'
import { margenMapa, type Rect } from '@/utils/margenMapa'

const caja: Rect = { top: 100, bottom: 600, left: 0, right: 400 }
const panel = (top: number, bottom: number, left: number, right: number): Rect => ({
  top,
  bottom,
  left,
  right,
})

describe('margenMapa', () => {
  it('sin paneles no deja margen', () => {
    expect(margenMapa(caja, [])).toEqual({ arriba: 0, abajo: 0 })
  })

  it('un panel arriba suma al margen de arriba, con aire', () => {
    expect(margenMapa(caja, [panel(110, 200, 16, 300)])).toEqual({ arriba: 108, abajo: 0 })
  })

  it('un panel abajo suma al margen de abajo, con aire', () => {
    expect(margenMapa(caja, [panel(540, 590, 100, 380)])).toEqual({ arriba: 0, abajo: 68 })
  })

  it('un panel pegado al borde, fuera de la franja central, no cuenta', () => {
    expect(margenMapa(caja, [panel(110, 250, 330, 390)])).toEqual({ arriba: 0, abajo: 0 })
  })

  it('un panel oculto (sin tamaño) no cuenta', () => {
    expect(margenMapa(caja, [panel(0, 0, 0, 0)])).toEqual({ arriba: 0, abajo: 0 })
  })

  it('toma el panel más profundo de cada lado', () => {
    const m = margenMapa(caja, [panel(110, 160, 10, 390), panel(110, 220, 100, 300)])
    expect(m.arriba).toBe(128)
  })

  it('nunca deja menos del 55 % del alto para el mapa, repartiendo en proporción', () => {
    const m = margenMapa(caja, [panel(100, 400, 0, 400), panel(400, 600, 0, 400)])
    expect(m.arriba + m.abajo).toBeLessThanOrEqual(225)
    expect(m.arriba).toBeGreaterThan(m.abajo)
  })
})
