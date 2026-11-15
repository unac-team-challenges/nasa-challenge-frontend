import { NOMBRE } from '@/data/datos'
import { COLOR_TENDENCIA, LUGARES_VEGETACION } from '@/features/mapa/utils/vegetacion'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'

/**
 * Informe del modo «Vegetación» sin departamento elegido: qué muestra el mapa y los 5 lugares
 * medidos para elegir. Con un departamento elegido sale su ficha (que incluye el antes y después
 * del Caso 2 o de la selva).
 */
export function PanelVegetacion() {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const { seleccionar } = useBusqueda()

  const lista = (otros: typeof LUGARES_VEGETACION) => (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {otros.map((l) => (
        <li key={l.id}>
          <button
            type="button"
            onClick={() => seleccionar(l.departamento)}
            className="presionable flex w-full cursor-pointer items-center gap-2.5 rounded-s border border-line bg-panel px-3 py-2 text-left text-sm text-fg hover:border-fg"
          >
            <span
              className="size-3 flex-none rounded-[3px] border border-fg"
              style={{ background: `var(${COLOR_TENDENCIA[l.tendencia]})` }}
              aria-hidden="true"
            />
            <b className="font-semibold">{l.nombre}</b>{' '}
            <span className="text-muted">· {NOMBRE[l.departamento]}</span>
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="m-0 mr-11 font-display text-[26px] leading-[1.1] font-bold tracking-display">
        {t.vegIntroH}
      </h2>
      <p className="m-0 text-muted">{t.vegIntro}</p>
      {lista(LUGARES_VEGETACION)}
    </div>
  )
}
