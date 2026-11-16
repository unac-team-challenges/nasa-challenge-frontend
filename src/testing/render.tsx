import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { crearRouter } from '@/app/router'

/**
 * Monta la app entera (rutas reales) en una URL de prueba, sin navegador.
 * La guía de la primera visita taparía la pantalla: sale solo si se pide (`conGuia`).
 */
export function renderRuta(url: string, conGuia = false) {
  if (!conGuia) localStorage.setItem('guia-vista', '1')
  const router = crearRouter(createMemoryHistory({ initialEntries: [url] }))
  const consultas = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={consultas}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}
