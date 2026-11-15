import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NOMBRE } from '@/data/datos'
import { SECCIONES_METODOLOGIA } from '@/i18n/textos'
import { renderRuta } from '@/testing/render'
import { useApp } from '@/stores/app'
import { ErrorSerie } from '@/components/Errores'
import { FichaSkeleton } from '@/components/Esperas'
import { render } from '@testing-library/react'

beforeEach(() => {
  // El informe abierto, en español y sin tema forzado, como al entrar con una zona en la URL
  useApp.setState({ idioma: 'es', informeMin: false })
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

  it('el agricultor ve años secos, El Niño, año normal y dónde seguir, sin fuentes ni WhatsApp', async () => {
    renderRuta('/zona/20?perfil=agricultor')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    for (const h of [
      '¿Los años secos vienen más seguido?',
      '¿Qué trae El Niño aquí?',
      'Un año normal aquí',
      'Posibles causas y consecuencias',
      'Dónde seguir',
    ])
      expect(await within(informe).findByRole('heading', { name: h })).toBeVisible()
    // Sin «¿Coinciden dos fuentes?» ni botón de WhatsApp: el agricultor no los necesita
    expect(
      within(informe).queryByRole('heading', { name: '¿Coinciden dos fuentes de NASA?' }),
    ).toBeNull()
    expect(within(informe).queryByRole('link', { name: /WhatsApp/ })).toBeNull()
  })

  it('si el cambio puede ser casualidad, el titular del agricultor no afirma una dirección', async () => {
    renderRuta('/zona/20?perfil=agricultor')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    expect(await within(informe).findByText('No se ve un cambio claro en la lluvia')).toBeVisible()
    expect(within(informe).queryByText(/Cada 10 años llueve/)).toBeNull()
    expect(within(informe).queryByText('Seguro')).toBeNull()
  })

  it('las causas con sentido no salen si el cambio puede ser casualidad (Amazonas, lluvia)', async () => {
    renderRuta('/zona/01?perfil=agricultor')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    await within(informe).findByRole('heading', { name: 'Posibles causas y consecuencias' })
    // sin causas con sentido queda el aviso de «no lo afirmamos»
    expect(within(informe).getByText(/así que no lo afirmamos/)).toBeVisible()
    expect(within(informe).queryByText(/se pierde bosque/i)).toBeNull()
  })

  it('el estudiante ve robustez, ranking, limitaciones, descargas y cita, sin los bloques del agricultor', async () => {
    renderRuta('/zona/20?perfil=estudiante')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    await within(informe).findByRole('heading', { level: 2, name: NOMBRE['20'] })
    for (const h of [
      '¿Se sostiene el resultado?',
      'Frente a los demás departamentos',
      'Limitaciones',
      'Llévatelo',
      'Cómo citar',
      'Reprodúcelo',
    ])
      expect(await within(informe).findByRole('heading', { name: h })).toBeVisible()
    // Piura cambia de sentido entre periodos: la tabla lo avisa
    expect(within(informe).getByText(/Depende del caso/)).toBeVisible()
    expect(within(informe).queryByRole('heading', { name: '¿Qué trae El Niño aquí?' })).toBeNull()
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

  it('«sin El Niño» vive en la URL: se abre marcado, se escribe al marcar y se quita al cambiar de variable', async () => {
    const router = renderRuta('/zona/20?perfil=estudiante&sinnino=1')
    const informe = await screen.findByRole('complementary', { name: /informe/i })
    const casilla = await within(informe).findByRole('checkbox', {
      name: 'Quitar los años de El Niño',
    })
    expect(casilla).toBeChecked()
    await userEvent.click(casilla)
    await waitFor(() => expect(router.state.location.search).not.toHaveProperty('sinnino'))
    await userEvent.click(casilla)
    await waitFor(() => expect(router.state.location.search).toMatchObject({ sinnino: '1' }))
    const grupo = screen.getByRole('group', { name: 'Variable' })
    await userEvent.click(within(grupo).getByRole('button', { name: 'Temperatura' }))
    await waitFor(() => expect(router.state.location.search).not.toHaveProperty('sinnino'))
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

  it('cada sección del menú de metodología tiene su ancla en la página', async () => {
    renderRuta('/metodologia')
    await screen.findByRole('heading', { level: 1, name: /Metodología/ })
    for (const sec of SECCIONES_METODOLOGIA)
      expect(document.getElementById(`m-${sec}`)).not.toBeNull()
  })

  it('el selector de idioma resalta el idioma actual', async () => {
    renderRuta('/metodologia')
    const grupo = await screen.findByRole('group', { name: 'Cambiar idioma' })
    expect(within(grupo).getByRole('button', { name: /Español/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(within(grupo).getByRole('button', { name: /English/ }))
    expect(useApp.getState().idioma).toBe('en')
    expect(within(grupo).getByRole('button', { name: /English/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
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
