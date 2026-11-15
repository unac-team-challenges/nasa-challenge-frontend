import { describe, expect, it } from 'vitest'
import { DEPARTAMENTOS } from '@/data/datos'
import { LUGARES_VEGETACION } from '@/features/mapa/utils/vegetacion'

/** Punto dentro de un anillo [lon, lat] (rayo hacia el este). */
function dentro([x, y]: number[], anillo: number[][]) {
  let si = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) si = !si
  }
  return si
}

describe('lugares con vegetación marcados en el mapa', () => {
  it('cada marca cae dentro de su departamento (tocarla abre esa ficha)', () => {
    for (const l of LUGARES_VEGETACION) {
      const dep = DEPARTAMENTOS.find((d) => d.id === l.departamento)!
      expect(
        dep.polys.some((poly) => dentro([l.lon, l.lat], poly[0])),
        l.nombre,
      ).toBe(true)
    }
  })
})
