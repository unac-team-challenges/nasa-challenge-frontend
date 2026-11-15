import { describe, expect, it } from 'vitest'
import type { Zona } from '@/data/datos'
import {
  cambioEnPeriodo,
  cifraCampo,
  fraccion,
  listaAnios,
  metrosEquivalentes,
  miles,
  titularCampo,
} from '@/features/ficha/utils/campo'

const zona = (z: Partial<Zona>): Zona => ({
  id: '20',
  celdas: 10,
  n_years: 24,
  status: 'real',
  motivo: '',
  slope_per_decade: -44,
  ci_low: -73,
  ci_high: -13,
  intercept: null,
  pct_change_per_decade: -8.4,
  p_value: 0.01,
  q_value: 0.02,
  lag1: 0.1,
  year_start: 2001,
  year_end: 2024,
  ...z,
})

describe('cifraCampo', () => {
  it('lluvia: porcentaje del promedio, sin signo', () => {
    expect(cifraCampo(zona({}), 'lluvia', 'es')).toBe('8 %')
    expect(cifraCampo(zona({ pct_change_per_decade: 8.4 }), 'lluvia', 'es')).toBe('8 %')
  })

  it('lluvia sin porcentaje: cae a los mm', () => {
    expect(cifraCampo(zona({ pct_change_per_decade: null }), 'lluvia', 'es')).toBe('44 mm')
  })

  it('temperatura: °C con la coma del idioma, sin signo', () => {
    const z = zona({ slope_per_decade: -0.214 })
    expect(cifraCampo(z, 'temperatura', 'es')).toBe('0,21 °C')
    expect(cifraCampo(z, 'temperatura', 'en')).toBe('0.21 °C')
  })
})

describe('listaAnios', () => {
  it('une con «y» / «and»', () => {
    expect(listaAnios([2016, 2017, 2023], 'es')).toBe('2016, 2017 y 2023')
    expect(listaAnios([2016, 2017, 2023], 'en')).toBe('2016, 2017 and 2023')
    expect(listaAnios([2016, 2023], 'es')).toBe('2016 y 2023')
  })

  it('uno o ninguno: sin conector', () => {
    expect(listaAnios([2017], 'es')).toBe('2017')
    expect(listaAnios([], 'es')).toBe('')
  })
})

describe('miles', () => {
  it('separador de miles del idioma, sin decimales', () => {
    expect(miles(2310.4, 'en').replace(/\s/g, '')).toBe('2,310')
    expect(miles(2310.4, 'es')).toMatch(/^2\D?310$/)
    expect(miles(12, 'es')).toBe('12')
    // Punto de miles, como la coma decimal del resto de la app; nunca «18,900»
    expect(miles(18900, 'es')).toBe('18.900')
  })
})

describe('fraccion', () => {
  it('cambios chicos en palabras', () => {
    expect(fraccion(-1)).toBe('igual')
    expect(fraccion(3)).toBe('poquito')
    expect(fraccion(-10)).toBe('poco')
    expect(fraccion(-19)).toBe('quinto')
    expect(fraccion(25)).toBe('cuarto')
    expect(fraccion(-33)).toBe('tercio')
    expect(fraccion(50)).toBe('mitad')
  })
  it('hacia abajo no pasa de «menos de la mitad»; hacia arriba llega al doble y al triple', () => {
    expect(fraccion(-70)).toBe('masMitad')
    expect(fraccion(81)).toBe('casiDoble')
    expect(fraccion(100)).toBe('doble')
    expect(fraccion(150)).toBe('masDoble')
    expect(fraccion(200)).toBe('triple')
    expect(fraccion(300)).toBe('masTriple')
  })
})

describe('cambioEnPeriodo y metrosEquivalentes', () => {
  it('la pendiente por década por las décadas del periodo', () => {
    expect(cambioEnPeriodo(-8, 2001, 2024)).toBeCloseTo(-18.4)
  })
  it('grados en metros de altura, redondeado a decenas', () => {
    expect(metrosEquivalentes(0.5)).toBe(80) // 76,9 m
    expect(metrosEquivalentes(-1.1)).toBe(170)
  })
})

describe('titularCampo', () => {
  const rango = { year_start: 2001, year_end: 2024 }
  it('lluvia con cambio claro: cuánto cambió en todo el periodo, en palabras', () => {
    const r = titularCampo(zona({ pct_change_per_decade: -8.4 }), 'lluvia', rango, 'es')
    expect(r.titular).toBe('Desde 2001, llueve como un quinto menos que antes')
    expect(r.debajo).toBe('Son unos 8 % menos cada 10 años, de 2001 a 2024.')
    expect(r.metros).toBeNull()
  })
  it('calor con cambio claro: grados del periodo y metros de altura', () => {
    const r = titularCampo(zona({ slope_per_decade: 0.5 }), 'temperatura', rango, 'es')
    expect(r.titular).toBe('Desde 2001, hace como 1,1 °C más de calor') // 0,5 × 2,3 décadas
    expect(r.metros).toBe(180)
  })
  it('verdor: en palabras frente a su verdor promedio, sin metros', () => {
    // NDVI promedio 0,5 (recta de Sen en 2012,5); +0,02 por década → +0,046 en el periodo ≈ 9 %
    const d = zona({ slope_per_decade: 0.02, intercept: 0.5 - 0.002 * 2012.5 })
    const r = titularCampo(d, 'vegetacion', rango, 'es')
    expect(r.titular).toBe('Desde 2001, el campo está un poco más verde que antes')
    expect(r.debajo).toBe('El verdor (NDVI) sube unos 0,020 cada 10 años, de 2001 a 2024.')
    expect(r.metros).toBeNull()
  })
  it('sin cambio claro no afirma nada', () => {
    const r = titularCampo(zona({ status: 'posible_casualidad' }), 'lluvia', rango, 'es')
    expect(r.titular).toBe('No se ve un cambio claro en la lluvia')
    expect(r.debajo).toBe('Comparando los años de 2001 a 2024')
    expect(r.metros).toBeNull()
  })
})
