import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import { AntesDespues } from '@/features/ficha/components/AntesDespues'
import { useApp } from '@/stores/app'

/** Sin VITE_API_URL en los tests: se ve la copia local (caso2.ts y selva.ts). */
const ver = (departamento: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AntesDespues departamento={departamento} />
    </QueryClientProvider>,
  )

beforeEach(() => useApp.setState({ idioma: 'es' }))

describe('Caso 2 y selva en la ficha (copia local)', () => {
  it('Olmos (14) entra en el Caso 2 con sus cifras y su aviso a la vista', () => {
    ver('14')
    expect(screen.getByText(/Olmos \(tierras nuevas\).*125 km².*419 km²/)).toBeVisible()
    expect(screen.getByText(/El Niño \(2015–2017 y 2023\)/)).toBeVisible()
    expect(screen.getByRole('img', { name: /Olmos.*2024/ })).toHaveAttribute(
      'src',
      expect.stringContaining('caso2/olmos_2024.png'),
    )
  })

  it('Chavimochic (13) no lleva aviso', () => {
    ver('13')
    expect(screen.getByText(/Chavimochic/)).toBeVisible()
    expect(screen.queryByText(/Léelo con cuidado/)).toBeNull()
  })

  it('Madre de Dios (17): La Pampa pierde árboles, con el aviso del quiebre de 2009', () => {
    ver('17')
    expect(screen.getByRole('heading', { name: 'Árboles de la selva' })).toBeVisible()
    expect(screen.getByText(/cubrían el 74 % del suelo en 2001 y el 46 % en 2024/)).toBeVisible()
    expect(screen.getByText(/Posible casualidad · Tendencia: −15,3 puntos/)).toBeVisible()
    expect(screen.getByText(/desde 2009 baja casi cada año/)).toBeVisible()
  })

  it('Loreto (16): Iquitos dice «no distinguible de 0», no «estable», y sin aviso', () => {
    ver('16')
    expect(screen.getByText(/no hay un cambio distinguible de 0/)).toBeVisible()
    expect(screen.getByText(/^No distinguible de 0 ·/)).toBeVisible()
    expect(screen.queryByText(/estable/i)).toBeNull()
    expect(screen.queryByText(/Léelo con cuidado/)).toBeNull()
  })

  it('en inglés, el aviso sale traducido', () => {
    useApp.setState({ idioma: 'en' })
    ver('17')
    expect(screen.getByText(/from 2009 it drops almost every year/)).toBeVisible()
  })

  it('un departamento sin valle ni selva no muestra nada', () => {
    const { container } = ver('15')
    expect(container).toBeEmptyDOMElement()
  })
})
