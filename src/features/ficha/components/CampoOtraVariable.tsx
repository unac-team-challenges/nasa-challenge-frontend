import { ArrowRight } from 'lucide-react'
import type { Variable } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { useVista, useZonas, useZonasDe } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { titularCampo } from '@/features/ficha/utils/campo'

/**
 * Agricultor: «¿Y el calor?» (o «¿Y la lluvia?»). La otra variable en una frase, sin tener que
 * cambiarla arriba: el mismo titular de su tendencia («No se ve un cambio claro en el calor» si no
 * es claro: la frase de confianza sola no diría de qué variable habla).
 * Si los dos cambios son claros y van hacia menos lluvia y más calor, lo junta en una línea.
 * El botón cambia la variable de toda la ficha (y del mapa).
 */
export function CampoOtraVariable() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel, setVariable } = useBusqueda()
  const t = TEXTOS[idioma]
  const otra: Variable = variable === 'lluvia' ? 'temperatura' : 'lluvia'
  const { rango } = useVista(otra)
  const d = useZonasDe(otra)[sel ?? '']
  const esta = useZonas()[sel ?? '']
  if (!sel || !d) return null
  const { claro, titular } = titularCampo(d, otra, rango, idioma)
  // Sin datos, «Aquí no lo podemos medir»; si no, el titular (que no afirma nada si no es claro)
  const frase = d.status === 'pocos_datos' ? t.confCampo.pocos_datos[0] : titular
  const lluvia = variable === 'lluvia' ? esta : d
  const calor = variable === 'lluvia' ? d : esta
  const cruce =
    lluvia?.status === 'real' &&
    calor?.status === 'real' &&
    lluvia.slope_per_decade < 0 &&
    calor.slope_per_decade > 0

  return (
    <section
      aria-labelledby="otra-h"
      className="flex flex-col gap-2.5 rounded-m border border-line p-3.5"
    >
      <h3 id="otra-h" data-leer className="m-0 text-sm font-semibold">
        {t.otraH[variable]}
      </h3>
      <p
        data-leer
        className="m-0 font-semibold"
        style={claro ? { color: `var(${colorDireccion(d.slope_per_decade, otra)})` } : undefined}
      >
        {frase}
      </p>
      {cruce && (
        <p data-leer className="m-0">
          {t.otraCruce}
        </p>
      )}
      <Button className="self-start" onClick={() => setVariable(otra)}>
        {t.otraVer[variable]}
        <ArrowRight aria-hidden="true" />
      </Button>
    </section>
  )
}
