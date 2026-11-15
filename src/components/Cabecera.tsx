import { Link } from '@tanstack/react-router'
import {
  ChevronDown,
  CloudRain,
  Leaf,
  Moon,
  Sun,
  Thermometer,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { Variable } from '@/data/datos'
import { ORDEN_PERFILES, TEXTOS, type Idioma, type Perfil } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { MenuMetodologia } from '@/components/MenuMetodologia'
import { Button } from '@/components/ui/button'

const ICONO_VARIABLE: Record<Variable, LucideIcon> = {
  lluvia: CloudRain,
  temperatura: Thermometer,
  vegetacion: Leaf,
}

const IDIOMAS = [
  ['es', 'ES', 'Español'],
  ['en', 'EN', 'English'],
] as const satisfies readonly (readonly [Idioma, string, string])[]

/** Contenedor de opciones (variable, perfil, idioma): un riel con la opción activa resaltada */
const riel =
  'inline-flex flex-none items-center gap-0.5 rounded-m bg-panel-2 p-0.5 ring-1 ring-line'
/** Bajo 420 px solo queda "Detective" y bajo 360 px solo el logo: el nombre sigue en el aria-label */
const resto = 'font-display font-semibold max-[419px]:hidden'
const opcion = 'min-h-9 rounded-[8px] px-3 text-muted hover:text-fg aria-pressed:shadow-sm'

/**
 * Barra superior: marca, variable, perfil, metodología, idioma y tema.
 * En celular pasa a 2 filas: la tira de variable y perfil se desliza de lado (v12).
 */
export function Cabecera() {
  // Selectores sueltos: el estado del mapa (Play, giro) no vuelve a dibujar la cabecera
  const idioma = useApp((s) => s.idioma)
  const alternarTema = useApp((s) => s.alternarTema)
  // setIdioma de useBusqueda: el idioma también queda en la URL (?lang=en, #37)
  const { variable, setVariable, perfil, setPerfil, setIdioma } = useBusqueda()
  const t = TEXTOS[idioma]
  const variables = Object.entries(t.variables) as [Variable, string][]
  const [antes, despues] = t.marca.split('Detective')
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-2 gap-y-2.5 border-b border-line bg-panel/85 px-3 pt-3 sm:gap-x-4 sm:px-4 pb-2.5 shadow-[0_10px_30px_-20px_var(--shadow)] backdrop-blur-md before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[linear-gradient(90deg,var(--up),var(--accent)_50%,var(--down))]">
      <Link
        to="/"
        search={(p) => ({ variable: p.variable, perfil: p.perfil, lang: p.lang })}
        className="group mr-auto flex min-w-0 items-center gap-2.5 sm:gap-3 text-fg no-underline min-[901px]:mr-0"
        aria-label={t.inicio}
      >
        {/* Logo del equipo sin fondo (scripts/logo.py); en oscuro, un contorno claro despega el aro azul */}
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt=""
          width={48}
          height={48}
          className="size-10 flex-none transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none sm:size-12 oscuro:drop-shadow-[0_0_1px_rgb(255_255_255/0.5)]"
        />
        <span className="flex flex-col leading-none max-[359px]:hidden">
          <span className="text-lg tracking-display sm:text-xl">
            {antes && <span className={resto}>{antes}</span>}
            <span className="marca">Detective</span>
            {despues && <span className={`${resto} text-muted`}>{despues}</span>}
          </span>
          <span className="mt-1 hidden text-[11px] font-medium tracking-[0.12em] text-muted uppercase sm:block">
            {t.lema}
          </span>
        </span>
      </Link>

      <div className="order-3 -mx-1 flex flex-[1_1_100%] flex-nowrap items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] min-[901px]:order-none min-[901px]:mx-auto min-[901px]:flex-none min-[901px]:overflow-visible min-[901px]:p-0">
        <div className={riel} role="group" aria-label={t.variableLbl}>
          {variables.map(([v, nombre]) => {
            const Icono = ICONO_VARIABLE[v]
            return (
              <Button
                key={v}
                variant="toggle"
                size="sm"
                className={opcion}
                aria-pressed={variable === v}
                onClick={() => setVariable(v)}
              >
                <Icono className="size-4" aria-hidden="true" />
                {nombre}
              </Button>
            )
          })}
        </div>
        <label className="sr-only" htmlFor="perfil">
          {t.perfilLbl}
        </label>
        <div className={`${riel} relative`}>
          <UserRound
            className="pointer-events-none absolute left-3 size-4 text-muted"
            aria-hidden="true"
          />
          <select
            id="perfil"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as Perfil)}
            className="min-h-9 cursor-pointer appearance-none rounded-[8px] border-0 bg-transparent pr-8 pl-9 text-sm font-medium hover:bg-panel"
          >
            {ORDEN_PERFILES.map((p) => (
              <option key={p} value={p}>
                {t.perfiles[p][0]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 size-4 text-muted"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="flex flex-none items-center gap-1 sm:gap-2">
        <MenuMetodologia />
        <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
        <div className={riel} role="group" aria-label={t.cambiarIdioma}>
          {IDIOMAS.map(([i, corto, nombre]) => (
            <Button
              key={i}
              variant="toggle"
              size="sm"
              lang={i}
              // El nombre accesible incluye lo que se ve (WCAG 2.5.3): «English (EN)»
              aria-label={`${nombre} (${corto})`}
              aria-pressed={idioma === i}
              className={`${opcion} px-2.5 text-xs font-semibold tracking-wide`}
              onClick={() => setIdioma(i)}
            >
              {corto}
            </Button>
          ))}
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label={t.cambiarTema}
          className="rounded-m text-muted hover:bg-panel-2 hover:text-fg"
          onClick={alternarTema}
        >
          {/* El icono sigue al tema real (forzado o del sistema) solo con CSS */}
          <Moon className="size-4.5 oscuro:hidden" aria-hidden="true" />
          <Sun className="hidden size-4.5 oscuro:block" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
