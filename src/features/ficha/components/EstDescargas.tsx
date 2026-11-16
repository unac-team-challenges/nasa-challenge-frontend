import { useMemo, useState } from 'react'
import { Download, FileText, ImageDown } from 'lucide-react'
import { GENERADO, NOMBRE, parametroDe, serie } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda, useSinNino } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { useDetalle, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { CampoSelect } from '@/features/ficha/components/CampoSelect'
import {
  bajarGraficoPng,
  conCita,
  cortePorAnioCsv,
  imprimirFicha,
  nombreArchivo,
  recortar,
  serieRangoCsv,
} from '@/features/ficha/utils/descarga'
import { descargarTexto, tablaCsv } from '@/features/ficha/utils/estudiante'
import { Button } from '@/components/ui/button'

type Modo = 'zona' | 'anio'
/** «todo» = la tabla de tendencias de los 25 departamentos en todo el periodo. */
const TODO = 'todo'

/**
 * Estudiante: llevarse los datos para su trabajo. Dos recortes (una zona entre dos años, o un
 * año de los 25 departamentos) y tres formatos (CSV, gráfico PNG y la ficha en PDF). Todo se arma
 * en el navegador con lo que la ficha ya tiene; cada archivo lleva su fuente.
 * Se monta con `key` de zona y variable: al cambiar, los años vuelven a todo el periodo.
 */
export function EstDescargas() {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const { variable, sel } = useBusqueda()
  const sinNino = useSinNino()
  const zonas = useZonas()
  const { rango, fuente } = useVista()
  const { serie: pts } = useDetalle(sel)
  const [modo, setModo] = useState<Modo>('zona')
  const [desdeElegido, setDesde] = useState<number | null>(null)
  const [hastaElegido, setHasta] = useState<number | null>(null)
  const [anioElegido, setAnio] = useState<string>(TODO)

  const aniosZona = useMemo(() => (pts ?? []).map((p) => p.y), [pts])
  // Años del selector de «un año»: los de la serie local, que es de donde sale el valor de cada departamento
  const aniosTabla = useMemo(() => {
    const filas = serie('01', variable, rango, sinNino)
    return filas.map((p) => p.y).reverse()
  }, [variable, rango, sinNino])

  if (!sel) return null
  const nombre = NOMBRE[sel]
  const sinSerie = aniosZona.length === 0
  const desde = desdeElegido ?? aniosZona[0]
  const hasta = hastaElegido ?? aniosZona[aniosZona.length - 1]
  const rangoMal = !sinSerie && desde > hasta
  const recorte = pts && !rangoMal ? recortar(pts, desde, hasta) : []
  const opcionesAnios = aniosZona.map((a) => ({ valor: a, texto: String(a) }))
  const parametro = parametroDe(variable)
  const cita = t.descCita(fuente, parametro, GENERADO, location.href)
  const tendencia = colorDireccion(zonas[sel]?.slope_per_decade ?? 0, variable)

  const bajarCsv = () => {
    if (modo === 'zona') {
      descargarTexto(
        `${nombreArchivo(nombre, variable, sinNino && variable === 'lluvia' ? 'sin-nino' : '', desde, hasta)}.csv`,
        conCita(serieRangoCsv(recorte, variable, desde, hasta), cita),
      )
    } else if (anioElegido === TODO) {
      descargarTexto(
        `${nombreArchivo('departamentos', variable, rango.year_start, rango.year_end)}.csv`,
        conCita(tablaCsv(zonas, variable), cita),
      )
    } else {
      descargarTexto(
        `${nombreArchivo('departamentos', variable, anioElegido)}.csv`,
        conCita(cortePorAnioCsv(zonas, variable, Number(anioElegido), sinNino), cita),
      )
    }
  }

  return (
    <>
      <section
        aria-labelledby="llevar-h"
        className="flex flex-col gap-3 rounded-m border border-line p-3.5 print:hidden"
      >
        <h3 id="llevar-h" className="m-0 text-sm font-semibold">
          {t.llevarH}
        </h3>

        <div
          className="inline-flex flex-wrap self-start overflow-hidden rounded-s border border-line-2"
          role="group"
          aria-label={t.descModoLbl}
        >
          {(['zona', 'anio'] as const).map((m) => (
            <Button
              key={m}
              variant="toggle"
              size="sm"
              aria-pressed={modo === m}
              onClick={() => setModo(m)}
            >
              {m === 'zona' ? `${t.descModoZona} · ${nombre}` : t.descModoAnio}
            </Button>
          ))}
        </div>

        {modo === 'zona' ? (
          <div className="flex flex-wrap gap-2.5">
            <CampoSelect
              etiqueta={t.descDesde}
              valor={desde ?? ''}
              opciones={opcionesAnios}
              onCambio={(v) => setDesde(Number(v))}
            />
            <CampoSelect
              etiqueta={t.descHasta}
              valor={hasta ?? ''}
              opciones={opcionesAnios}
              onCambio={(v) => setHasta(Number(v))}
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <CampoSelect
              etiqueta={t.descAnio}
              valor={anioElegido}
              opciones={[
                { valor: TODO, texto: t.descTodoPeriodo },
                ...aniosTabla.map((a) => ({ valor: a, texto: String(a) })),
              ]}
              onCambio={setAnio}
            />
          </div>
        )}
        {rangoMal && (
          <p role="alert" className="m-0 text-[13px] text-down">
            {t.descRangoMal}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={modo === 'zona' && (sinSerie || rangoMal || !recorte.length)}
            onClick={bajarCsv}
          >
            <Download aria-hidden="true" />
            {t.descCsv}
          </Button>
          {modo === 'zona' && (
            <Button
              disabled={sinSerie || rangoMal || !recorte.length}
              onClick={() =>
                void bajarGraficoPng(
                  nombreArchivo(nombre, variable, desde, hasta),
                  recorte,
                  variable,
                  {
                    titulo: t.descTituloPng(nombre, t.variables[variable], desde, hasta),
                    pie: cita,
                    tokenTrazo: tendencia,
                  },
                )
              }
            >
              <ImageDown aria-hidden="true" />
              {t.descPng}
            </Button>
          )}
          <Button
            onClick={() =>
              imprimirFicha(nombreArchivo(nombre, variable, rango.year_start, rango.year_end))
            }
          >
            <FileText aria-hidden="true" />
            {t.descPdf}
          </Button>
        </div>
        <p className="m-0 text-xs text-muted">
          {t.descCsvNota} {t.descPdfNota}
        </p>
      </section>

      {/* Solo al imprimir: la fuente al pie de la ficha */}
      <div className="hidden flex-col gap-0.5 border-t border-line pt-2 text-xs text-muted print:flex">
        {cita.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </>
  )
}
