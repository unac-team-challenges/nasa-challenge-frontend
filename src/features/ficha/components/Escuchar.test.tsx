import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { Escuchar } from '@/features/ficha/components/Escuchar'

// jsdom no tiene voz: una falsa que guarda cada frase para disparar sus avisos a mano
class Frase {
  text: string
  lang = ''
  rate = 1
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}
let habladas: Frase[] = []

beforeEach(() => {
  habladas = []
  vi.stubGlobal('SpeechSynthesisUtterance', Frase)
  vi.stubGlobal('speechSynthesis', {
    speak: (f: Frase) => habladas.push(f),
    cancel: vi.fn(),
  })
  useApp.setState({ idioma: 'es' })
})
afterEach(() => vi.unstubAllGlobals())

const t = TEXTOS.es
const montar = () =>
  render(
    <div data-ficha>
      <p data-leer>Llueve menos que antes</p>
      <Escuchar />
    </div>,
  )

describe('Escuchar', () => {
  it('lee lo marcado con data-leer y vuelve a «Escuchar» al terminar', async () => {
    montar()
    await userEvent.click(screen.getByRole('button', { name: t.escucharAria }))
    expect(habladas[0].text).toBe('Llueve menos que antes.')
    expect(screen.getByRole('button', { name: t.escucharPararAria })).toBeInTheDocument()
    act(() => habladas[0].onend?.())
    expect(screen.getByRole('button', { name: t.escucharAria })).toBeInTheDocument()
  })

  it('el aviso tardío de una frase cancelada no apaga la que está hablando', async () => {
    montar()
    await userEvent.click(screen.getByRole('button', { name: t.escucharAria }))
    await userEvent.click(screen.getByRole('button', { name: t.escucharPararAria }))
    await userEvent.click(screen.getByRole('button', { name: t.escucharAria }))
    expect(habladas).toHaveLength(2)
    // cancel() hace que la primera avise con onerror, ya cuando habla la segunda
    act(() => habladas[0].onerror?.())
    expect(screen.getByRole('button', { name: t.escucharPararAria })).toBeInTheDocument()
    act(() => habladas[1].onend?.())
    expect(screen.getByRole('button', { name: t.escucharAria })).toBeInTheDocument()
  })
})
