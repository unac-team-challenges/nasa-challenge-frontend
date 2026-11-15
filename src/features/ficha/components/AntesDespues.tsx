import { Sprout } from 'lucide-react'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { VALLES } from '@/features/ficha/data/caso2'
import { useVegetacion } from '@/hooks/useVegetacion'
import { TEXTOS, type Perfil } from '@/i18n/textos'
import { CAUSA_VERDE } from '@/features/ficha/data/causas'
import { FuentesCitadas } from '@/features/ficha/components/FuentesCitadas'
import { useApp } from '@/stores/app'

const etiqueta =
  'pointer-events-none absolute top-2 z-10 rounded-full bg-[rgba(15,28,38,0.72)] px-2 py-0.5 text-xs text-white'

/**
 * «No todo cambio es el clima» (Caso 2): NDVI real de MODIS de un valle irrigado, 2001 frente a
 * 2024, con un deslizador. Es el ejemplo de una causa humana: el verde creció por el riego, no por
 * la lluvia que muestra la ficha. Dice de dónde sale el agua, con su fuente. Aparece en los
 * departamentos que tienen un valle analizado (La Libertad e Ica).
 */
export function AntesDespues({ departamento, perfil }: { departamento: string; perfil: Perfil }) {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const local = VALLES[departamento]
  const api = useVegetacion()?.[departamento]
  if (!local) return null
  // Las cifras vienen de la API si contesta; si no, de la copia de caso2.ts (mismos valores del Lab 3)
  const v = { ...local, ...api }
  const pct = Math.round(((v.areaDespues - v.areaAntes) / v.areaAntes) * 100)
  const src = (anio: number) => `${import.meta.env.BASE_URL}caso2/${v.imagen}_${anio}.png`

  return (
    <section
      aria-labelledby="verde-h"
      className="flex flex-col gap-2.5 rounded-m border border-line p-3.5"
    >
      <div className="flex flex-col gap-0.5">
        <h3 id="verde-h" className="m-0 flex items-center gap-1.5 text-sm font-semibold">
          <Sprout className="size-4 text-green" aria-hidden="true" />
          {t.verdeH}
        </h3>
        <span className="text-xs text-muted">{t.verdeSub}</span>
      </div>
      <p className="m-0 font-semibold">
        {perfil === 'agricultor'
          ? t.verdeCampo(v.nombre, v.areaAntes, v.areaDespues)
          : t.verdeEst(v.nombre, v.areaAntes, v.areaDespues, pct)}
      </p>
      {t.verdeCausa[departamento] && <p className="m-0">{t.verdeCausa[departamento]}</p>}
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
      {perfil === 'estudiante' && (
        <>
          <p className="m-0 text-xs text-muted">{t.cmpUmbral}</p>
          <p className="m-0 text-xs text-muted">{t.cmpUnidad}</p>
        </>
      )}
      {CAUSA_VERDE[departamento] && (
        <FuentesCitadas ids={CAUSA_VERDE[departamento]} perfil={perfil} />
      )}
    </section>
  )
}
