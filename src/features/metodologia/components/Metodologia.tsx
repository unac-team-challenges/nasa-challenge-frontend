import { Link } from '@tanstack/react-router'
import { METODOLOGIA, TEXTOS } from '@/i18n/textos'
import { PERIODOS } from '@/data/datos'
import { useRango } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

const enlace = 'text-accent-text underline-offset-2 hover:underline'
/** En celular cada celda lleva su rótulo (la columna de la tabla) encima del dato. */
const celda =
  'max-sm:p-0 max-sm:before:mb-0.5 max-sm:before:block max-sm:before:text-xs max-sm:before:text-muted max-sm:before:content-[attr(data-etiqueta)]'

const h2 =
  'm-0 scroll-mt-36 min-[901px]:scroll-mt-24 font-display text-2xl font-bold tracking-display'

function Ext({ a: [texto, url] }: { a: [string, string] }) {
  return (
    <a href={url} target="_blank" rel="noopener" className={enlace}>
      {texto}
    </a>
  )
}

/** Metodología, fuentes y créditos: cómo se calcula cada número y de dónde sale. */
export function Metodologia() {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const m = METODOLOGIA[idioma]
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
        <div>
          <Button asChild variant="default">
            <Link to="/explorar" search={(p) => p}>
              {t.irAlMapa}
            </Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="m-fuentes" className="aparece flex flex-col gap-3">
        <h2 id="m-fuentes" className={h2}>
          {m.fuentesH}
        </h2>
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
      </section>

      <section aria-labelledby="m-calculo" className="aparece flex flex-col gap-3">
        <h2 id="m-calculo" className={h2}>
          {m.calculoH}
        </h2>
        <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-5">
          {m.pasos.map(([titulo, texto]) => (
            <li key={titulo}>
              <b>{titulo}.</b> {texto}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="m-semaforo" className="aparece flex flex-col gap-3">
        <h2 id="m-semaforo" className={h2}>
          {m.semaforoH}
        </h2>
        <dl className="m-0 flex flex-col gap-2.5">
          {m.estados.map(([nombre, texto]) => (
            <div key={nombre} className="rounded-m border border-line bg-panel-2 px-3.5 py-3">
              <dt className="font-semibold">{nombre}</dt>
              <dd className="m-0 text-muted">{texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="m-limites" className="aparece flex flex-col gap-3">
        <h2 id="m-limites" className={h2}>
          {m.limitesH}
        </h2>
        <ul className="m-0 flex list-disc flex-col gap-2.5 pl-5">
          {m.limites.map(([titulo, texto]) => (
            <li key={titulo}>
              <b>{titulo}.</b> {texto}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="m-creditos"
        className="aparece flex flex-col gap-3 border-t border-line pt-6"
      >
        <h2 id="m-creditos" className={h2}>
          {m.creditosH}
        </h2>
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
      </section>
    </article>
  )
}
