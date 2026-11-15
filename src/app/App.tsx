import { Outlet } from '@tanstack/react-router'
import { lazy, Suspense, useEffect } from 'react'
import { Cabecera } from '@/components/Cabecera'
import { MapaSkeleton } from '@/components/Esperas'
import { ALTO_MAPA_CELULAR } from '@/utils/disposicion'
import { useMeta } from '@/hooks/meta'
import { useRuta } from '@/hooks/ruta'
import { useDecidirFuente } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'

// three.js se descarga aparte (React.lazy)
const Mapa3D = lazy(() =>
  import('@/features/mapa/components/Mapa3D').then((m) => ({ default: m.Mapa3D })),
)

/** Diseño común de todas las pantallas: cabecera arriba y la ruta activa debajo. */
export default function App() {
  const idioma = useApp((s) => s.idioma)
  const conWebgl = useApp((s) => s.conWebgl)
  const modoMapa = useApp((s) => s.modoMapa)
  const ruta = useRuta()
  useDecidirFuente(ruta)
  useMeta(ruta)
  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])
  useEffect(() => {
    // Con #ancla (menú de metodología) el router baja a la sección: no volver arriba
    if (!location.hash) scrollTo(0, 0)
  }, [ruta])
  // En el explorador, la vista 2D desmonta el 3D (libera la tarjeta gráfica)
  const en2d = conWebgl && ruta === 'explorar' && modoMapa === '2d'

  return (
    // En escritorio el explorador ocupa justo la pantalla (el informe se desplaza por dentro)
    <div className={`flex min-h-full flex-col ${ruta === 'explorar' ? 'min-[901px]:h-full' : ''}`}>
      <Cabecera />
      <main className="relative flex flex-1 flex-col">
        {/* Un solo mapa para la portada y el explorador: al cambiar de pantalla no se recarga */}
        {ruta !== 'metodologia' && (
          <div
            className={`absolute inset-x-0 top-0 z-0 overflow-hidden ${ALTO_MAPA_CELULAR} min-[901px]:inset-0 min-[901px]:h-auto`}
          >
            {/* En 2D el mapa lo dibuja el explorador, en la zona que no tapa el informe */}
            {!en2d && (
              // three.js pesa casi la mitad de la web: baja aparte mientras se ve el esqueleto
              <Suspense fallback={<MapaSkeleton explorar={ruta === 'explorar'} anunciar={false} />}>
                <Mapa3D modo={ruta} />
              </Suspense>
            )}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
