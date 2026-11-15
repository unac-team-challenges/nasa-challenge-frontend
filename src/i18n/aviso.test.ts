import { describe, expect, it } from 'vitest'
import { TEXTOS } from '@/i18n/textos'

describe('avisoFijo (aviso de la API traducido)', () => {
  const { en, es } = TEXTOS
  // Texto de `stats.aviso` de Ucayali en data/zonas/temperatura/25.json del backend (PR #64)
  const ucayali =
    'La subida depende del final de la serie: 2023 y 2024 salieron mucho más calientes (28,2 y 28,5 °C, frente a 25,0–26,7 °C en los años anteriores). Sin esos dos años la subida baja de 0,77 a 0,58 °C por década. Con estos datos no se puede separar calentamiento real, calor extremo de esos años y un cambio en el reanálisis.'

  it('en español no traduce: se muestra el texto de la API', () => {
    expect(es.avisoFijo).toBeNull()
  })

  it('la lluvia principal es POWER: ya no lleva el aviso de IMERG 2014', () => {
    expect(en.avisoFijo!('lluvia', 0.1, '')).toBe('')
  })

  it('lag1 > 0.5 añade el aviso de años parecidos, en las dos variables', () => {
    expect(en.avisoFijo!('temperatura', 0.6, '')).toMatch(/lag1/)
    expect(en.avisoFijo!('lluvia', 0.6, '')).toMatch(/lag1/)
    expect(en.avisoFijo!('lluvia', 0.6, '')).not.toMatch(/IMERG/)
  })

  it('temperatura con lag1 bajo no tiene aviso', () => {
    expect(en.avisoFijo!('temperatura', 0.5, '')).toBe('')
    expect(en.avisoFijo!('temperatura', null, '')).toBe('')
  })

  it('Ucayali: traduce su aviso propio conservando los números del texto', () => {
    const en_ = en.avisoFijo!('temperatura', 0.1, ucayali)
    expect(en_).toContain('2023 and 2024 were much hotter (28.2 and 28.5 °C, versus 25.0–26.7 °C')
    expect(en_).toContain('drops from 0.77 to 0.58 °C per decade')
    expect(en_).not.toMatch(/subida|salieron/)
  })

  it('Ucayali con lag1 alto suma los dos avisos; si el texto cambia, no traduce nada', () => {
    const dos = en.avisoFijo!('temperatura', 0.6, `${ucayali} Años muy parecidos entre sí`)
    expect(dos).toMatch(/2023 and 2024/)
    expect(dos).toMatch(/lag1/)
    expect(en.avisoFijo!('temperatura', 0.1, 'La subida cambió de redacción')).toBe('')
  })
})
