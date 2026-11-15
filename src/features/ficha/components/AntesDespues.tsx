import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { VALLES } from '@/features/ficha/data/caso2'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'

const etiqueta =
  'pointer-events-none absolute top-2 z-10 rounded-full bg-[rgba(15,28,38,0.72)] px-2 py-0.5 text-xs text-white'

/**
 * Caso 2 (antes y después): NDVI real de MODIS de un valle irrigado, 2001 frente a 2024,
 * con un deslizador. Aparece en la ficha de los departamentos que tienen un valle analizado.
 */
export function AntesDespues({ departamento }: { departamento: string }) {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const v = VALLES[departamento]
  if (!v) return null
  const pct = Math.round(((v.areaDespues - v.areaAntes) / v.areaAntes) * 100)
  const src = (anio: number) => `${import.meta.env.BASE_URL}caso2/${v.imagen}_${anio}.png`

  return (
    <div className="flex flex-col gap-2.5 rounded-m border border-line p-3.5">
      <h3 className="m-0 text-sm font-semibold">{t.cmpH}</h3>
      <p className="m-0">{t.cmpTexto(v.nombre, v.areaAntes, v.areaDespues, pct)}</p>
      <div className="relative overflow-hidden rounded-m border border-line bg-panel-2">
        <ReactCompareSlider
          aria-label={t.cmpLbl}
          itemOne={
            <ReactCompareSliderImage
              src={src(2001)}
              alt={t.cmpAlt(v.nombre, 2001)}
              style={{ imageRendering: 'pixelated', aspectRatio: '1 / 1' }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={src(2024)}
              alt={t.cmpAlt(v.nombre, 2024)}
              style={{ imageRendering: 'pixelated', aspectRatio: '1 / 1' }}
            />
          }
        />
        <span className={`${etiqueta} left-2`}>2001</span>
        <span className={`${etiqueta} right-2`}>2024</span>
      </div>
      {/* Escala de color del NDVI (la misma de las imágenes: YlGn de 0 a 0,8) */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>{t.cmpDesierto}</span>
        <span
          className="h-2.5 flex-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #ffffe5, #d9f0a3, #78c679, #238443, #004529)',
          }}
          aria-hidden="true"
        />
        <span>{t.cmpVerde}</span>
      </div>
      <p className="m-0 text-xs text-muted">{t.cmpCap}</p>
    </div>
  )
}
