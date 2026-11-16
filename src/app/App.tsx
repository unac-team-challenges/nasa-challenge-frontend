import { Outlet, useRouterState } from '@tanstack/react-router'
import { lazy, Suspense, useEffect } from 'react'
import { Cabecera } from '@/components/Cabecera'
import { MapaSkeleton } from '@/components/Esperas'
import { MenuMetodologia } from '@/components/MenuMetodologia'
import { ALTO_MAPA_CELULAR } from '@/utils/disposicion'
import { useMeta } from '@/hooks/meta'
import { useRuta } from '@/hooks/ruta'
import { useDecidirFuente } from '@/hooks/useZonas'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'

// three.js se descarga aparte (React.lazy), pero empieza a bajar al cargar este módulo,
// sin esperar al primer render
const cargaMapa3D = import('@/features/mapa/components/Mapa3D')
const Mapa3D = lazy(() => cargaMapa3D.then((m) => ({ default: m.Mapa3D })))

/** Diseño común de todas las pantallas: cabecera arriba y la ruta activa debajo. */
export default function App() {
  const idioma = useApp((s) => s.idioma)
  const conWebgl = useApp((s) => s.conWebgl)
  const modoMapa = useApp((s) => s.modoMapa)
  const ruta = useRuta()
  const hash = useRouterState({ select: (s) => s.location.hash })
  useDecidirFuente(ruta)
  useMeta(ruta)
  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])
  useEffect(() => {
    // Con #ancla (menú de metodología) el router baja a la sección: no volver arriba
    if (!hash) scrollTo(0, 0)
  }, [ruta, hash])
  // En el explorador, la vista 2D desmonta el 3D (libera la tarjeta gráfica)
  const en2d = conWebgl && ruta === 'explorar' && modoMapa === '2d'

  return (
    // En escritorio el explorador ocupa justo la pantalla (el informe se desplaza por dentro)
    <div className={`flex min-h-full flex-col ${ruta === 'explorar' ? 'min-[901px]:h-full' : ''}`}>
      {/* Primer elemento al tabular: salta la cabecera. Sin #ancla, para no ensuciar la URL compartida */}
      <a
        href="#contenido"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('contenido')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-m focus:bg-panel focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-[var(--accent)]"
      >
        {TEXTOS[idioma].saltarAlContenido}
      </a>
      <Cabecera />
      <main id="contenido" tabIndex={-1} className="relative flex flex-1 flex-col outline-none">
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
        <MenuMetodologia />
      </main>
    </div>
  )
}
