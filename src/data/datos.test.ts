import { describe, expect, it } from 'vitest'
import { anomaliasAnio, anomaliasPeru, ninoEn, PERIODOS, serie } from '@/data/datos'

const API = { year_start: 2001, year_end: 2024 }

describe('datos locales por rango', () => {
  it('las franjas cubren el rango pedido y su promedio sale de ese rango', () => {
    const largo = anomaliasPeru('lluvia', 'largo', PERIODOS.largo)
    const corto = anomaliasPeru('lluvia', 'largo', API)
    expect(largo.filas[0].y).toBe(1981)
    expect(corto.filas.map((f) => f.y)).toEqual(Array.from({ length: 24 }, (_, i) => 2001 + i))
    // Otro promedio de referencia: la anomalía de 2010 cambia
    const a2010 = (f: typeof largo) => f.filas.find((x) => x.y === 2010)!.a
    expect(a2010(corto)).not.toBeCloseTo(a2010(largo), 6)
  })

  it('los años sin datos en la copia local no se pintan', () => {
    const { filas } = anomaliasPeru('lluvia', 'largo', { year_start: 2020, year_end: 2030 })
    expect(filas.map((f) => f.y)).toEqual([2020, 2021, 2022, 2023, 2024])
  })

  it('la máquina del tiempo guarda en caché por rango', () => {
    const a = anomaliasAnio('temperatura', 'largo', API)
    expect(anomaliasAnio('temperatura', 'largo', { ...API })).toBe(a)
    expect(anomaliasAnio('temperatura', 'largo', PERIODOS.largo)).not.toBe(a)
    expect(Math.min(...Object.keys(a.porId['20']).map(Number))).toBe(2001)
  })

  it('El Niño y la serie se recortan al rango', () => {
    expect(ninoEn(API)).toEqual([2016, 2017, 2023])
    expect(ninoEn(PERIODOS.largo)).toEqual([1983, 1998, 2016, 2017, 2023])
    const s = serie('20', 'lluvia', API, true)
    expect(s[0].y).toBe(2001)
    expect(s.some((p) => p.y === 2016)).toBe(false)
  })
})
