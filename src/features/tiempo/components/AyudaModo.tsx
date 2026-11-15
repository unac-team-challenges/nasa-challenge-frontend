import { Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { useRango } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'

const CLAVE = 'ayuda-modo-tiempo'
/** Se cierra sola tras este tiempo (la barra de abajo lo muestra) */
const DURA_MS = 9000

function marcarVista() {
  try {
    localStorage.setItem(CLAVE, '1')
  } catch {
    /* sin almacenamiento (modo privado): la ayuda vuelve a salir */
  }
}

function yaVista() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/**
 * Una línea la primera visita: qué diferencia hay entre Tendencia y Año a año.
 * Es una pista, no una alerta: tono neutro y se cierra sola (o con la X). No vuelve.
 */
export function AyudaModo() {
  const idioma = useApp((s) => s.idioma)
  const { year_start: a, year_end: b } = useRango()
  const [visible, setVisible] = useState(() => !yaVista())
  useEffect(() => {
    if (!visible) return
    // Al cerrarse sola cuenta como vista: no vuelve en la próxima visita
    const id = setTimeout(() => {
      setVisible(false)
      marcarVista()
    }, DURA_MS)
    return () => clearTimeout(id)
  }, [visible])
  if (!visible) return null
  const t = TEXTOS[idioma]
  const cerrar = () => {
    setVisible(false)
    marcarVista()
  }
  return (
    <div
      role="status"
      className="vidrio pointer-events-auto relative hidden max-w-120 animate-in items-start gap-2.5 overflow-hidden rounded-m py-2 pr-1.5 pl-3 text-[13px] leading-snug text-fg fade-in-0 slide-in-from-top-1 motion-reduce:animate-none min-[901px]:flex"
    >
      <Info className="mt-0.5 size-4 flex-none text-muted" aria-hidden="true" />
      <span className="flex-1 py-px">{t.timeHelp(b - a + 1)}</span>
      <button
        type="button"
        aria-label={t.timeHelpClose}
        onClick={cerrar}
        className="grid size-7 flex-none cursor-pointer place-items-center rounded-s border-0 bg-transparent text-muted hover:bg-line hover:text-fg"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
      {/* Cuánto le queda antes de cerrarse sola */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent/50 motion-reduce:hidden"
        style={{ animation: `cuenta-atras ${DURA_MS}ms linear forwards` }}
      />
    </div>
  )
}
