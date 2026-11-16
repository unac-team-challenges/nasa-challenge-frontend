import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo } from 'react'
import { NOMBRE, ninoEn, type Variable } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { num, numConSigno } from '@/utils/formato'
import { anomalias, iniciosDeRacha, type Punto } from '@/features/ficha/utils/serie'
import { animacion, ejeX, ejeY, MARGEN } from '@/features/ficha/utils/ejes'
import { Globo } from '@/features/ficha/components/Globo'
import { LeyendaGrafico } from '@/features/ficha/components/LeyendaGrafico'

interface Props {
  id: string
  variable: Variable
  pts: Punto[] | null
  sinNino: boolean
  idioma: Idioma
  /** Año de la máquina del tiempo: su barra se resalta y las demás se apagan */
  anio?: number | null
}

/**
 * Cada año frente a lo normal (la misma serie que ve el estudiante, contada para el agricultor):
 * barras arriba o abajo del cero con el color de lo que significan, El Niño con su nombre y,
 * al pasar el dedo, el año dicho en palabras.
 */
export function GraficoAnomalias({ id, variable, pts, sinNino, idioma, anio }: Props) {
  const t = TEXTOS[idioma]
  // Los mismos datos mientras no cambie la serie: al mover el año, Recharts no rehace ni re-anima
  const filas = useMemo(() => (pts ? anomalias(pts, variable) : []), [pts, variable])
  if (!pts || pts.length < 2) return null
  const y0 = pts[0].y
  const y1 = pts[pts.length - 1].y
  const temp = variable === 'temperatura'
  const nino = variable === 'lluvia' && !sinNino ? ninoEn({ year_start: y0, year_end: y1 }) : []
  const etiquetados = iniciosDeRacha(nino)
  const resaltado = anio != null && anio >= y0 && anio <= y1 ? anio : null
  const [arriba, abajo] = t.anomLeyenda[variable]
  const veg = variable === 'vegetacion'
  const magnitud = (a: number) =>
    veg
      ? `${num(a, 2, idioma)} NDVI`
      : temp
        ? `${num(a, 1, idioma)} °C`
        : `${Math.round(Math.abs(a))} %`
  const valorAnio = (v: number) =>
    veg ? `${num(v, 2, idioma)} NDVI` : temp ? `${num(v, 1, idioma)} °C` : `${Math.round(v)} mm`

  return (
    <div className="flex flex-col gap-2">
      <div
        className="aspect-[400/270] w-full min-[480px]:aspect-[400/224]"
        role="img"
        aria-label={`${NOMBRE[id]}: ${t.anomH}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filas} margin={{ ...MARGEN, top: 30 }} barCategoryGap={1}>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
            {nino.map((y) => (
              <ReferenceArea
                key={y}
                x1={y - 0.5}
                x2={y + 0.5}
                fill="var(--nino)"
                fillOpacity={1}
                zIndex={-60}
                label={
                  etiquetados.includes(y)
                    ? {
                        value: t.nino,
                        // Cerca del borde derecho, la etiqueta se alinea a la derecha para no cortarse
                        position: y >= y1 - 2 ? 'insideTopRight' : 'insideTopLeft',
                        offset: 2,
                        fontSize: 11,
                        fill: 'var(--muted)',
                      }
                    : undefined
                }
              />
            ))}
            <XAxis dataKey="y" {...ejeX(y0, y1)} />
            <YAxis
              {...ejeY(t.anomEje[variable])}
              tickFormatter={(a: number) => numConSigno(a, temp ? 1 : 0, idioma)}
            />
            <ReferenceLine y={0} stroke="var(--muted)" />
            <Bar dataKey="a" radius={3} maxBarSize={14} {...animacion()}>
              {filas.map((f) => (
                <Cell
                  key={f.y}
                  fill={`var(${colorDireccion(f.a, variable)})`}
                  fillOpacity={resaltado == null || f.y === resaltado ? 1 : 0.3}
                  stroke={f.y === resaltado ? 'var(--accent)' : 'none'}
                  strokeWidth={f.y === resaltado ? 2 : 0}
                />
              ))}
            </Bar>
            <Tooltip
              cursor={{ fill: 'var(--line)', fillOpacity: 0.45 }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const f = payload?.[0]?.payload as (typeof filas)[number] | undefined
                if (!active || !f) return null
                return (
                  <Globo>
                    <b className="font-semibold">
                      {f.y}
                      {nino.includes(f.y) && ` · ${t.nino}`}
                    </b>
                    <span>{t.anomTip[variable](magnitud(f.a), f.a >= 0)}</span>
                    <span className="text-muted">{t.anomTipValor(valorAnio(f.v))}</span>
                  </Globo>
                )
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <LeyendaGrafico
        entradas={[
          { texto: arriba, color: colorDireccion(1, variable), forma: 'barra' },
          { texto: abajo, color: colorDireccion(-1, variable), forma: 'barra' },
          ...(nino.length ? [{ texto: t.nino, color: '--nino', forma: 'franja' as const }] : []),
        ]}
      />
    </div>
  )
}
