import { describe, expect, it } from 'vitest'
import type { Zona } from '@/data/datos'
import {
  anomalias,
  filasSerie,
  peoresAnios,
  promedio,
  serieCsv,
  iniciosDeRacha,
  escalaTendencia,
  medida,
  aniosMalosPorMitad,
  efectoNino,
  anioNormal,
  m3PorHectarea,
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

describe('etiquetas y escala', () => {
  it('El Niño se etiqueta una vez por racha de años seguidos', () => {
    expect(iniciosDeRacha([1997, 1998, 2015, 2016, 2023])).toEqual([1997, 2015, 2023])
  })

  it('la escala del medidor es el mayor |valor| de las zonas con datos', () => {
    const z = (s: number, a: number, b: number, status = 'real', pct: number | null = null) =>
      ({
        slope_per_decade: s,
        ci_low: a,
        ci_high: b,
        status,
        pct_change_per_decade: pct,
      }) as unknown as Zona
    expect(
      escalaTendencia([z(10, 2, 30), z(-5, -40, 1), z(99, 99, 99, 'pocos_datos')], 'temperatura'),
    ).toBe(40)
    // Lluvia: en % de su promedio; 50 mm con +10 % → el rango 20–80 mm es 4–16 %
    expect(escalaTendencia([z(50, 20, 80, 'real', 10)], 'lluvia')).toBeCloseTo(16)
  })
})

describe('medida del medidor', () => {
  it('lluvia en % del promedio; temperatura tal cual', () => {
    const z = { slope_per_decade: 50, ci_low: 20, ci_high: 80, pct_change_per_decade: 10 }
    expect(medida(z, 'lluvia')).toEqual({ v: 10, lo: 4, hi: 16, pct: true })
    expect(medida(z, 'temperatura')).toEqual({ v: 50, lo: 20, hi: 80, pct: false })
    expect(medida({ ...z, slope_per_decade: 0 }, 'lluvia').pct).toBe(false)
  })
})

describe('ficha del agricultor', () => {
  const serie = (vals: number[]) => vals.map((v, i) => ({ y: 2001 + i, v }))

  it('años secos por mitad: 20 % o más bajo lo normal', () => {
    // promedio 100: 70 y 80 son secos; 90 no
    const r = aniosMalosPorMitad(serie([70, 100, 130, 100, 80, 90, 130, 100]), 'lluvia')!
    expect([r.antes.desde, r.antes.hasta, r.antes.malos]).toEqual([2001, 2004, 1])
    expect([r.ahora.desde, r.ahora.hasta, r.ahora.malos]).toEqual([2005, 2008, 1])
  })

  it('años calurosos: 0,3 °C o más sobre lo normal', () => {
    const r = aniosMalosPorMitad(serie([10, 10, 10, 10, 10.5, 9.5]), 'temperatura')!
    expect(r.ahora.malos).toBe(1)
    expect(r.antes.malos).toBe(0)
  })

  it('El Niño: promedio de la anomalía en sus años', () => {
    const e = efectoNino(serie([100, 200, 100, 0]), 'lluvia', [2002, 2004, 1998])!
    expect(e.anios).toEqual([2002, 2004])
    expect(e.promedio).toBeCloseTo(0) // +100 % y −100 %
    expect(efectoNino(serie([1, 2]), 'lluvia', [1998])).toBeNull()
  })

  it('año normal: promedio y mitad central de los años', () => {
    expect(anioNormal(serie([10, 20, 30, 40, 50]))).toEqual({ promedio: 30, bajo: 20, alto: 40 })
    expect(m3PorHectarea(231)).toBe(2310)
  })
})
