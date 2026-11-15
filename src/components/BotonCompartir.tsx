import { Check, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

/** Cuánto dura el «Enlace copiado» (ms). */
const AVISO_MS = 2200

/**
 * Compartir lo que se está viendo: la URL ya guarda zona, variable, perfil, año e idioma.
 * Donde el navegador tiene el menú de compartir (celulares) lo abre; en los demás copia el enlace.
 */
export function BotonCompartir({ className = '' }: { className?: string }) {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const [copiado, setCopiado] = useState(false)
  const reloj = useRef(0)
  useEffect(() => () => clearTimeout(reloj.current), [])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
    } catch {
      // sin permiso del portapapeles (p. ej. página sin https): se muestra el enlace para copiarlo a mano
      prompt(t.compartirManual, location.href)
      return
    }
    setCopiado(true)
    clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => setCopiado(false), AVISO_MS)
  }

  const compartir = async () => {
    if (!navigator.share) return copiar()
    try {
      await navigator.share({ title: document.title, url: location.href })
    } catch (e) {
      // Cerrar el menú de compartir sin elegir nada no es un error
      if (!(e instanceof DOMException && e.name === 'AbortError')) await copiar()
    }
  }

  const Icono = copiado ? Check : Share2
  return (
    <>
      <Button
        size="icon"
        className={className}
        aria-label={t.compartir}
        title={copiado ? t.enlaceCopiado : t.compartir}
        onClick={compartir}
      >
        <Icono className="size-[18px]" aria-hidden="true" />
      </Button>
      {/* Lo anuncian los lectores de pantalla; el ícono cambia a ✓ para quien ve */}
      <span role="status" className="sr-only">
        {copiado ? t.enlaceCopiado : ''}
      </span>
    </>
  )
}
