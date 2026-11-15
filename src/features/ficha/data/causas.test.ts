import { describe, expect, it } from 'vitest'
import { CAUSAS_TEXTOS } from '@/i18n/textos'
import { CAUSA_VERDE, ENTRADAS, FUENTES, entradasPara } from '@/features/ficha/data/causas'

describe('causas y consecuencias', () => {
  it('cada entrada tiene fuente y texto en los dos idiomas y perfiles', () => {
    for (const e of ENTRADAS) {
      expect(e.fuentes.length).toBeGreaterThan(0)
      for (const f of e.fuentes) expect(FUENTES[f].url).toMatch(/^https:\/\//)
      for (const idioma of ['es', 'en'] as const) {
        expect(CAUSAS_TEXTOS[idioma][e.id]?.campo).toBeTruthy()
        expect(CAUSAS_TEXTOS[idioma][e.id]?.estudiante).toBeTruthy()
      }
    }
    for (const ids of Object.values(CAUSA_VERDE)) expect(ids.length).toBeGreaterThan(0)
  })

  it('Piura (lluvia): El Niño en la costa norte y sus inundaciones', () => {
    expect(entradasPara('20', 'lluvia', true, true).map((e) => e.id)).toEqual([
      'ninoNorte',
      'inundaciones',
    ])
  })

  it('Puno (temperatura que sube): calentamiento y glaciares', () => {
    expect(entradasPara('21', 'temperatura', true, true).map((e) => e.id)).toEqual([
      'calentamientoAndes',
      'calentamientoRegion',
      'glaciares',
      'cultivosCalor',
    ])
  })

  it('lo que depende del sentido no sale si la tendencia va al revés', () => {
    expect(entradasPara('21', 'temperatura', false, true)).toEqual([])
    expect(entradasPara('16', 'lluvia', true, true).map((e) => e.id)).not.toContain('bosque')
    expect(entradasPara('16', 'lluvia', false, true).map((e) => e.id)).toContain('bosque')
  })

  it('si el cambio puede ser casualidad, solo queda el contexto sin sentido', () => {
    expect(entradasPara('16', 'lluvia', false, false).map((e) => e.id)).not.toContain('bosque')
    expect(entradasPara('16', 'lluvia', false, false).map((e) => e.id)).not.toContain('menosAgua')
    expect(entradasPara('21', 'temperatura', true, false)).toEqual([])
    expect(entradasPara('20', 'lluvia', true, false).map((e) => e.id)).toEqual([
      'ninoNorte',
      'inundaciones',
    ])
  })

  it('las referencias APA no abrevian autores con «et al.» y llevan enlace', () => {
    for (const f of Object.values(FUENTES)) {
      expect(f.apa).not.toMatch(/\bet al\./)
      expect(f.apa).toMatch(/\(\d{4}\)/)
    }
  })
})
