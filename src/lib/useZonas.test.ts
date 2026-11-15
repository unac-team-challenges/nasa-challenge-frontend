import { describe, expect, it } from 'vitest'
import { decidirFuente } from './useZonas'

describe('decidirFuente (una sola vez por sesión)', () => {
  it('en la portada espera a la API', () => {
    expect(decidirFuente(null, 'inicio', true, undefined)).toBeNull()
  })
  it('la API contesta con datos: api; sin datos o con error: local', () => {
    expect(decidirFuente(null, 'inicio', false, { lluvia: {} })).toBe('api')
    expect(decidirFuente(null, 'inicio', false, null)).toBe('local')
  })
  it('entrar al mapa antes de que conteste fija local', () => {
    expect(decidirFuente(null, 'explorar', true, undefined)).toBe('local')
  })
  it('una vez decidida no cambia', () => {
    expect(decidirFuente('local', 'explorar', false, { lluvia: {} })).toBe('local')
    expect(decidirFuente('api', 'inicio', false, null)).toBe('api')
  })
})
