import { ImageDown } from 'lucide-react'
import type { MouseEvent } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { exportarPng, exportarSvg } from '@/features/ficha/utils/exportar'
import { Button } from '@/components/ui/button'

/**
 * Botones para bajar el gráfico de su misma sección como SVG o PNG (estudiante: para la tesis).
 * Busca el <svg> de Recharts dentro de la <section> que lo contiene.
 */
export function DescargarFigura({ nombre }: { nombre: string }) {
  const t = TEXTOS[useApp((s) => s.idioma)]
  const svgDe = (e: MouseEvent<HTMLButtonElement>) =>
    e.currentTarget.closest('section')?.querySelector<SVGSVGElement>('svg.recharts-surface')
  return (
    <div className="flex flex-wrap gap-2">
      {(['svg', 'png'] as const).map((f) => (
        <Button
          key={f}
          onClick={(e) => {
            const svg = svgDe(e)
            if (!svg) return
            void (f === 'svg' ? exportarSvg(svg, nombre) : exportarPng(svg, nombre))
          }}
        >
          <ImageDown aria-hidden="true" />
          {f === 'svg' ? t.figSvg : t.figPng}
        </Button>
      ))}
    </div>
  )
}
