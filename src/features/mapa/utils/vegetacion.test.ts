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

// Chavimochic es un valle de la costa: su esquina suroeste cae unos 9 km mar adentro. Cuadra con
// los datos del backend (data/ndvi.json: 847 de 900 píxeles, el resto es mar enmascarado), así que
// la caja es la medida y esta esquina es la única excepción.
const ESQUINA_EN_EL_MAR: Record<string, string> = { chavimochic: 'SO' }

describe('lugares con vegetación marcados en el mapa', () => {
  it('cada recuadro cae dentro de su departamento (centro y 4 esquinas, salvo la del mar)', () => {
    for (const l of LUGARES_VEGETACION) {
      const dep = DEPARTAMENTOS.find((d) => d.id === l.departamento)!
      const dentroDelDepto = (p: number[]) => dep.polys.some((poly) => dentro(p, poly[0]))
      const [o, s, e, n] = l.caja
      expect(dentroDelDepto([l.lon, l.lat]), `${l.nombre}: centro`).toBe(true)
      const esquinas: [string, number[]][] = [
        ['SO', [o, s]],
        ['NO', [o, n]],
        ['SE', [e, s]],
        ['NE', [e, n]],
      ]
      for (const [nombre, punto] of esquinas)
        expect(dentroDelDepto(punto), `${l.nombre}: esquina ${nombre}`).toBe(
          ESQUINA_EN_EL_MAR[l.id] !== nombre,
        )
    }
  })
})
