import { ChevronDown } from 'lucide-react'
import { NOMBRE } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'

/** Los 25 departamentos en orden alfabético: no cambia con el idioma ni con los datos. */
const ORDEN = Object.entries(NOMBRE).sort((a, b) => a[1].localeCompare(b[1], 'es'))

/**
 * Elegir un departamento sin apuntar al mapa: la lista del sistema, que en celular es cómoda
 * y con lector de pantalla es la forma más directa. Equivale a tocar la zona en el mapa.
 */
export function SelectorZona({ className = '' }: { className?: string }) {
  const idioma = useApp((s) => s.idioma)
  const { sel, seleccionar } = useBusqueda()
  const t = TEXTOS[idioma]
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t.zonaLbl}</span>
      <select
        value={sel ?? ''}
        onChange={(e) => seleccionar(e.target.value, true)}
        className="min-h-9 w-full cursor-pointer appearance-none rounded-s border border-line-2 bg-panel py-0 pr-8 pl-3 text-sm font-medium text-fg hover:border-fg"
      >
        <option value="" disabled>
          {t.zonaElegir}
        </option>
        {ORDEN.map(([id, nombre]) => (
          <option key={id} value={id}>
            {nombre}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 size-4 text-muted"
        aria-hidden="true"
      />
    </label>
  )
}
