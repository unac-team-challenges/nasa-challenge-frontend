import { ArrowRight } from 'lucide-react'
import type { Variable, Zona } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { useVista, useZonasDe } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { titularCampo } from '@/features/ficha/utils/campo'

/**
 * Agricultor: «¿Y el calor?» / «¿Y la lluvia?» (viendo vegetación, «¿Y la lluvia y el calor?»).
 * La otra variable del clima en una frase, sin tener que cambiarla arriba: el mismo titular de su
 * tendencia («No se ve un cambio claro en el calor» si no es claro: la frase de confianza sola no
 * diría de qué variable habla). Si llueve menos y hace más calor (los dos cambios claros), lo junta
 * en una línea. Cada botón cambia la variable de toda la ficha (y del mapa).
 */
export function CampoOtraVariable() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel, setVariable } = useBusqueda()
  const t = TEXTOS[idioma]
  // Los hooks van siempre, para las dos variables del clima
  const zonas = { lluvia: useZonasDe('lluvia'), temperatura: useZonasDe('temperatura') }
  const rangos = { lluvia: useVista('lluvia').rango, temperatura: useVista('temperatura').rango }
  if (!sel) return null
  const otras: ('lluvia' | 'temperatura')[] =
    variable === 'vegetacion'
      ? ['lluvia', 'temperatura']
      : [variable === 'lluvia' ? 'temperatura' : 'lluvia']
  const filas = otras
    .map((v) => ({ v, d: zonas[v][sel] as Zona | undefined }))
    .filter((f): f is { v: Variable & ('lluvia' | 'temperatura'); d: Zona } => !!f.d)
  if (!filas.length) return null
  const lluvia = zonas.lluvia[sel]
  const calor = zonas.temperatura[sel]
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
      {filas.map(({ v, d }) => {
        const { claro, titular } = titularCampo(d, v, rangos[v], idioma)
        // Sin datos, «Aquí no lo podemos medir»; si no, el titular (que no afirma nada si no es claro)
        const frase = d.status === 'pocos_datos' ? t.confCampo.pocos_datos[0] : titular
        return (
          <p
            key={v}
            data-leer
            className="m-0 font-semibold"
            style={claro ? { color: `var(${colorDireccion(d.slope_per_decade, v)})` } : undefined}
          >
            {frase}
          </p>
        )
      })}
      {cruce && (
        <p data-leer className="m-0">
          {t.otraCruce}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {filas.map(({ v }) => (
          <Button key={v} onClick={() => setVariable(v)}>
            {t.otraVer[v]}
            <ArrowRight aria-hidden="true" />
          </Button>
        ))}
      </div>
    </section>
  )
}
