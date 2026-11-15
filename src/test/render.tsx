import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { crearRouter } from '@/router'

/** Monta la app entera (rutas reales) en una URL de prueba, sin navegador. */
export function renderRuta(url: string) {
  const router = crearRouter(createMemoryHistory({ initialEntries: [url] }))
  const consultas = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={consultas}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}
