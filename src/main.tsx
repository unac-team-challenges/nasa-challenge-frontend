import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { router } from '@/app/router'
import { cargarPower } from '@/data/datos'
import { cargarIdioma } from '@/i18n/textos'
import { useApp } from '@/stores/app'

const consultas = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
})

// Las funciones de datos.ts y TEXTOS son síncronas: se dibuja cuando la copia local y el idioma de la
// URL ya están cargados
void Promise.all([cargarPower(), cargarIdioma(useApp.getState().idioma)]).then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={consultas}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  ),
)
