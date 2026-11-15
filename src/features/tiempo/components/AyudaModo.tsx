import { useState } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { useRango } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'

const CLAVE = 'ayuda-modo-tiempo'

function yaVista() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/** Una línea la primera visita: qué diferencia hay entre Tendencia y Año a año. Se cierra y no vuelve. */
export function AyudaModo() {
  const idioma = useApp((s) => s.idioma)
  const { year_start: a, year_end: b } = useRango()
  const [visible, setVisible] = useState(() => !yaVista())
  if (!visible) return null
  const t = TEXTOS[idioma]
  const cerrar = () => {
    setVisible(false)
    try {
      localStorage.setItem(CLAVE, '1')
    } catch {
      /* sin almacenamiento (modo privado): la ayuda vuelve a salir */
    }
  }
  return (
    <p className="pointer-events-auto m-0 hidden max-w-136 items-start gap-2 rounded-m border border-accent bg-accent-soft py-1.5 pr-1.5 pl-3 text-[13px] text-fg min-[901px]:flex">
      <span className="py-1">{t.timeHelp(b - a + 1)}</span>
      <button
        type="button"
        aria-label={t.timeHelpClose}
        onClick={cerrar}
        className="grid size-8 flex-none cursor-pointer place-items-center rounded-s border-0 bg-transparent text-fg hover:bg-line"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 5l14 14M19 5L5 19"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </p>
  )
}
