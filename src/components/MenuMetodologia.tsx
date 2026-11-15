import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Database,
  Sigma,
  TrafficCone,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useRef } from 'react'
import { useRuta } from '@/hooks/ruta'
import { METODOLOGIA, SECCIONES_METODOLOGIA, TEXTOS, type SeccionMetodologia } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

const ICONO: Record<SeccionMetodologia, LucideIcon> = {
  fuentes: Database,
  calculo: Sigma,
  semaforo: TrafficCone,
  limites: TriangleAlert,
  creditos: Users,
}

const item =
  'group/item flex cursor-pointer items-start gap-3 rounded-m px-2.5 py-2 text-fg no-underline outline-none select-none data-highlighted:bg-panel-2'
const tile =
  'grid size-8 flex-none place-items-center rounded-s bg-panel-2 text-muted ring-1 ring-line transition-colors group-data-highlighted/item:bg-accent-soft group-data-highlighted/item:text-accent-text'

/** Menú "Metodología" de la cabecera: la página entera o directo a una de sus secciones. */
export function MenuMetodologia() {
  const idioma = useApp((s) => s.idioma)
  const activa = useRuta() === 'metodologia'
  const t = TEXTOS[idioma]
  const m = METODOLOGIA[idioma]
  const titulo: Record<SeccionMetodologia, string> = {
    fuentes: m.fuentesH,
    calculo: m.calculoH,
    semaforo: m.semaforoH,
    limites: m.limitesH,
    creditos: m.creditosH,
  }
  // Ya en /metodologia el salto se anima, salvo que el sistema pida menos movimiento
  // Tras saltar a otra página/sección el foco no vuelve al botón (quedaba el anillo encima)
  const navego = useRef(false)
  const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          data-activa={activa || undefined}
          className="group relative rounded-m px-2.5 hover:bg-panel-2 hover:no-underline data-[state=open]:bg-panel-2 data-activa:text-accent-text sm:px-3"
        >
          <BookOpen className="size-4.5" aria-hidden="true" />
          <span className="max-sm:sr-only">{t.metodologiaCorto}</span>
          <ChevronDown
            className="size-3.5 text-muted transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none max-sm:hidden"
            aria-hidden="true"
          />
          {activa && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          onCloseAutoFocus={(e) => {
            if (navego.current) e.preventDefault()
            navego.current = false
          }}
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 w-[min(22rem,calc(100vw-24px))] rounded-l border border-line bg-panel p-1.5 text-sm shadow-[0_18px_40px_-12px_var(--shadow)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-1 motion-reduce:animate-none"
        >
          <DropdownMenu.Item asChild onSelect={() => (navego.current = true)}>
            <Link to="/metodologia" aria-current={activa ? 'page' : undefined} className={item}>
              <span className="grid size-8 flex-none place-items-center rounded-s bg-accent text-accent-fg">
                <BookOpen className="size-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{t.metodologiaTodo}</span>
                <span className="text-xs text-muted">{t.metodologiaEnlace}</span>
              </span>
              <ArrowRight
                className="mt-1 size-4 text-muted transition-transform group-data-highlighted/item:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="mx-2 my-1.5 h-px bg-line" />
          {SECCIONES_METODOLOGIA.map((s) => {
            const Icono = ICONO[s]
            return (
              <DropdownMenu.Item key={s} asChild onSelect={() => (navego.current = true)}>
                <Link
                  to="/metodologia"
                  hash={`m-${s}`}
                  hashScrollIntoView={{ behavior: suave ? 'smooth' : 'auto', block: 'start' }}
                  className={item}
                >
                  <span className={tile}>
                    <Icono className="size-4" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{titulo[s]}</span>
                    <span className="text-xs text-muted">{m.menuD[s]}</span>
                  </span>
                </Link>
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
