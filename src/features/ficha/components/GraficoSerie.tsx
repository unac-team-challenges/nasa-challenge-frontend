import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { NOMBRE, ninoEn, type Variable, type Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { fmtValor, num, numConSigno } from '@/utils/formato'
import { filasSerie, type Punto } from '@/features/ficha/utils/serie'
import { ejeX, ejeY, MARGEN } from '@/features/ficha/utils/ejes'
import { Globo } from '@/features/ficha/components/Globo'

interface Props {
  zona: Zona
  variable: Variable
  /** Serie anual (null = cargando o sin datos de la API) */
  pts: Punto[] | null
  sinNino: boolean
  idioma: Idioma
  /** Token del color de la tendencia: --up o --down */
  color: string
  /** Año de la máquina del tiempo (se marca en el gráfico) */
  anio?: number | null
}

/**
 * Serie anual real a escala (ficha del estudiante): punto por año, recta de Sen, banda del rango
 * probable (IC 95 %) y franjas de los años de El Niño.
 */
export function GraficoSerie({ zona: d, variable, pts, sinNino, idioma, color, anio }: Props) {
  const t = TEXTOS[idioma]
  if (!pts || pts.length < 2) return null
  const filas = filasSerie(pts, d)
  const y0 = pts[0].y
  const y1 = pts[pts.length - 1].y
  const temp = variable === 'temperatura'
  const valor = (v: number) => (temp ? `${num(v, 1, idioma)} °C` : `${Math.round(v)} mm`)
  const nino = variable === 'lluvia' && !sinNino ? ninoEn({ year_start: y0, year_end: y1 }) : []

  return (
    <div
      className="aspect-[400/214] w-full"
      role="img"
      aria-label={`${NOMBRE[d.id]}: ${fmtValor(d.slope_per_decade, variable, idioma)} ${t.perDecade}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={filas} margin={MARGEN}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          {nino.map((y) => (
            <ReferenceArea
              key={y}
              x1={y - 0.4}
              x2={y + 0.4}
              fill="var(--nino)"
              zIndex={-60}
              fillOpacity={1}
              ifOverflow="extendDomain"
            />
          ))}
          <XAxis dataKey="y" {...ejeX(y0, y1)} />
          <YAxis
            {...ejeY(t.unitAxis[variable])}
            domain={
              variable === 'lluvia' ? [(m: number) => Math.max(0, m), 'auto'] : ['auto', 'auto']
            }
            tickFormatter={(v: number) => numConSigno(v, temp ? 1 : 0, idioma)}
          />
          <Area
            dataKey="banda"
            stroke="none"
            fill={`var(${color})`}
            fillOpacity={0.16}
            isAnimationActive={false}
            activeDot={false}
          />
          <Line
            dataKey="v"
            stroke="var(--line-2)"
            strokeWidth={1.2}
            dot={{ r: 2.6, fill: 'var(--muted)', stroke: 'none' }}
            activeDot={{ r: 5, fill: 'var(--fg)', stroke: 'var(--panel)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            dataKey="tendencia"
            stroke={`var(${color})`}
            strokeWidth={3.5}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          {anio != null && anio >= y0 && anio <= y1 && (
            <ReferenceLine
              x={anio}
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}
          <Tooltip
            cursor={{ stroke: 'var(--line-2)' }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const f = payload?.[0]?.payload as (typeof filas)[number] | undefined
              if (!active || !f) return null
              return (
                <Globo>
                  <b className="font-semibold">{t.serieTip(f.y, valor(f.v))}</b>
                  <span className="text-muted">{t.tendenciaTip(valor(f.tendencia))}</span>
                </Globo>
              )
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
