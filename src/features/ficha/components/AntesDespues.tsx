import { Sprout } from 'lucide-react'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { Aviso } from '@/features/ficha/components/Aviso'
import { Selva } from '@/features/ficha/components/Selva'
import { VALLES } from '@/features/ficha/data/caso2'
import { useVegetacion } from '@/hooks/useVegetacion'
import { TEXTOS, type Perfil } from '@/i18n/textos'
import { CAUSA_VERDE } from '@/features/ficha/data/causas'
import { FuentesCitadas } from '@/features/ficha/components/FuentesCitadas'
import { fraccion, miles } from '@/features/ficha/utils/campo'
import { useApp } from '@/stores/app'

const etiqueta =
  'pointer-events-none absolute top-2 z-10 rounded-full bg-[rgba(15,28,38,0.72)] px-2 py-0.5 text-xs text-white'

/**
 * Caso 2 (antes y después): NDVI real de MODIS, 2001 frente a 2024, con un deslizador. Aparece en
 * la ficha de los departamentos que tienen un recuadro analizado.
 * Donde el aumento está documentado como riego (La Libertad, Ica; ver CAUSA_VERDE) es el ejemplo
 * de «No todo cambio es el clima»: el verde creció por el riego, no por la lluvia, con su fuente.
 * Donde no (Olmos mezcla riego y bosque seco, y pesa El Niño), solo da las cifras y su aviso.
 * En la selva, donde el NDVI se satura, muestra en su lugar los árboles (MOD44B, <Selva>).
 * Al agricultor se le cuenta en hectáreas (la unidad con que mide su campo) con dos barras, 2001 y
 * 2024. No en niveles de NDVI: el promedio del recuadro mezcla el campo con el desierto de alrededor
 * y subestima el riego (Ica: 0,14 → 0,20).
 */
export function AntesDespues({ departamento, perfil }: { departamento: string; perfil: Perfil }) {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const local = VALLES[departamento]
  const api = useVegetacion()?.[departamento]
  if (!local) return <Selva departamento={departamento} />
  // Las cifras vienen de la API si contesta; si no, de la copia de caso2.ts (mismos valores)
  const v = {
    ...local,
    ...(api && { areaAntes: api.areaAntes, areaDespues: api.areaDespues, sen: api.sen }),
  }
  // En español manda el aviso de la API; en inglés (o sin API), la copia traducida
  const aviso = idioma === 'es' && api ? api.aviso : local.aviso?.[idioma]
  const pct = v.areaAntes ? Math.round(((v.areaDespues - v.areaAntes) / v.areaAntes) * 100) : 0
  // Solo donde el riego está documentado se dice «no es la lluvia, es el riego»
  const riego = !!CAUSA_VERDE[departamento]
  const src = (anio: number) => `${import.meta.env.BASE_URL}caso2/${v.imagen}_${anio}.png`
  const campo = perfil === 'agricultor'
  // 1 km² = 100 ha
  const ha = (km2: number) => miles(km2 * 100, idioma)
  const fraseHa = t.verdeHa(
    v.nombre,
    ha(v.areaAntes),
    ha(v.areaDespues),
    t.cuanto(fraccion(pct), pct >= 0, null),
  )
  const mayor = Math.max(v.areaAntes, v.areaDespues, 1)

  return (
    <section aria-labelledby="verde-h" className="flex flex-col gap-2.5 bloque-ficha">
      {riego ? (
        <>
          <div className="flex flex-col gap-0.5">
            <h3 id="verde-h" className="m-0 flex items-center gap-1.5 text-sm font-semibold">
              <Sprout className="size-4 text-green" aria-hidden="true" />
              {t.verdeH}
            </h3>
            <span className="text-xs text-muted">{t.verdeSub}</span>
          </div>
          <p className="m-0 font-semibold">
            {campo ? fraseHa : t.verdeEst(v.nombre, v.areaAntes, v.areaDespues, pct)}
          </p>
          {campo && <p className="m-0">{t.verdeRiego}</p>}
          {t.verdeCausa[departamento] && <p className="m-0">{t.verdeCausa[departamento]}</p>}
        </>
      ) : (
        <>
          <h3 id="verde-h" className="m-0 text-sm font-semibold">
            {t.verdeSub}
          </h3>
          <p className="m-0">
            {campo ? fraseHa : t.verdeNeutro(v.nombre, v.areaAntes, v.areaDespues, pct)}
          </p>
        </>
      )}
      {/* Agricultor: el campo verde de 2001 y de 2024 en dos barras, con las hectáreas */}
      {campo && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">{t.verdeBarras}</span>
          {(
            [
              [2001, v.areaAntes],
              [2024, v.areaDespues],
            ] as const
          ).map(([anio, km2]) => (
            <div key={anio} className="flex items-center gap-2 text-xs">
              <span className="w-9 flex-none text-muted tabular-nums">{anio}</span>
              <span className="h-2.5 flex-1 rounded-full bg-panel-2">
                <span
                  className="block h-full rounded-full bg-green"
                  style={{ width: `${(km2 / mayor) * 100}%` }}
                />
              </span>
              <span className="w-20 flex-none text-right font-semibold tabular-nums">
                {t.verdeBarraHa(ha(km2))}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* El aviso del recuadro va siempre a la vista, en los dos perfiles (Olmos: pesa El Niño) */}
      <Aviso texto={aviso} idioma={idioma} />
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
      {/* Es un recuadro, no el departamento: lo ven los dos perfiles (docs/olmos-caso2.md) */}
      <p className="m-0 text-xs text-muted">{t.cmpUnidad}</p>
      {perfil === 'estudiante' && <p className="m-0 text-xs text-muted">{t.cmpUmbral}</p>}
      {riego && <FuentesCitadas ids={CAUSA_VERDE[departamento]} perfil={perfil} />}
    </section>
  )
}
