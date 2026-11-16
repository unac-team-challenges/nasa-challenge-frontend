import type { ReactNode } from 'react'
import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { METODOLOGIA, TERMINOS, TEXTOS, type SeccionMetodologia } from '@/i18n/textos'
import { PERIODOS } from '@/data/datos'
import { useRango } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

const enlace = 'text-accent-text underline-offset-2 hover:underline'
/** En celular cada celda lleva su rótulo (la columna de la tabla) encima del dato. */
const celda =
  'max-sm:p-0 max-sm:before:mb-0.5 max-sm:before:block max-sm:before:text-xs max-sm:before:text-muted max-sm:before:content-[attr(data-etiqueta)]'

/** Lo que tapa la cabecera fija al saltar a un ancla (#m-… o #g-…) */
const bajoCabecera = 'scroll-mt-36 min-[901px]:scroll-mt-24'
const h2 = `m-0 ${bajoCabecera} font-display text-2xl font-bold tracking-display`

function Ext({ a: [texto, url] }: { a: [string, string] }) {
  return (
    <a href={url} target="_blank" rel="noopener" className={enlace}>
      {texto}
    </a>
  )
}

/** Una sección de la página: su título lleva el ancla `m-<id>` a la que salta el menú. */
function Seccion({
  id,
  titulo,
  children,
  className = '',
}: {
  id: SeccionMetodologia
  titulo: string
  children: ReactNode
  className?: string
}) {
  return (
    <section aria-labelledby={`m-${id}`} className={`aparece flex flex-col gap-3 ${className}`}>
      <h2 id={`m-${id}`} className={h2}>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

/** Lista de puntos [título, texto] con el título en negrita */
function Puntos({ items }: { items: [string, string][] }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-2.5 pl-5">
      {items.map(([titulo, texto]) => (
        <li key={titulo}>
          <b>{titulo}.</b> {texto}
        </li>
      ))}
    </ul>
  )
}

/** Metodología, fuentes y créditos: cómo se calcula cada número y de dónde sale. */
export function Metodologia() {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const m = METODOLOGIA[idioma]
  const router = useRouter()
  // Si se llegó desde la ficha (un término subrayado), «Volver» regresa a ella
  const puedeVolver = useCanGoBack()
  const rangos = {
    lluvia: useRango('lluvia'),
    temperatura: useRango('temperatura'),
    local: PERIODOS.largo,
  }
  const anios = (f: { anios?: string; rango?: keyof typeof rangos }) =>
    f.rango ? `${rangos[f.rango].year_start}–${rangos[f.rango].year_end}` : f.anios

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-9 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(30px,4vw,44px)] leading-[1.05] font-bold tracking-[-0.02em]">
          {m.titulo}
        </h1>
        <p className="m-0 text-lg text-muted">{m.intro}</p>
        <div className="flex flex-wrap gap-2">
          {puedeVolver && (
            <Button variant="outline" onClick={() => router.history.back()}>
              <ArrowLeft aria-hidden="true" />
              {t.volver}
            </Button>
          )}
          <Button asChild variant="default">
            <Link to="/explorar" search={(p) => p}>
              {t.irAlMapa}
            </Link>
          </Button>
        </div>
      </header>

      <Seccion id="fuentes" titulo={m.fuentesH}>
        {/* Escritorio: tabla. Celular (< 640 px): cada fuente es una tarjeta con sus datos rotulados,
            porque cuatro columnas no caben en 390 px y la tabla se cortaba por la derecha. Los roles
            explícitos conservan la semántica de tabla al cambiar el `display`. */}
        <div className="rounded-m border border-line sm:overflow-x-auto">
          <table
            role="table"
            className="w-full border-collapse text-left text-sm max-sm:block sm:min-w-136"
          >
            <thead role="rowgroup" className="bg-panel-2 max-sm:sr-only">
              <tr role="row">
                {m.tablaCols.map((c) => (
                  <th key={c} role="columnheader" scope="col" className="px-3 py-2 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody role="rowgroup" className="max-sm:block">
              {m.fuentes.map((f) => (
                <tr
                  key={f.variable}
                  role="row"
                  className="border-t border-line align-top first:border-t-0 max-sm:grid max-sm:gap-1.5 max-sm:px-3 max-sm:py-3 sm:first:border-t"
                >
                  <th role="rowheader" scope="row" className="px-3 py-2 font-semibold max-sm:p-0">
                    {f.variable}
                  </th>
                  <td role="cell" className={`${celda} px-3 py-2`} data-etiqueta={m.tablaCols[1]}>
                    {f.fuente} · <Ext a={f.enlace} />
                  </td>
                  <td
                    role="cell"
                    className={`${celda} px-3 py-2 sm:whitespace-nowrap`}
                    data-etiqueta={m.tablaCols[2]}
                  >
                    {f.resolucion}
                  </td>
                  <td
                    role="cell"
                    className={`${celda} px-3 py-2 sm:whitespace-nowrap`}
                    data-etiqueta={m.tablaCols[3]}
                  >
                    {anios(f)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 text-sm text-muted">{m.fuentesNota}</p>
      </Seccion>

      <Seccion id="mapa" titulo={m.mapaH}>
        <Puntos items={m.mapa} />
      </Seccion>

      <Seccion id="calculo" titulo={m.calculoH}>
        <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-5">
          {m.pasos.map(([titulo, texto]) => (
            <li key={titulo}>
              <b>{titulo}.</b> {texto}
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion id="semaforo" titulo={m.semaforoH}>
        <dl className="m-0 flex flex-col gap-2.5">
          {m.estados.map(([nombre, texto]) => (
            <div key={nombre} className="rounded-m border border-line bg-panel-2 px-3.5 py-3">
              <dt className="font-semibold">{nombre}</dt>
              <dd className="m-0 text-muted">{texto}</dd>
            </div>
          ))}
        </dl>
      </Seccion>

      <Seccion id="glosario" titulo={m.glosarioH}>
        <p className="m-0 text-sm text-muted">{m.glosarioP}</p>
        <dl className="m-0 flex flex-col gap-2.5">
          {TERMINOS.map((id) => {
            const [termino, texto] = m.glosario[id]
            // :target resalta el término al que se llegó desde la ficha
            return (
              <div
                key={id}
                id={`g-${id}`}
                className={`${bajoCabecera} rounded-m border border-line px-3.5 py-3 target:border-accent target:bg-accent-soft`}
              >
                <dt className="font-semibold">{termino}</dt>
                <dd className="m-0 text-muted">{texto}</dd>
              </div>
            )
          })}
        </dl>
      </Seccion>

      <Seccion id="periodos" titulo={m.periodosH}>
        <Puntos items={m.periodos} />
      </Seccion>

      <Seccion id="zonas" titulo={m.zonasH}>
        <Puntos items={m.zonas} />
      </Seccion>

      <Seccion id="limites" titulo={m.limitesH}>
        <Puntos items={m.limites} />
      </Seccion>

      <Seccion id="referencias" titulo={m.referenciasH}>
        {/* Los DOI no tienen espacios: sin overflow-wrap desbordan la página en 320 px */}
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm [overflow-wrap:anywhere]">
          {m.referencias.map(([cita, url]) => (
            <li key={url}>
              {cita} <Ext a={[url.replace('https://doi.org/', 'doi:'), url]} />
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="creditos" titulo={m.creditosH} className="border-t border-line pt-6">
        <p className="m-0">{m.creditosP}</p>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
          {m.creditosDatos.map((a) => (
            <li key={a[1]}>
              <Ext a={a} />
            </li>
          ))}
        </ul>
        <p className="m-0">{m.creditosCodigo}</p>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
          {m.repos.map((a) => (
            <li key={a[1]}>
              <Ext a={a} />
            </li>
          ))}
        </ul>
        <p className="m-0 text-sm text-muted">{m.creditosNasa}</p>
      </Seccion>
    </article>
  )
}
