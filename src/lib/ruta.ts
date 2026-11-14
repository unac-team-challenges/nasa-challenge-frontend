import { useSyncExternalStore } from 'react'

/**
 * Rutas por hash, como el prototipo (#inicio, #explorar, #expediente-1…).
 * Pendiente: pasar a TanStack Router + Zod (/zona/20?perfil=agricultor) cuando haya más pantallas.
 */
export type Ruta = 'inicio' | 'explorar'

function leer(): Ruta {
  const h = location.hash.replace('#', '')
  // Los expedientes llegan en otro PR: por ahora abren el explorador
  return h === 'explorar' || h.startsWith('expediente') ? 'explorar' : 'inicio'
}

function suscribir(cb: () => void) {
  addEventListener('hashchange', cb)
  return () => removeEventListener('hashchange', cb)
}

export function useRuta(): Ruta {
  return useSyncExternalStore(suscribir, leer, () => 'inicio')
}
