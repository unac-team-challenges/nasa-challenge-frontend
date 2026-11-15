import { useEffect } from 'react'
import { Cabecera } from './components/Cabecera'
import { Explorador } from './components/Explorador'
import { Portada } from './components/Portada'
import { useRuta } from './lib/ruta'
import { useDecidirFuente } from './lib/useZonas'
import { Mapa3D } from './mapa/Mapa3D'
import { useApp } from './store'
import { ALTO_MAPA_CELULAR } from './lib/disposicion'

export default function App() {
  const idioma = useApp((s) => s.idioma)
  const conWebgl = useApp((s) => s.conWebgl)
  const modoMapa = useApp((s) => s.modoMapa)
  const ruta = useRuta()
  useDecidirFuente(ruta)
  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])
  useEffect(() => {
    scrollTo(0, 0)
  }, [ruta])
  // En el explorador, la vista 2D desmonta el 3D (libera la tarjeta gráfica)
  const en2d = conWebgl && ruta === 'explorar' && modoMapa === '2d'

  return (
    // En escritorio el explorador ocupa justo la pantalla (el informe se desplaza por dentro)
    <div className={`flex min-h-full flex-col ${ruta === 'explorar' ? 'min-[901px]:h-full' : ''}`}>
      <Cabecera />
      <main className="relative flex flex-1 flex-col">
        {/* Un solo mapa para la portada y el explorador: al cambiar de pantalla no se recarga */}
        <div
          className={`absolute inset-x-0 top-0 z-0 overflow-hidden ${ALTO_MAPA_CELULAR} min-[901px]:inset-0 min-[901px]:h-auto`}
        >
          {/* En 2D el mapa lo dibuja el explorador, en la zona que no tapa el informe */}
          {!en2d && <Mapa3D modo={ruta} />}
        </div>
        {ruta === 'explorar' ? <Explorador /> : <Portada />}
      </main>
    </div>
  )
}
