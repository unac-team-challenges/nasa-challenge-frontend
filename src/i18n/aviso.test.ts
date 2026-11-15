import { describe, expect, it } from 'vitest'
import { TEXTOS } from '@/i18n/textos'

describe('avisoFijo (aviso de la API traducido)', () => {
  const { en, es } = TEXTOS

  it('en español no traduce: se muestra el texto de la API', () => {
    expect(es.avisoFijo).toBeNull()
  })

  it('la lluvia principal es POWER: ya no lleva el aviso de IMERG 2014', () => {
    expect(en.avisoFijo!('lluvia', 0.1)).toBe('')
  })

  it('lag1 > 0.5 añade el aviso de años parecidos, en las dos variables', () => {
    expect(en.avisoFijo!('temperatura', 0.6)).toMatch(/lag1/)
    expect(en.avisoFijo!('lluvia', 0.6)).toMatch(/lag1/)
    expect(en.avisoFijo!('lluvia', 0.6)).not.toMatch(/IMERG/)
  })

  it('temperatura con lag1 bajo no tiene aviso', () => {
    expect(en.avisoFijo!('temperatura', 0.5)).toBe('')
    expect(en.avisoFijo!('temperatura', null)).toBe('')
  })
})
