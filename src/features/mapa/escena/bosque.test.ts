import { describe, expect, it } from 'vitest'
import { DEPARTAMENTOS } from '@/data/datos'
import { azar, crearLocalizador, especieDe, regionDe } from '@/features/mapa/escena/bosque'

describe('bosque del modo Vegetación', () => {
  it('cada zona tiene sus plantas', () => {
    expect(especieDe(-75.7, -14.0, 0.04, 400)).toBeNull() // desierto de Ica: suelo desnudo
    expect(especieDe(-75.7, -14.0, 0.35, 400)).toBe('cultivo') // valle regado de Ica
    expect(especieDe(-80.4, -4.5, 0.4, 100)).toBe('algarrobo') // bosque seco de Piura
    expect(especieDe(-75.8, -14.1, 0.18, 300)).toBe('huarango') // costa sur
    expect(especieDe(-73.3, -3.8, 0.85, 120)).toBe('selva') // Iquitos
    expect(especieDe(-72.0, -13.5, 0.3, 2600)).toBe('molle') // valle andino
    expect(especieDe(-70.0, -15.5, 0.25, 3900)).toBe('ichu') // puna de Puno
    expect(especieDe(-72.5, -13.2, 0.55, 3800)).toBe('quenua')
  })

  it('las 3 regiones salen de la altitud y del lado de los Andes', () => {
    expect(regionDe(-77.0, -12.0, 150, 0.1)).toBe('costa') // Lima
    expect(regionDe(-71.97, -13.52, 3400, 0.4)).toBe('sierra') // Cusco
    expect(regionDe(-73.25, -3.75, 110, 0.85)).toBe('selva') // Iquitos
    expect(regionDe(-76.3, -10.0, 2500, 0.7)).toBe('selva') // ceja de selva, bosque
    expect(regionDe(-76.3, -10.0, 2500, 0.4)).toBe('sierra')
  })

  it('ubica un punto en su departamento', () => {
    const k = crearLocalizador()
    expect(DEPARTAMENTOS[k(-77.03, -12.05)]?.id).toBe('15') // Lima
    expect(DEPARTAMENTOS[k(-71.97, -13.52)]?.id).toBe('08') // Cusco
    expect(k(-85, -10)).toBe(-1) // en el mar
  })

  it('el bosque sale igual en cada visita', () => {
    const a = azar(2001)
    const b = azar(2001)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})
