import { describe, expect, it } from 'vitest'
import { ejeX } from '@/features/ficha/utils/ejes'

describe('ejeX', () => {
  it('serie larga: marcas redondas cada 10 años', () => {
    expect(ejeX(1981, 2024).ticks).toEqual([1990, 2000, 2010, 2020])
  })
  it('serie corta: cada 5 años', () => {
    expect(ejeX(2001, 2024).ticks).toEqual([2005, 2010, 2015, 2020])
  })
})
