import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderRuta } from '@/testing/render'
import { useApp } from '@/stores/app'

beforeEach(() => useApp.setState({ idioma: 'es', informeMin: false, sinNino: false }))

describe('modo Vegetación del mapa', () => {
  it('el botón Vegetación entra al modo, lo escribe en la URL y quita la máquina del tiempo', async () => {
    const router = renderRuta('/explorar?anio=2017')
    const grupo = await screen.findByRole('group', { name: 'Variable' })
    await userEvent.click(within(grupo).getByRole('button', { name: 'Vegetación' }))
    await waitFor(() => expect(router.state.location.search).toMatchObject({ capa: 'vegetacion' }))
    expect(router.state.location.search).not.toHaveProperty('anio')
    expect(within(grupo).getByRole('button', { name: 'Vegetación' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(grupo).getByRole('button', { name: 'Lluvia' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(
      await screen.findByRole('heading', { name: 'Vegetación medida con satélite' }),
    ).toBeVisible()
    expect(screen.queryByRole('group', { name: /máquina del tiempo/i })).toBeNull()
  })

  it('sin lugar elegido, el informe explica qué se midió y lista los 5 lugares', async () => {
    renderRuta('/explorar?capa=vegetacion')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    expect(
      await within(informe).findByRole('heading', { name: 'Vegetación: 5 lugares medidos' }),
    ).toBeVisible()
    for (const nombre of ['Olmos', 'Chavimochic', 'Ica', 'Iquitos', 'La Pampa'])
      expect(within(informe).getByRole('button', { name: new RegExp(`^${nombre} `) })).toBeVisible()
  })

  it('elegir un lugar abre su antes y después; volver a Lluvia saca del modo', async () => {
    const router = renderRuta('/explorar?capa=vegetacion')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    await userEvent.click(await within(informe).findByRole('button', { name: /^La Pampa / }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/zona/17'))
    expect(
      await within(informe).findByRole('heading', { name: 'Árboles de la selva' }),
    ).toBeVisible()
    const grupo = screen.getByRole('group', { name: 'Variable' })
    await userEvent.click(within(grupo).getByRole('button', { name: 'Lluvia' }))
    await waitFor(() => expect(router.state.location.search).not.toHaveProperty('capa'))
  })

  it('un departamento sin vegetación medida lo dice y ofrece los 5 lugares', async () => {
    renderRuta('/zona/15?capa=vegetacion')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    expect(await within(informe).findByText(/Lima no tiene vegetación medida/)).toBeVisible()
  })
})
