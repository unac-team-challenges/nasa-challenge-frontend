import { describe, expect, it } from 'vitest'
import {
  anomalias,
  filasSerie,
  peoresAnios,
  promedio,
  serieCsv,
} from '@/features/ficha/utils/serie'

const pts = [
  { y: 2001, v: 100 },
  { y: 2002, v: 50 },
  { y: 2003, v: 150 },
  { y: 2004, v: 100 },
]

describe('utilidades de la serie de la ficha', () => {
  it('promedio es «lo normal» de la serie', () => {
    expect(promedio(pts)).toBe(100)
    expect(promedio([])).toBe(0)
  })

  it('la recta de Sen pasa por el promedio en el año central y la banda la contiene', () => {
    const filas = filasSerie(pts, { slope_per_decade: 10, ci_low: 0, ci_high: 20 })
    // año central 2002,5: la recta vale 100 ahí; 1 mm por año
    expect(filas[0].tendencia).toBeCloseTo(98.5)
    expect(filas[3].tendencia).toBeCloseTo(101.5)
    for (const f of filas) {
      expect(f.banda[0]).toBeLessThanOrEqual(f.tendencia)
      expect(f.banda[1]).toBeGreaterThanOrEqual(f.tendencia)
    }
  })

  it('la lluvia se compara en % del promedio; la temperatura en °C', () => {
    expect(anomalias(pts, 'lluvia').map((f) => f.a)).toEqual([0, -50, 50, 0])
    expect(anomalias(pts, 'temperatura').map((f) => f.a)).toEqual([0, -50, 50, 0])
  })

  it('peores años: los más secos para lluvia, los más calurosos para temperatura', () => {
    expect(peoresAnios(pts, 'lluvia', 1)).toEqual([2002])
    expect(peoresAnios(pts, 'temperatura', 1)).toEqual([2003])
  })

  it('CSV con cabecera según la variable', () => {
    expect(serieCsv(pts.slice(0, 1), 'lluvia')).toBe('anio,lluvia_mm\n2001,100')
  })
})
