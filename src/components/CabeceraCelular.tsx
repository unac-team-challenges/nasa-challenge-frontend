import { Link } from '@tanstack/react-router'
import { Check, ChevronDown, House, MapPin, Menu, Moon, Sun, X } from 'lucide-react'
import { Dialog, DropdownMenu } from 'radix-ui'
import type { Variable } from '@/data/datos'
import { ICONO_PERFIL, ICONO_VARIABLE, IDIOMAS, aInicio } from '@/components/opcionesCabecera'
import { ORDEN_PERFILES, TEXTOS } from '@/i18n/textos'
import { useRuta } from '@/hooks/ruta'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

/** Valor del grupo de radio: las 3 variables más «lugares medidos» (no es una variable de los 25) */
const LUGARES = 'lugares'

const itemMenu =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-m px-3 text-fg outline-none select-none data-highlighted:bg-panel-2 data-[state=checked]:font-semibold'
const panel =
  'z-50 rounded-l border border-line bg-panel p-1.5 text-sm shadow-[0_18px_40px_-12px_var(--shadow)]'
const riel = 'flex items-center gap-1 rounded-m bg-panel-2 p-1 ring-1 ring-line'
const opcion = 'min-h-11 flex-1 rounded-[8px] px-3 text-muted hover:text-fg aria-pressed:shadow-sm'
const opcionPerfil = `${opcion} text-accent-text hover:bg-accent-soft hover:text-accent-text aria-pressed:bg-accent aria-pressed:text-accent-fg`
const etiqueta = 'mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase'

/**
 * Celular (≤ 900 px): botón con la variable actual que abre una lista corta.
 * Reemplaza al riel de 4 botones, que no cabía junto al perfil.
 */
export function SelectorVariable() {
  const idioma = useApp((s) => s.idioma)
  const { variable, setVariable, vegetacion, setVegetacion } = useBusqueda()
  const t = TEXTOS[idioma]
  const variables = Object.entries(t.variables) as [Variable, string][]
  const actual = vegetacion ? LUGARES : variable
  const Icono = vegetacion ? MapPin : ICONO_VARIABLE[variable]
  const nombre = vegetacion ? t.vegetacionBtn : t.variables[variable]
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="toggle"
          size="sm"
          data-guia="variables"
          aria-label={`${t.variableLbl}: ${nombre}`}
          className="min-h-11 max-w-[14rem] min-w-0 gap-1.5 rounded-m bg-panel-2 px-3 font-semibold text-fg ring-1 ring-line data-[state=open]:ring-fg"
        >
          <Icono className="size-4" aria-hidden="true" />
          {/* Bajo 420 px «Lugares medidos» no cabe junto a la marca: va la forma corta */}
          <span className="truncate">
            {vegetacion ? (
              <>
                <span className="max-[419px]:hidden">{nombre}</span>
                <span className="min-[420px]:hidden">{t.vegetacionCorto}</span>
              </>
            ) : (
              nombre
            )}
          </span>
          <ChevronDown
            className="size-4 text-muted transition-transform duration-150 in-data-[state=open]:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className={`${panel} w-[min(16rem,calc(100vw-24px))] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none`}
        >
          <DropdownMenu.Label className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            {t.variableLbl}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={actual}
            onValueChange={(v) => (v === LUGARES ? setVegetacion() : setVariable(v as Variable))}
          >
            {variables.map(([v, n]) => {
              const I = ICONO_VARIABLE[v]
              return (
                <DropdownMenu.RadioItem key={v} value={v} className={itemMenu}>
                  <I className="size-4 flex-none" aria-hidden="true" />
                  <span className="flex-1">{n}</span>
                  <DropdownMenu.ItemIndicator>
                    <Check className="size-4 text-accent-text" aria-hidden="true" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              )
            })}
            <DropdownMenu.Separator className="mx-2 my-1 h-px bg-line" />
            <DropdownMenu.RadioItem value={LUGARES} className={itemMenu}>
              <MapPin className="size-4 flex-none" aria-hidden="true" />
              <span className="flex-1">{t.vegetacionBtn}</span>
              <DropdownMenu.ItemIndicator>
                <Check className="size-4 text-accent-text" aria-hidden="true" />
              </DropdownMenu.ItemIndicator>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/**
 * Celular (≤ 900 px): botón ☰ que abre una hoja desde abajo con perfil, idioma, tema e inicio.
 * Abajo queda al alcance del pulgar; el mapa gana la fila que ocupaba la tira.
 */
export function MenuCelular() {
  const idioma = useApp((s) => s.idioma)
  const alternarTema = useApp((s) => s.alternarTema)
  const enInicio = useRuta() === 'inicio'
  const { perfil, setPerfil, setIdioma } = useBusqueda()
  const t = TEXTOS[idioma]
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={t.menu}
          data-guia="perfil"
          className="size-11 rounded-m text-fg ring-1 ring-line hover:bg-panel-2 data-[state=open]:bg-panel-2"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[20px] border-t border-line bg-panel px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-18px_40px_-12px_var(--shadow)] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150 motion-reduce:animate-none"
        >
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line-2" aria-hidden="true" />
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-semibold">{t.menu}</Dialog.Title>
            <Dialog.Close asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t.cerrarMenu}
                className="size-11 rounded-m text-muted hover:bg-panel-2 hover:text-fg"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <section className="mb-4">
            <h3 className={etiqueta}>{t.perfilLbl}</h3>
            <div className={riel} role="group" aria-label={t.perfilLbl}>
              {ORDEN_PERFILES.map((p) => {
                const Icono = ICONO_PERFIL[p]
                return (
                  <Button
                    key={p}
                    variant="toggle"
                    size="sm"
                    className={opcionPerfil}
                    aria-pressed={perfil === p}
                    onClick={() => setPerfil(p)}
                  >
                    <Icono className="size-4" aria-hidden="true" />
                    {t.perfiles[p][0]}
                  </Button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-muted">{t.perfiles[perfil][1]}</p>
          </section>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <section>
              <h3 className={etiqueta}>{t.idiomaLbl}</h3>
              <div className={riel} role="group" aria-label={t.cambiarIdioma}>
                {IDIOMAS.map(([i, corto, nombre]) => (
                  <Button
                    key={i}
                    variant="toggle"
                    size="sm"
                    lang={i}
                    aria-label={`${nombre} (${corto})`}
                    aria-pressed={idioma === i}
                    className={`${opcion} text-xs font-semibold tracking-wide`}
                    onClick={() => setIdioma(i)}
                  >
                    {corto}
                  </Button>
                ))}
              </div>
            </section>
            <section>
              <h3 className={etiqueta}>{t.temaLbl}</h3>
              <Button
                variant="outline"
                aria-label={t.cambiarTema}
                className="min-h-[3.25rem] w-full rounded-m bg-panel-2 text-fg"
                onClick={alternarTema}
              >
                <Moon className="size-4.5 oscuro:hidden" aria-hidden="true" />
                <Sun className="hidden size-4.5 oscuro:block" aria-hidden="true" />
              </Button>
            </section>
          </div>

          <Dialog.Close asChild>
            <Link
              to="/"
              search={aInicio}
              aria-current={enInicio ? 'page' : undefined}
              className="flex min-h-11 items-center gap-3 rounded-m px-3 text-fg no-underline ring-1 ring-line hover:bg-panel-2 aria-[current=page]:text-accent-text"
            >
              <House className="size-4.5" aria-hidden="true" />
              {t.inicioCorto}
            </Link>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
