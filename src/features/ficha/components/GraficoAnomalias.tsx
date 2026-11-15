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
import { NOMBRE, ninoEn, type Variable } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { fmtPct, num, numConSigno } from '@/utils/formato'
import { anomalias, type Punto } from '@/features/ficha/utils/serie'
import { ejeX, ejeY, MARGEN } from '@/features/ficha/utils/ejes'
import { Globo } from '@/features/ficha/components/Globo'

interface Props {
  id: string
  variable: Variable
  pts: Punto[] | null
  sinNino: boolean
  idioma: Idioma
  /** Año de la máquina del tiempo (se marca en el gráfico) */
  anio?: number | null
}

/**
 * Ficha del agricultor: cada año frente a lo normal (el promedio del periodo). Barras arriba o abajo
 * del cero, con el color de la dirección, y franjas en los años de El Niño. Se lee como «el 2017
 * fue malo», que es como se recuerdan los años en el campo.
 */
export function GraficoAnomalias({ id, variable, pts, sinNino, idioma, anio }: Props) {
  const t = TEXTOS[idioma]
  if (!pts || pts.length < 2) return null
  const filas = anomalias(pts, variable)
  const y0 = pts[0].y
  const y1 = pts[pts.length - 1].y
  const temp = variable === 'temperatura'
  const valor = (a: number) =>
    temp ? `${a > 0 ? '+' : a < 0 ? '−' : ''}${num(a, 1, idioma)} °C` : fmtPct(a)
  const nino = variable === 'lluvia' && !sinNino ? ninoEn({ year_start: y0, year_end: y1 }) : []

  return (
    <div className="aspect-[400/214] w-full" role="img" aria-label={`${NOMBRE[id]}: ${t.anomH}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filas} margin={MARGEN} barCategoryGap={1}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          {nino.map((y) => (
            <ReferenceArea
              key={y}
              x1={y - 0.5}
              x2={y + 0.5}
              fill="var(--nino)"
              zIndex={-60}
              fillOpacity={1}
            />
          ))}
          <XAxis dataKey="y" {...ejeX(y0, y1)} />
          <YAxis
            {...ejeY(t.anomEje[variable])}
            tickFormatter={(a: number) => numConSigno(a, temp ? 1 : 0, idioma)}
          />
          <ReferenceLine y={0} stroke="var(--muted)" />
          <Bar dataKey="a" radius={2} isAnimationActive={false} maxBarSize={14}>
            {filas.map((f) => (
              <Cell
                key={f.y}
                fill={`var(${colorDireccion(f.a, variable)})`}
                stroke={f.y === anio ? 'var(--accent)' : 'none'}
                strokeWidth={f.y === anio ? 2 : 0}
              />
            ))}
          </Bar>
          <Tooltip
            cursor={{ fill: 'var(--line)', fillOpacity: 0.5 }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const f = payload?.[0]?.payload as (typeof filas)[number] | undefined
              if (!active || !f) return null
              return (
                <Globo>
                  <b className="font-semibold">{t.anomTip(f.y, valor(f.a))}</b>
                </Globo>
              )
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
