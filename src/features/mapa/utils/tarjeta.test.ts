import { describe, expect, it } from 'vitest'
import type { Zona } from '@/data/datos'
import { datosTarjeta } from '@/features/mapa/utils/tarjeta'

const zona = (z: Partial<Zona>): Zona => ({
  id: '20',
  celdas: 30,
  n_years: 44,
  status: 'real',
  motivo: '',
  slope_per_decade: -44,
  ci_low: -73,
  ci_high: -13,
  pct_change_per_decade: -10,
  p_value: 0.01,
  q_value: 0.024,
  lag1: 0.1,
  year_start: 1981,
  year_end: 2024,
  ...z,
})

describe('datosTarjeta', () => {
  it('cambio real: rango probable entero de un lado del cero', () => {
    const c = datosTarjeta(zona({}), 'lluvia', 'es', undefined)
    expect(c.valor).toBe('−44 mm')
    expect(c.ic).not.toBeNull()
    const izq = parseFloat(c.ic!.left)
    expect(izq + parseFloat(c.ic!.width)).toBeLessThan(50) // todo a la izquierda del cero (50 %)
    expect(c.meta).toContain('q = 0,024')
  })

  it('posible casualidad: la barra cruza el cero', () => {
    const c = datosTarjeta(
      zona({ status: 'posible_casualidad', slope_per_decade: 17, ci_low: -17, ci_high: 49 }),
      'lluvia',
      'es',
      undefined,
    )
    const izq = parseFloat(c.ic!.left)
    expect(izq).toBeLessThan(50)
    expect(izq + parseFloat(c.ic!.width)).toBeGreaterThan(50)
  })

  it('máquina del tiempo: anomalía del año y sin barra', () => {
    const c = datosTarjeta(zona({}), 'lluvia', 'es', 0.35)
    expect(c.valor).toBe('+35 %')
    expect(c.ic).toBeNull()
  })

  it('pocos datos: sin valor ni barra', () => {
    const c = datosTarjeta(zona({ status: 'pocos_datos' }), 'temperatura', 'en', undefined)
    expect(c.valor).toBe('—')
    expect(c.ic).toBeNull()
    expect(c.meta).toBe('44 years')
  })
})
