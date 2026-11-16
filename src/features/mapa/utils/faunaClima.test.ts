import { describe, expect, it } from 'vitest'
import type { Zona } from '@/data/datos'
import { FAUNA_TEXTOS } from '@/i18n/textos'
import { lineaClima } from '@/features/mapa/utils/faunaClima'

const zona = (extra: Partial<Zona> = {}): Zona => ({
  id: '17',
  celdas: 4,
  n_years: 24,
  status: 'real',
  motivo: '',
  slope_per_decade: -44,
  ci_low: -80,
  ci_high: -10,
  intercept: null,
  pct_change_per_decade: null,
  p_value: 0.01,
  q_value: 0.02,
  lag1: null,
  year_start: 2001,
  year_end: 2024,
  ...extra,
})

describe('lineaClima', () => {
  it('sin datos de la zona no dice nada', () => {
    expect(lineaClima('17', undefined, 'lluvia', 'es', null)).toBeNull()
  })

  it('tendencia por década con su estado', () => {
    const real = lineaClima('17', zona(), 'lluvia', 'es', null)
    expect(real).toContain('Madre de Dios')
    expect(real).toContain('−44 mm por década')
    expect(real).toContain('Es un cambio real')
    const duda = lineaClima('17', zona({ status: 'posible_casualidad' }), 'lluvia', 'es', null)
    expect(duda).toContain('Puede ser casualidad')
  })

  it('con un año elegido da la anomalía de ese año', () => {
    const t = lineaClima('17', zona(), 'lluvia', 'es', { numero: 2015, valor: 0.35 })
    expect(t).toBe('En 2015, la lluvia de Madre de Dios fue +35 % frente a su promedio.')
  })

  it('pocos datos: no saca conclusiones', () => {
    expect(lineaClima('17', zona({ status: 'pocos_datos' }), 'temperatura', 'en', null)).toContain(
      'no conclusion',
    )
  })

  it('variable Vegetación fuera del modo Vegetación: nombra el verdor, no la temperatura', () => {
    const z = zona({ slope_per_decade: 0.01 })
    const es = lineaClima('17', z, 'vegetacion', 'es', null)
    expect(es).toContain('el verdor (NDVI) de Madre de Dios')
    expect(es).not.toContain('temperatura')
    const en = lineaClima('17', z, 'vegetacion', 'en', { numero: 2015, valor: 0.02 })
    expect(en).toContain("Madre de Dios's greenness (NDVI) was")
    expect(en).not.toContain('temperature')
  })

  it('modo Vegetación: habla del verdor, no de la lluvia', () => {
    const t = lineaClima('17', zona(), 'lluvia', 'es', null, 0.74)
    expect(t).toBe('Datos de la NASA: el verdor (NDVI) de Madre de Dios es 0,74: bosque denso.')
    expect(lineaClima('17', zona(), 'lluvia', 'es', null, null)).toBeNull()
  })
})

describe('FAUNA_TEXTOS', () => {
  it('cada especie tiene nombre y dato en español e inglés', () => {
    const es = Object.keys(FAUNA_TEXTOS.es)
    expect(Object.keys(FAUNA_TEXTOS.en).sort()).toEqual(es.sort())
    for (const k of es) for (const i of ['es', 'en'] as const) expect(FAUNA_TEXTOS[i][k]).toHaveLength(2)
  })
})
