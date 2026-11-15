import { describe, expect, it } from 'vitest'
import {
  lutRampa,
  percentil,
  prepararCalor,
  rellenarBordes,
  tieneAnio,
  valoresAnio,
} from '@/features/mapa/utils/calor'
import malla from '@/data/celdas_temperatura.json'

// 2 × 2 celdas, falta la del sureste
const chica = {
  fuente: 'x',
  unidad: '°C',
  dlat: 0.5,
  dlon: 0.625,
  anio_inicio: 2001,
  anio_fin: 2002,
  celdas: [
    { lat: -1, lon: -80, t2m: [20, 22] },
    { lat: -1, lon: -79.375, t2m: [10, null] },
    { lat: -1.5, lon: -80, t2m: [5, 7] },
  ],
}

describe('calor', () => {
  it('ubica cada celda en su píxel con el norte arriba', () => {
    const c = prepararCalor(chica)
    expect([c.w, c.h]).toEqual([2, 2])
    expect(Array.from(c.pix)).toEqual([0, 1, 2])
    expect(c.lonMin).toBeCloseTo(-80.3125)
    expect(c.latMin).toBeCloseTo(-1.75)
    expect(c.spanLat).toBe(1)
  })

  it('media ignora años sin dato; el año da su valor o NaN', () => {
    const c = prepararCalor(chica)
    expect(Array.from(c.media)).toEqual([21, 10, 6])
    expect(Array.from(valoresAnio(c, 2002)).map((v) => (Number.isNaN(v) ? null : v))).toEqual([
      22,
      null,
      7,
    ])
    expect([tieneAnio(c, 2002), tieneAnio(c, 2003), tieneAnio(c, null)]).toEqual([
      true,
      false,
      true,
    ])
  })

  it('rellena el borde con la media de los vecinos, sin tocar los datos', () => {
    const campo = Float32Array.from([1, 3, 5, NaN])
    rellenarBordes(campo, 2, 2)
    expect(Array.from(campo)).toEqual([1, 3, 5, 3])
    // Lejos del dato también se llena (las paredes 3D leen el borde): nada queda vacío
    const lejos = new Float32Array(25).fill(NaN)
    lejos[0] = 7
    rellenarBordes(lejos, 5, 5)
    expect(Array.from(lejos).every((v) => v === 7)).toBe(true)
    const vacio = new Float32Array(4).fill(NaN)
    rellenarBordes(vacio, 2, 2) // sin datos: termina sin colgarse
  })

  it('percentil ignora NaN y la rampa respeta sus extremos', () => {
    expect(percentil([NaN, 1, 2, 3, 4], 0.5)).toBe(3)
    const lut = lutRampa(['#000000', '#ff0000', '#ffffff'])
    expect(Array.from(lut.subarray(0, 3))).toEqual([0, 0, 0])
    expect(Array.from(lut.subarray(255 * 3))).toEqual([255, 255, 255])
  })

  it('la malla real cubre Perú con valores físicos', () => {
    const c = prepararCalor(malla)
    expect(c.pix.length).toBeGreaterThan(300)
    expect(new Set(c.pix).size).toBe(c.pix.length) // una celda por píxel
    expect(c.min).toBeGreaterThan(-5)
    expect(c.max).toBeLessThan(30)
  })
})
