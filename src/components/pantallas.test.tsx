import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NOMBRE } from '@/data/datos'
import { renderRuta } from '@/test/render'
import { useApp } from '@/store'
import { ErrorSerie } from '@/components/Errores'
import { FichaSkeleton } from '@/components/Esperas'
import { render } from '@testing-library/react'

beforeEach(() => {
  // El informe abierto, en español y sin tema forzado, como al entrar con una zona en la URL
  useApp.setState({ idioma: 'es', informeMin: false, sinNino: false })
})

describe('explorador con la URL', () => {
  it('/zona/20?perfil=agricultor abre la ficha de Piura con el perfil elegido', async () => {
    renderRuta('/zona/20?perfil=agricultor')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    expect(
      await within(informe).findByRole('heading', { level: 2, name: NOMBRE['20'] }),
    ).toBeVisible()
    expect(screen.getByLabelText('Perfil')).toHaveValue('agricultor')
  })

  it('cambiar la variable escribe en la URL y marca el botón', async () => {
    const router = renderRuta('/explorar')
    const grupo = await screen.findByRole('group', { name: 'Variable' })
    await userEvent.click(within(grupo).getByRole('button', { name: 'Temperatura' }))
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ variable: 'temperatura' }),
    )
    expect(within(grupo).getByRole('button', { name: 'Temperatura' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('tocar un departamento en el mapa 2D lleva a su /zona/:id', async () => {
    const router = renderRuta('/explorar')
    const mapa = await screen.findByRole('group', { name: 'Mapa del Perú en 2D' })
    await userEvent.click(within(mapa).getByRole('button', { name: /^Amazonas/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/zona/01'))
  })
})

describe('otras rutas', () => {
  it('/metodologia muestra fuentes, método y créditos', async () => {
    renderRuta('/metodologia')
    expect(await screen.findByRole('heading', { level: 1, name: /Metodología/ })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'De dónde salen los datos' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Créditos' })).toBeVisible()
  })

  it('una ruta que no existe muestra el aviso con salida al inicio', async () => {
    renderRuta('/no-existe')
    expect(await screen.findByText('Esta página no existe')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/')
  })

  it('/zona/99 no es un departamento: mismo aviso', async () => {
    renderRuta('/zona/99')
    expect(await screen.findByText('Esta página no existe')).toBeVisible()
  })
})

describe('esperas y errores', () => {
  it('el esqueleto de la ficha avisa "Cargando…" a los lectores de pantalla', () => {
    render(<FichaSkeleton />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…')
  })

  it('el error de la serie ofrece reintentar', async () => {
    const reintentar = vi.fn()
    render(<ErrorSerie reintentar={reintentar} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar la serie de años')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reintentar).toHaveBeenCalledOnce()
  })
})
