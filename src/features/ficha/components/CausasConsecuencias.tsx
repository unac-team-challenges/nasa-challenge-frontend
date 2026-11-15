import { Lightbulb, TriangleExclamationPoint } from 'lucide-react'
import type { Zona } from '@/data/datos'
import { CAUSAS_TEXTOS, TEXTOS, type Perfil } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { entradasPara } from '@/features/ficha/data/causas'
import { FuentesCitadas } from '@/features/ficha/components/FuentesCitadas'

/**
 * Posibles causas y consecuencias del cambio de esta zona, solo lo documentado y siempre con su
 * fuente. Las mismas entradas para los dos perfiles: el agricultor las lee en palabras simples con
 * la fuente al pie; el estudiante, con el mecanismo y la referencia completa.
 */
export function CausasConsecuencias({ zona: d, perfil }: { zona: Zona; perfil: Perfil }) {
  const idioma = useApp((s) => s.idioma)
  const { variable } = useBusqueda()
  const t = TEXTOS[idioma]
  const textos = CAUSAS_TEXTOS[idioma]
  const entradas = entradasPara(d.id, variable, d.slope_per_decade >= 0)
  const campo = perfil === 'agricultor'
  const grupos = [
    { tipo: 'causa' as const, titulo: t.causasCausa, icono: Lightbulb },
    { tipo: 'consecuencia' as const, titulo: t.causasConsec, icono: TriangleExclamationPoint },
  ]

  return (
    <section
      aria-labelledby="causas-h"
      className="flex flex-col gap-3 rounded-m border border-line p-3.5"
    >
      <h3 id="causas-h" className="m-0 text-sm font-semibold">
        {t.causasH}
      </h3>
      {entradas.length === 0 && <p className="m-0 text-sm">{t.causasNada}</p>}
      {grupos.map(({ tipo, titulo, icono: Icono }) => {
        const lista = entradas.filter((e) => e.tipo === tipo)
        if (!lista.length) return null
        return (
          <div key={tipo} className="flex flex-col gap-2">
            <h4 className="m-0 flex items-center gap-1.5 text-sm font-semibold">
              <Icono className="size-4 text-muted" aria-hidden="true" />
              {titulo}
            </h4>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {lista.map((e) => (
                <li key={e.id} className="flex flex-col gap-1 border-l-2 border-line pl-2.5">
                  <span className={campo ? '' : 'text-sm'}>
                    {campo ? textos[e.id].campo : textos[e.id].estudiante}
                  </span>
                  {campo && <FuentesCitadas ids={e.fuentes} perfil="agricultor" />}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      {!campo && entradas.length > 0 && (
        <FuentesCitadas ids={entradas.flatMap((e) => e.fuentes)} perfil="estudiante" />
      )}
      <p className="m-0 text-xs text-muted">{t.causasNota}</p>
    </section>
  )
}
