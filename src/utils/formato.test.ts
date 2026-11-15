import { describe, expect, it } from 'vitest'
import { fmtAnomalia, fmtPct, fmtValor } from '@/utils/formato'

describe('formato con signo', () => {
  it('un valor que redondea a cero no lleva signo', () => {
    expect(fmtValor(-0.2, 'lluvia', 'es')).toBe('0 mm')
    expect(fmtValor(-0.001, 'temperatura', 'es')).toBe('0,00 °C')
    expect(fmtPct(-0.4)).toBe('0 %')
    expect(fmtAnomalia(-0.001, 'lluvia', 'es')).toBe('0 %')
  })

  it('conserva el signo cuando hay cambio', () => {
    expect(fmtValor(-44.4, 'lluvia', 'es')).toBe('−44 mm')
    expect(fmtValor(0.214, 'temperatura', 'es')).toBe('+0,21 °C')
    expect(fmtPct(14.2)).toBe('+14 %')
  })
})
