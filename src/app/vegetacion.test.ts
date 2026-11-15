import { describe, expect, it } from 'vitest'
import { VALLES } from '@/features/ficha/data/caso2'
import { SELVA } from '@/features/ficha/data/selva'
import { LUGARES_VEGETACION } from '@/features/mapa/utils/vegetacion'

// En app porque cruza dos features: los recuadros del mapa y las fichas que abren
describe('recuadros de vegetación del mapa y fichas', () => {
  it('cada recuadro tiene su ficha (Caso 2 o selva) y cada ficha su recuadro', () => {
    const conFicha = [...Object.keys(VALLES), ...Object.keys(SELVA)].sort()
    expect(LUGARES_VEGETACION.map((l) => l.departamento).sort()).toEqual(conFicha)
  })

  it('el color de cada recuadro dice lo mismo que su ficha', () => {
    for (const l of LUGARES_VEGETACION) {
      const valle = VALLES[l.departamento]
      const selva = SELVA[l.departamento]
      // Caso 2: el NDVI sube en los 3 valles. Selva: con rango probable sin 0, sube o baja; si no, igual
      const esperado = valle
        ? valle.sen > 0
          ? 'sube'
          : 'baja'
        : selva.ciLow > 0
          ? 'sube'
          : selva.ciHigh < 0
            ? 'baja'
            : 'igual'
      expect(l.tendencia, l.nombre).toBe(esperado)
    }
  })
})
