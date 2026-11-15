import { lazy, Suspense } from 'react'
import { MapaSkeleton } from '@/components/Esperas'
import { Portada } from '@/features/portada/components/Portada'

// three.js pesa casi la mitad de la web: se descarga aparte mientras se ve el esqueleto
const Mapa3D = lazy(() =>
  import('@/features/mapa/components/Mapa3D').then((m) => ({ default: m.Mapa3D })),
)

/** Ruta `/`: arma la portada con el mapa 3D (la feature portada no conoce a la feature mapa). */
export function Inicio() {
  return (
    <Portada
      mapa={
        <Suspense fallback={<MapaSkeleton />}>
          <Mapa3D modo="inicio" />
        </Suspense>
      }
    />
  )
}
