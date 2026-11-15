import { describe, expect, it } from 'vitest'
import { TEXTOS } from './textos'

describe('avisoFijo (aviso de la API traducido)', () => {
  const { en, es } = TEXTOS

  it('en español no traduce: se muestra el texto de la API', () => {
    expect(es.avisoFijo).toBeNull()
  })

  it('lluvia siempre avisa de IMERG 2014', () => {
    expect(en.avisoFijo!('lluvia', 0.1)).toMatch(/IMERG/)
    expect(en.avisoFijo!('lluvia', 0.1)).not.toMatch(/lag1/)
  })

  it('lag1 > 0.5 añade el aviso de años parecidos, también en temperatura', () => {
    expect(en.avisoFijo!('temperatura', 0.6)).toMatch(/lag1/)
    expect(en.avisoFijo!('lluvia', 0.6)).toMatch(/IMERG.*lag1/)
  })

  it('temperatura con lag1 bajo no tiene aviso', () => {
    expect(en.avisoFijo!('temperatura', 0.5)).toBe('')
    expect(en.avisoFijo!('temperatura', null)).toBe('')
  })
})
