import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import {
  CloudRain,
  GraduationCap,
  Leaf,
  MapPin,
  Moon,
  Sprout,
  Sun,
  Thermometer,
  type LucideIcon,
} from 'lucide-react'
import type { Variable } from '@/data/datos'
import { ORDEN_PERFILES, TEXTOS, type Idioma, type Perfil } from '@/i18n/textos'
import { useRuta } from '@/hooks/ruta'
import { useOcultarAlBajar } from '@/hooks/useOcultarAlBajar'
import { useBusqueda, type Busqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

const ICONO_VARIABLE: Record<Variable, LucideIcon> = {
  lluvia: CloudRain,
  temperatura: Thermometer,
  vegetacion: Leaf,
}

const ICONO_PERFIL: Record<Perfil, LucideIcon> = {
  agricultor: Sprout,
  estudiante: GraduationCap,
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
/** El perfil va en el rosado del borde superior: se distingue de las variables */
const opcionPerfil = `${opcion} text-accent-text hover:bg-accent-soft hover:text-accent-text aria-pressed:bg-accent aria-pressed:text-accent-fg`
/** Al inicio viajan las opciones del mapa y el idioma (no el año ni la zona) */
const aInicio = (p: Busqueda) => ({ variable: p.variable, perfil: p.perfil, lang: p.lang })

/**
 * Barra superior: marca (lleva al inicio), variable, perfil, idioma y tema.
 * En celular pasa a 2 filas: la tira de variable y perfil se desliza de lado (v12).
 */
export function Cabecera() {
  // Selectores sueltos: el estado del mapa (Play, giro) no vuelve a dibujar la cabecera
  const idioma = useApp((s) => s.idioma)
  const alternarTema = useApp((s) => s.alternarTema)
  const enInicio = useRuta() === 'inicio'
  // setIdioma de useBusqueda: el idioma también queda en la URL (?lang=es, #37)
  const { variable, setVariable, perfil, setPerfil, setIdioma, vegetacion, setVegetacion } =
    useBusqueda()
  const t = TEXTOS[idioma]
  const variables = Object.entries(t.variables) as [Variable, string][]
  const [antes, despues] = t.marca.split('Detective')
  // En celular la cabecera se esconde al bajar por la página y vuelve al subir (más sitio para leer)
  const barra = useRef<HTMLElement>(null)
  const oculta = useOcultarAlBajar(barra, '(max-width: 900px)')
  return (
    <header
      ref={barra}
      data-oculta={oculta}
      className="sticky top-0 z-20 flex flex-wrap items-center gap-x-2 gap-y-2.5 border-b border-line bg-panel/85 px-3 pt-3 sm:gap-x-4 sm:px-4 pb-2.5 shadow-[0_10px_30px_-20px_var(--shadow)] backdrop-blur-md max-[900px]:transition-transform max-[900px]:duration-200 max-[900px]:data-[oculta=true]:-translate-y-full max-[900px]:data-[oculta=true]:focus-within:translate-y-0 motion-reduce:transition-none before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[linear-gradient(90deg,var(--up),var(--accent)_50%,var(--down))]"
    >
      <Link
        to="/"
        search={aInicio}
        className="group mr-auto flex min-w-0 items-center gap-2.5 sm:gap-3 text-fg no-underline min-[901px]:mr-0"
        aria-label={t.inicio}
        aria-current={enInicio ? 'page' : undefined}
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

      <div className="relative order-3 -mx-1 flex flex-[1_1_100%] flex-nowrap items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] min-[901px]:order-none min-[901px]:flex-1 min-[901px]:overflow-visible min-[901px]:p-0">
        <div className={riel} role="group" aria-label={t.variableLbl} data-guia="variables">
          {variables.map(([v, nombre]) => {
            const Icono = ICONO_VARIABLE[v]
            return (
              <Button
                key={v}
                variant="toggle"
                size="sm"
                className={opcion}
                aria-pressed={!vegetacion && variable === v}
                title={nombre}
                onClick={() => setVariable(v)}
              >
                <Icono className="size-4" aria-hidden="true" />
                {/* En celular solo el ícono: con tres variables y el perfil, la tira no cabe en 390 px */}
                <span className="max-[479px]:sr-only">{nombre}</span>
              </Button>
            )
          })}
          {/* No es una variable de los 25 departamentos: muestra los 5 lugares medidos de cerca (Caso 2 y selva) */}
          <Button
            variant="toggle"
            size="sm"
            className={opcion}
            aria-pressed={vegetacion}
            title={t.vegetacionBtn}
            onClick={() => setVegetacion()}
          >
            <MapPin className="size-4" aria-hidden="true" />
            {/* En celular solo el ícono: con texto, la tira se ensanchaba y empujaba el perfil fuera de la pantalla */}
            <span className="max-[479px]:sr-only">{t.vegetacionBtn}</span>
          </Button>
        </div>
        {/* Variables a la izquierda y perfiles a la derecha (ml-auto), también en la tira del celular.
            En el inicio no se muestra: la portada ya pregunta el perfil y serían dos botones iguales.
            invisible (no display: none) guarda su sitio: la cabecera mide lo mismo en todas las
            páginas y nada salta de fila al entrar o salir. inert lo saca del foco y del lector. */}
        <div
          className={`${riel} ml-auto transition-[opacity,translate,visibility] duration-300 ease-out data-oculto:invisible data-oculto:-translate-y-1.5 data-oculto:opacity-0 data-oculto:duration-200 data-oculto:ease-in motion-reduce:transition-none`}
          role="group"
          aria-label={t.perfilLbl}
          data-guia="perfil"
          data-oculto={enInicio || undefined}
          inert={enInicio}
        >
          {ORDEN_PERFILES.map((p) => {
            const Icono = ICONO_PERFIL[p]
            return (
              <Button
                key={p}
                variant="toggle"
                size="sm"
                className={opcionPerfil}
                aria-pressed={perfil === p}
                title={`${t.perfiles[p][0]}: ${t.perfiles[p][1]}`}
                onClick={() => setPerfil(p)}
              >
                <Icono className="size-4" aria-hidden="true" />
                {/* En celular solo el ícono: con texto, el segundo botón quedaba fuera de la tira */}
                <span className="max-[479px]:sr-only">{t.perfiles[p][0]}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-none items-center gap-1 sm:gap-2">
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
