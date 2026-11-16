import { describe, expect, it } from 'vitest'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'

describe('idioma', () => {
  it('el inglés viaja en el código y el español queda cargado por setup', () => {
    expect(TEXTOS.en.marca).toBe('Peru Trend Detective')
    expect(TEXTOS.es.marca).toBe('Detective del Perú')
  })

  it('si se pide otro idioma antes de que termine el anterior, gana el último', async () => {
    useApp.getState().setIdioma('es')
    useApp.getState().setIdioma('en')
    await new Promise((r) => setTimeout(r, 0))
    expect(useApp.getState().idioma).toBe('en')
  })
})
