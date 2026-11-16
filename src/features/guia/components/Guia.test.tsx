import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderRuta } from '@/testing/render'
import { useApp } from '@/stores/app'
import { useGuia } from '@/features/guia/estado'
import { PASOS } from '@/features/guia/pasos'

beforeEach(() => {
  localStorage.clear()
  useGuia.setState({ paso: null })
  useApp.setState({ idioma: 'es', informeMin: true })
})

const titulo = (n: number) => PASOS[n].texto.es.titulo
const dialogo = () => screen.getByRole('dialog')
const boton = (nombre: string) => within(dialogo()).getByRole('button', { name: nombre })
const indice = (pista: string) =>
  PASOS.findIndex((p) =>
    p.ancla?.({ variableLbl: '', perfilLbl: '', timeAria: '' }).includes(pista),
  )

describe('guía de la primera visita', () => {
  it('arranca sola la primera vez y queda marcada como vista (también la pista del tiempo)', async () => {
    renderRuta('/explorar', true)
    expect(await screen.findByRole('dialog', { name: titulo(0) })).toBeVisible()
    expect(localStorage.getItem('guia-vista')).toBe('1')
    expect(localStorage.getItem('ayuda-modo-tiempo')).toBe('1')
  })

  it('no sale si ya se vio', async () => {
    renderRuta('/explorar')
    await screen.findByRole('group', { name: 'Perfil' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Siguiente y Atrás recorren los pasos; el de ejemplo abre Piura y al terminar todo vuelve', async () => {
    const user = userEvent.setup()
    const router = renderRuta('/explorar', true)
    await screen.findByRole('dialog', { name: titulo(0) })

    await user.click(boton('Siguiente'))
    expect(screen.getByRole('dialog', { name: titulo(1) })).toBeVisible()
    await user.click(boton('Atrás'))
    expect(screen.getByRole('dialog', { name: titulo(0) })).toBeVisible()

    const ejemplo = PASOS.findIndex((p) => p.ejemplo)
    for (let i = 0; i < ejemplo; i++) await user.click(boton('Siguiente'))
    expect(screen.getByRole('dialog', { name: titulo(ejemplo) })).toBeVisible()
    await waitFor(() => expect(router.state.location.pathname).toBe('/zona/20'))

    for (let i = ejemplo; i < PASOS.length - 1; i++) await user.click(boton('Siguiente'))
    expect(screen.getByRole('dialog', { name: titulo(PASOS.length - 1) })).toBeVisible()
    await user.click(boton('Listo'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(router.state.location.pathname).toBe('/explorar'))
    expect(useApp.getState().informeMin).toBe(true)
  })

  it('con un departamento ya elegido, el paso de ejemplo no lo cambia ni lo cierra al final', async () => {
    const user = userEvent.setup()
    const router = renderRuta('/zona/08', true)
    await screen.findByRole('dialog', { name: titulo(0) })
    const ejemplo = PASOS.findIndex((p) => p.ejemplo)
    for (let i = 0; i < ejemplo; i++) await user.click(boton('Siguiente'))
    expect(router.state.location.pathname).toBe('/zona/08')
    await user.click(boton('Saltar la guía'))
    expect(router.state.location.pathname).toBe('/zona/08')
  })

  it('en vegetación salta el paso de la barra de tiempo (no existe)', async () => {
    const user = userEvent.setup()
    renderRuta('/explorar?capa=vegetacion', true)
    await screen.findByRole('dialog', { name: titulo(0) })
    const tiempo = indice('tiempo')
    for (let i = 0; i < tiempo; i++) await user.click(boton('Siguiente'))
    expect(screen.getByRole('dialog', { name: titulo(tiempo + 1) })).toBeVisible()
  })

  it('Esc la cierra y el botón «?» la vuelve a abrir desde el primer paso', async () => {
    const user = userEvent.setup()
    renderRuta('/explorar', true)
    await screen.findByRole('dialog', { name: titulo(0) })
    await user.click(boton('Siguiente'))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()

    await user.click(screen.getAllByRole('button', { name: 'Ver la guía' })[0])
    expect(screen.getByRole('dialog', { name: titulo(0) })).toBeVisible()
  })
})
