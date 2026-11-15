import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { router } from '@/app/router'
import { cargarPower } from '@/data/datos'

const consultas = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
})

// Las funciones de datos.ts son síncronas: se dibuja cuando la copia local ya está cargada
void cargarPower().then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={consultas}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  ),
)
