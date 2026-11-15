import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  notFound,
  type RouterHistory,
} from '@tanstack/react-router'
import App from '@/App'
import { NoEncontrada, PantallaError } from '@/components/Errores'
import { ExploradorSkeleton, PaginaSkeleton } from '@/components/Esperas'
import { Portada } from '@/components/Portada'
import { esUbigeo, parseSearch, stringifySearch, validarBusqueda } from '@/lib/busqueda'

/**
 * Rutas con TanStack Router. La búsqueda (?variable, perfil, zona, anio) se valida una vez en la
 * raíz con Zod (src/lib/busqueda.ts) y la comparten todas las pantallas.
 * El explorador y la metodología se cargan al entrar (React.lazy por ruta).
 */
const raiz = createRootRoute({
  validateSearch: validarBusqueda,
  component: App,
  errorComponent: PantallaError,
  notFoundComponent: NoEncontrada,
})

const inicio = createRoute({ getParentRoute: () => raiz, path: '/', component: Portada })

// El mapa y la ficha son un solo diseño para /explorar y /zona/:id: al elegir una zona
// la pantalla no se vuelve a montar (el 3D no se recrea). Las rutas hijas no dibujan nada.
const mapa = createRoute({
  getParentRoute: () => raiz,
  id: 'mapa',
  component: lazyRouteComponent(() => import('@/components/Explorador'), 'Explorador'),
  pendingComponent: ExploradorSkeleton,
})
const explorar = createRoute({ getParentRoute: () => mapa, path: '/explorar' })
const zona = createRoute({
  getParentRoute: () => mapa,
  path: '/zona/$id',
  beforeLoad: ({ params }) => {
    if (!esUbigeo(params.id)) throw notFound()
  },
})

const metodologia = createRoute({
  getParentRoute: () => raiz,
  path: '/metodologia',
  component: lazyRouteComponent(() => import('@/components/Metodologia'), 'Metodologia'),
  pendingComponent: PaginaSkeleton,
})

const arbol = raiz.addChildren([inicio, mapa.addChildren([explorar, zona]), metodologia])

/** `history` solo se pasa en las pruebas (memoria); en el navegador usa la URL real. */
export const crearRouter = (history?: RouterHistory) =>
  createRouter({
    routeTree: arbol,
    history,
    parseSearch,
    stringifySearch,
    defaultPendingMs: 200,
    defaultPendingMinMs: 300,
  })

export const router = crearRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
