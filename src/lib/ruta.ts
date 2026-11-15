import { useRouterState } from '@tanstack/react-router'

/** Pantalla actual, según la ruta de TanStack Router (src/router.tsx). */
export type Ruta = 'inicio' | 'explorar' | 'metodologia'

export function useRuta(): Ruta {
  return useRouterState({
    select: (s) => {
      const p = s.location.pathname
      return p.startsWith('/explorar') || p.startsWith('/zona/')
        ? 'explorar'
        : p.startsWith('/metodologia')
          ? 'metodologia'
          : 'inicio'
    },
  })
}
