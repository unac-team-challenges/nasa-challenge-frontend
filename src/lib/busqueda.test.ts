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
  it('lee el idioma de la URL y ignora lo inválido', () => {
    expect(validarBusqueda({ lang: 'en' })).toEqual({ lang: 'en' })
    expect(validarBusqueda({ lang: 'fr' })).toEqual({})
  })
  it('periodo y «sin El Niño» van en la URL; lo inválido se ignora', () => {
    expect(validarBusqueda(parseSearch('?periodo=largo&sinnino=1'))).toEqual({
      periodo: 'largo',
      sinnino: '1',
    })
    expect(validarBusqueda({ periodo: '1990', sinnino: '0' })).toEqual({})
  })
  it('sin parámetros no inventa nada (los valores por defecto los pone el hook)', () => {
    expect(validarBusqueda({})).toEqual({})
  })
  it('ignora lo inválido en vez de romper', () => {
    expect(validarBusqueda({ variable: 'viento', perfil: 'rey', anio: 'x' })).toEqual({})
  })
  it('un enlace viejo de «Lugares medidos» (?capa=vegetacion) abre la variable Vegetación', () => {
    expect(validarBusqueda(parseSearch('?capa=vegetacion&variable=lluvia&anio=2017'))).toEqual({
      variable: 'vegetacion',
      anio: 2017,
    })
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
