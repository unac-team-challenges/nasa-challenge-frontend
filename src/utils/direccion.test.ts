import { describe, expect, it } from 'vitest'
import { claveMapa, colorDireccion } from '@/utils/direccion'
import { fmtValor } from '@/utils/formato'

describe('dirección del color', () => {
  it('vegetación: verde si reverdece, ocre si pierde verde', () => {
    expect(claveMapa(0.01, 'vegetacion')).toBe('green')
    expect(claveMapa(-0.01, 'vegetacion')).toBe('down')
    expect(colorDireccion(0.01, 'vegetacion')).toBe('--green')
  })
  it('lluvia y temperatura no cambian', () => {
    expect(claveMapa(1, 'lluvia')).toBe('up')
    expect(claveMapa(1, 'temperatura')).toBe('down')
    expect(colorDireccion(-1, 'temperatura')).toBe('--up')
  })
  it('el NDVI se escribe con 3 decimales', () => {
    expect(fmtValor(0.0123, 'vegetacion', 'es')).toBe('+0,012 NDVI')
    expect(fmtValor(-0.004, 'vegetacion', 'en')).toBe('−0.004 NDVI')
  })
})
