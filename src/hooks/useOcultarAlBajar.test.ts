import { describe, expect, it } from 'vitest'
import { ocultaDespues, UMBRAL } from '@/hooks/useOcultarAlBajar'

describe('ocultaDespues', () => {
  it('cerca del tope siempre se ve, aunque se baje', () => {
    expect(ocultaDespues(false, 60, 50, 100)).toBe(false)
    expect(ocultaDespues(true, 100, 5, 100)).toBe(false)
  })

  it('lejos del tope se oculta al bajar y vuelve al subir', () => {
    expect(ocultaDespues(false, 500, 40, 100)).toBe(true)
    expect(ocultaDespues(true, 400, -40, 100)).toBe(false)
  })

  it('un movimiento menor al umbral no cambia el estado', () => {
    expect(ocultaDespues(false, 500, UMBRAL, 100)).toBe(false)
    expect(ocultaDespues(true, 500, -UMBRAL, 100)).toBe(true)
    expect(ocultaDespues(true, 500, 0, 100)).toBe(true)
  })
})
