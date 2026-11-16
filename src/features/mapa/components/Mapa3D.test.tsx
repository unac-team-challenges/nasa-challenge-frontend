import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseSearch, stringifySearch, validarBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'

// La escena real necesita WebGL (jsdom no tiene): una que falla al crearse
vi.mock('@/features/mapa/escena/escena', () => ({
  EscenaPeru: class {
    constructor() {
      throw new Error('WebGL roto')
    }
  },
}))

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  useApp.setState({ conWebgl: true, modoMapa: '3d' })
})

describe('Mapa3D', () => {
  it('si la escena 3D no se puede crear, pasa al mapa 2D en vez de la pantalla de error', async () => {
    const { Mapa3D } = await import('@/features/mapa/components/Mapa3D')
    const raiz = createRootRoute({
      validateSearch: validarBusqueda,
      component: () => <Mapa3D modo="inicio" />,
    })
    const router = createRouter({
      routeTree: raiz,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      parseSearch,
      stringifySearch,
    })
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    await vi.waitFor(() =>
      expect(useApp.getState()).toMatchObject({ conWebgl: false, modoMapa: '2d' }),
    )
  })
})
