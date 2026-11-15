import { NOMBRE, type Zona } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { fmtValor } from '@/utils/formato'
import { useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

/**
 * Zona de contraste para la pista "sube aquí, baja allá": la de tendencia contraria
 * más fuerte, prefiriendo las que tienen "cambio real".
 */
function zonaContraste(d: Zona, zonas: Record<string, Zona>) {
  const contrarias = Object.values(zonas).filter(
    (z) =>
      z.id !== d.id &&
      z.status !== 'pocos_datos' &&
      Math.sign(z.slope_per_decade) !== Math.sign(d.slope_per_decade),
  )
  if (!contrarias.length) return null
  const puntaje = (z: Zona) =>
    (z.status === 'real' ? 1e6 : 0) + Math.abs(z.pct_change_per_decade ?? z.slope_per_decade)
  return contrarias.sort((x, y) => puntaje(y) - puntaje(x))[0]
}

/** Pista «sube aquí, baja allá»: la zona que cambia en sentido contrario, con un botón para ir. */
export function PistaContraste({ zona: d }: { zona: Zona }) {
  const idioma = useApp((s) => s.idioma)
  const { variable, seleccionar } = useBusqueda()
  const t = TEXTOS[idioma]
  const td = zonaContraste(d, useZonas())
  if (!td) return null
  const fmt = (v: number) => fmtValor(v, variable, idioma)
  return (
    <div className="flex flex-col gap-2.5 rounded-m border border-line p-3.5">
      <h3 className="m-0 text-sm font-semibold">{t.clueH}</h3>
      <p className="m-0">
        {t.clue(
          NOMBRE[td.id],
          t.verb[variable][td.slope_per_decade >= 0 ? 0 : 1],
          fmt(Math.abs(td.slope_per_decade)).replace('+', ''),
          t.status[td.status].toLowerCase(),
        )}
      </p>
      <div>
        <Button onClick={() => seleccionar(td.id)}>{t.clueBtn(NOMBRE[td.id])}</Button>
      </div>
    </div>
  )
}
