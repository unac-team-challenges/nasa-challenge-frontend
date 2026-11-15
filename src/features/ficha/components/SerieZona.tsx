import { lazy, useDeferredValue } from 'react'
import { Download } from 'lucide-react'
import { NOMBRE, ninoEn, type Zona } from '@/data/datos'
import { TEXTOS, type Perfil } from '@/i18n/textos'
import { useAnio, useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { useDetalle, useVista } from '@/hooks/useZonas'
import { useShallow } from 'zustand/react/shallow'
import { useApp } from '@/stores/app'
import { Figura } from '@/features/ficha/components/Figura'
import { peoresAnios, serieCsv } from '@/features/ficha/utils/serie'
import { listaAnios } from '@/features/ficha/utils/campo'
import { descargarTexto } from '@/features/ficha/utils/estudiante'
import { DescargarFigura } from '@/features/ficha/components/DescargarFigura'
import { Button } from '@/components/ui/button'

// Recharts y los gráficos se descargan aparte, al abrir la primera ficha
const GraficoAnomalias = lazy(() =>
  import('@/features/ficha/components/GraficoAnomalias').then((m) => ({
    default: m.GraficoAnomalias,
  })),
)
const GraficoSerie = lazy(() =>
  import('@/features/ficha/components/GraficoSerie').then((m) => ({ default: m.GraficoSerie })),
)

/**
 * La serie año por año (la misma para los dos perfiles). Agricultor: cada año frente a lo normal
 * y sus años más secos o calurosos. Estudiante: valores, tendencia, rango probable y el CSV.
 */
export function SerieZona({ zona: d, perfil }: { zona: Zona; perfil: Perfil }) {
  const { idioma, sinNino } = useApp(useShallow((s) => ({ idioma: s.idioma, sinNino: s.sinNino })))
  const { variable, sel } = useBusqueda()
  // El año de la barra de tiempo, con prioridad baja: la barra y el mapa responden primero
  const anio = useDeferredValue(useAnio())
  const t = TEXTOS[idioma]
  const { rango } = useVista()
  const { serie: pts, estado, reintentar } = useDetalle(sel)
  const lluvia = variable === 'lluvia'

  if (perfil === 'agricultor') {
    const peores = pts && pts.length >= 5 ? peoresAnios(pts, variable) : []
    return (
      <Figura
        titulo={t.anomH}
        estado={estado}
        reintentar={reintentar}
        conNino={lluvia}
        pie={t.anomCap(rango.year_start, rango.year_end, lluvia, sinNino)}
        extra={
          peores.length > 0 && (
            <p className="m-0 text-[15px]">{t.campoPeores[variable](listaAnios(peores, idioma))}</p>
          )
        }
      >
        <GraficoAnomalias
          id={d.id}
          variable={variable}
          pts={pts}
          sinNino={sinNino}
          idioma={idioma}
          anio={anio}
        />
      </Figura>
    )
  }

  return (
    <Figura
      titulo={t.serieH}
      estado={estado}
      reintentar={reintentar}
      conNino={lluvia}
      pie={lluvia ? t.ninoCap(sinNino, ninoEn(rango).join(', ')) : ''}
      extra={
        pts &&
        pts.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                descargarTexto(
                  `${NOMBRE[d.id]}-${variable}-${pts[0].y}-${pts[pts.length - 1].y}.csv`,
                  serieCsv(pts, variable),
                )
              }
            >
              <Download aria-hidden="true" />
              {t.csvBtn}
            </Button>
            <DescargarFigura nombre={`${NOMBRE[d.id]}-${variable}-serie`} />
          </div>
        )
      }
    >
      <GraficoSerie
        zona={d}
        variable={variable}
        pts={pts}
        sinNino={sinNino}
        idioma={idioma}
        color={colorDireccion(d.slope_per_decade, variable)}
        anio={anio}
      />
    </Figura>
  )
}
