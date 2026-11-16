import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { GENERADO, NOMBRE, parametroDe } from '@/data/datos'
import { REPOS } from '@/i18n/repos'
import { TEXTOS } from '@/i18n/textos'
import { useAnio, useBusqueda } from '@/lib/busqueda'
import { API_URL } from '@/api/cliente'
import { useVista } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { EstDescargas } from '@/features/ficha/components/EstDescargas'
import { Button } from '@/components/ui/button'

/** Bloque de texto copiable (cita APA, BibTeX, consulta a la API). */
function Copiable({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const t = TEXTOS[useApp((s) => s.idioma)]
  const [copiado, setCopiado] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{etiqueta}</span>
      <div className="flex items-start gap-2">
        <pre className="m-0 min-w-0 flex-1 overflow-x-auto rounded-s border border-line bg-panel-2 p-2 font-mono text-[11.5px] leading-snug whitespace-pre-wrap break-words">
          {texto}
        </pre>
        <Button
          size="icon"
          aria-label={copiado ? t.citarCopiado : `${t.citarCopiar}: ${etiqueta}`}
          onClick={() =>
            navigator.clipboard
              ?.writeText(texto)
              .then(() => {
                setCopiado(true)
                setTimeout(() => setCopiado(false), 1500)
              })
              .catch(() => {})
          }
        >
          {copiado ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
        <span role="status" className="sr-only">
          {copiado ? t.citarCopiado : ''}
        </span>
      </div>
    </div>
  )
}

/**
 * Estudiante: llevarse los datos (EstDescargas), citar (APA y BibTeX, con el enlace a esta vista
 * exacta) y reproducir el cálculo (la consulta a la API y los repositorios).
 */
export function EstRecursos() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const { api, rango } = useVista()
  // Se suscribe al año para que el enlace copiado no quede con el año anterior al mover la barra.
  useAnio()
  if (!sel) return null
  // Año de la cita: el de los datos (no cambia cada 1 de enero).
  const anio = Number(GENERADO.slice(0, 4))
  const enlace = location.href
  const param = parametroDe(variable)
  const apa = [
    `NASA Langley Research Center. (${anio}). POWER Project: ${param}, ${rango.year_start}–${rango.year_end} [Data set]. https://power.larc.nasa.gov/`,
    `UNAC Team Challenges. (${anio}). Detective del Perú [Software]. ${REPOS[0][1]}`,
  ].join('\n\n')
  const bib = `@misc{nasa_power_${param.toLowerCase()},
  author = {{NASA Langley Research Center}},
  title = {{POWER Project}: ${param}, ${rango.year_start}--${rango.year_end}},
  year = {${anio}},
  howpublished = {\\url{https://power.larc.nasa.gov/}},
  note = {${idioma === 'en' ? 'Data generated on' : 'Datos generados el'} ${GENERADO}}
}
@misc{detective_peru,
  author = {{UNAC Team Challenges}},
  title = {Detective del Per\\'u},
  year = {${anio}},
  howpublished = {\\url{${REPOS[0][1]}}},
  note = {Software}
}`
  const consulta = `GET ${API_URL || ''}/api/zonas/${sel}?variable=${variable}`

  return (
    <>
      {/* La zona y la variable en la key: al cambiar, el panel vuelve a todo el periodo */}
      <EstDescargas key={`${sel}-${variable}`} />

      <section aria-labelledby="citar-h" className="flex flex-col gap-3 bloque-ficha">
        <h3 id="citar-h" className="m-0 text-sm font-semibold">
          {t.citarH}
        </h3>
        <Copiable etiqueta="APA" texto={apa} />
        <Copiable etiqueta="BibTeX" texto={bib} />
        <Copiable etiqueta={`${t.citarEnlace} (${NOMBRE[sel]})`} texto={enlace} />
      </section>

      <section aria-labelledby="repro-h" className="flex flex-col gap-3 bloque-ficha">
        <h3 id="repro-h" className="m-0 text-sm font-semibold">
          {t.reproH}
        </h3>
        <Copiable etiqueta={api ? t.reproApi : t.reproSinApi} texto={consulta} />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted">{t.reproRepos}</span>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {REPOS.map(([nombre, url]) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-sm text-accent-text"
                >
                  {nombre}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">{t.enlaceNueva}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
