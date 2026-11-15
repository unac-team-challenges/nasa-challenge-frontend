import { describe, expect, it } from 'vitest'
import { VALLES } from '@/features/ficha/data/caso2'
import { SELVA } from '@/features/ficha/data/selva'
import { LUGARES_VEGETACION } from '@/features/mapa/utils/vegetacion'

// En app porque cruza dos features: las marcas del mapa y las fichas que abren
describe('marcas de vegetación del mapa y fichas', () => {
  it('cada marca tiene su ficha (Caso 2 o selva) y cada ficha su marca', () => {
    const conFicha = [...Object.keys(VALLES), ...Object.keys(SELVA)].sort()
    expect(LUGARES_VEGETACION.map((l) => l.departamento).sort()).toEqual(conFicha)
  })
})
