import { describe, expect, it } from 'vitest'
import { esUbigeo, parseSearch, stringifySearch, validarBusqueda } from '@/lib/busqueda'

describe('validarBusqueda (lo que va en la URL)', () => {
  it('acepta valores válidos', () => {
    expect(validarBusqueda({ variable: 'temperatura', perfil: 'agricultor', anio: 2017 })).toEqual({
      variable: 'temperatura',
      perfil: 'agricultor',
      anio: 2017,
    })
  })
  it('lee los parámetros como texto simple, sin comillas de JSON', () => {
    expect(validarBusqueda(parseSearch('?anio=2017&variable=lluvia&perfil=agricultor'))).toEqual({
      anio: 2017,
      variable: 'lluvia',
      perfil: 'agricultor',
    })
    expect(stringifySearch({ anio: 2017, variable: 'lluvia', perfil: undefined })).toBe(
      '?anio=2017&variable=lluvia',
    )
    expect(stringifySearch({})).toBe('')
  })
  it('sin parámetros no inventa nada (los valores por defecto los pone el hook)', () => {
    expect(validarBusqueda({})).toEqual({})
  })
  it('ignora lo inválido en vez de romper', () => {
    expect(validarBusqueda({ variable: 'viento', perfil: 'rey', anio: 'x' })).toEqual({})
  })
})

describe('esUbigeo (el id de /zona/:id)', () => {
  it('acepta de 01 a 25', () => {
    for (const z of ['01', '09', '10', '15', '25']) expect(esUbigeo(z)).toBe(true)
  })
  it('rechaza lo que no existe', () => {
    for (const z of ['00', '26', '99', '1', '200', 'ab', '']) expect(esUbigeo(z)).toBe(false)
  })
})
