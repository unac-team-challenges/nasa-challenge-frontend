import { ChevronDown } from 'lucide-react'
import { NOMBRE } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'

/** Los 25 departamentos en orden alfabético: no cambia con el idioma ni con los datos. */
const ORDEN = Object.entries(NOMBRE).sort((a, b) => a[1].localeCompare(b[1], 'es'))

/**
 * Elegir un departamento sin apuntar al mapa, para teclado y lector de pantalla: el mapa 3D es
 * un lienzo (`role="img"`) sin teclado, y esta lista es la vía para elegir zona ahí. A la vista
 * no está (cambiar de zona se hace tocando el mapa): aparece solo cuando recibe el foco, como
 * «Saltar al contenido». Equivale a tocar la zona en el mapa.
 */
export function SelectorZona({ className = '' }: { className?: string }) {
  const idioma = useApp((s) => s.idioma)
  const { sel, seleccionar } = useBusqueda()
  const t = TEXTOS[idioma]
  return (
    // sr-only va en la etiqueta y la flecha en su propia caja: not-sr-only deja la etiqueta en
    // position: static y le quitaría el `relative` a la flecha
    <label className={`sr-only focus-within:not-sr-only ${className}`}>
      <span className="sr-only">{t.zonaLbl}</span>
      <span className="relative flex items-center">
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
      </span>
    </label>
  )
}
