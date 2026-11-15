import { ALTO_MAPA_CELULAR } from '../lib/disposicion'
import { TEXTOS } from '../i18n/textos'
import { useApp } from '../store'
import { Skeleton } from './ui/skeleton'

/** Aviso accesible para lectores de pantalla: "Cargando…". */
function Estado() {
  const t = TEXTOS[useApp((s) => s.idioma)]
  return (
    <span className="sr-only" role="status">
      {t.cargando}
    </span>
  )
}

/**
 * Esqueleto del mapa, con las mismas cajas que lo rodean (leyenda abajo a la izquierda,
 * máquina del tiempo a la derecha, botones abajo a la derecha) para que nada salte al cargar.
 */
export function MapaSkeleton({
  explorar = false,
  anunciar = true,
}: {
  explorar?: boolean
  anunciar?: boolean
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-busy="true">
      {anunciar && <Estado />}
      <Skeleton className="absolute inset-0 rounded-none opacity-50" />
      {explorar && (
        <>
          <Skeleton className="absolute top-3.5 left-4 h-7 w-56 max-w-[60%]" />
          <Skeleton className="absolute top-3.5 right-4 bottom-[70px] w-[68px] min-[901px]:w-24" />
          <Skeleton className="absolute bottom-16 left-4 h-24 w-56 min-[901px]:bottom-3.5" />
          <Skeleton className="absolute right-4 bottom-3.5 h-10 w-32" />
        </>
      )}
    </div>
  )
}

/** Hueco del gráfico de la ficha (mismo alto que el SVG: 400 × 214). */
export function GraficoSkeleton({ anunciar = true }: { anunciar?: boolean }) {
  return (
    <div aria-busy="true" className="aspect-[400/214] w-full">
      {anunciar && <Estado />}
      <Skeleton className="size-full" />
    </div>
  )
}

/** Ficha de una zona mientras carga: título, semáforo, cifra grande y gráfico. */
export function FichaSkeleton({ anunciar = true }: { anunciar?: boolean }) {
  return (
    <div className="flex flex-col gap-4.5" aria-busy="true">
      {anunciar && <Estado />}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-m" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <GraficoSkeleton anunciar={false} />
    </div>
  )
}

/**
 * El explorador mientras baja su código: el mapa ya está de fondo (App lo monta), así que solo
 * se ve el informe en su lugar.
 */
export function ExploradorSkeleton() {
  return (
    <section className="pointer-events-none relative z-[1] flex flex-1 flex-col min-[901px]:min-h-[560px]">
      <Estado />
      <div className={`flex-none ${ALTO_MAPA_CELULAR} min-[901px]:hidden`} />
      <div className="pointer-events-auto flex-1 bg-panel px-5.5 pt-5.5 min-[901px]:absolute min-[901px]:inset-y-0 min-[901px]:right-0 min-[901px]:w-[clamp(340px,38vw,560px)] min-[901px]:flex-none min-[901px]:border-l min-[901px]:border-line">
        <FichaSkeleton anunciar={false} />
      </div>
    </section>
  )
}

/** Una página de texto (metodología) mientras baja su código. */
export function PaginaSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10" aria-busy="true">
      <Estado />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <Skeleton className="mt-4 h-7 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
