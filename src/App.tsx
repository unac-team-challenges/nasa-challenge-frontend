import { useEffect } from 'react'
import { Cabecera } from './components/Cabecera'
import { Portada } from './components/Portada'
import { useApp } from './store'

export default function App() {
  const idioma = useApp((s) => s.idioma)
  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])

  return (
    <div className="flex min-h-full flex-col">
      <Cabecera />
      <Portada />
    </div>
  )
}
