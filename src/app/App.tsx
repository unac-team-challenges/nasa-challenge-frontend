import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Cabecera } from '@/components/Cabecera'
import { useMeta } from '@/hooks/meta'
import { useRuta } from '@/hooks/ruta'
import { useDecidirFuente } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'

/** Diseño común de todas las pantallas: cabecera arriba y la ruta activa debajo. */
export default function App() {
  const idioma = useApp((s) => s.idioma)
  const ruta = useRuta()
  useDecidirFuente(ruta)
  useMeta(ruta)
  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])
  useEffect(() => {
    scrollTo(0, 0)
  }, [ruta])

  return (
    // En escritorio el explorador ocupa justo la pantalla (el informe se desplaza por dentro)
    <div className={`flex min-h-full flex-col ${ruta === 'explorar' ? 'min-[901px]:h-full' : ''}`}>
      <Cabecera />
      <Outlet />
    </div>
  )
}
