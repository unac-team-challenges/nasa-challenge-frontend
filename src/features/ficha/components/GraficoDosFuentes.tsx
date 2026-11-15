import {
  CartesianGrid,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { fmtValor, numConSigno } from '@/utils/formato'
import { Globo } from '@/features/ficha/components/Globo'

export interface FilaFuente {
  nombre: string
  tipo: string
  slope_per_decade: number
  ci_low: number
  ci_high: number
}

/**
 * Las dos pendientes de lluvia (POWER e IMERG) en un mismo eje, cada una con su rango probable
 * como bigotes: si los bigotes se tocan, no se puede decir que se contradigan.
 */
export function GraficoDosFuentes({ filas, idioma }: { filas: FilaFuente[]; idioma: Idioma }) {
  const t = TEXTOS[idioma]
  const fmt = (v: number) => fmtValor(v, 'lluvia', idioma)
  const datos = filas.map((f, i) => ({
    ...f,
    fila: i,
    x: f.slope_per_decade,
    // ErrorBar asimétrico: [cuánto baja, cuánto sube] desde la pendiente
    err: [f.slope_per_decade - f.ci_low, f.ci_high - f.slope_per_decade],
  }))
  const max = Math.max(...filas.flatMap((f) => [Math.abs(f.ci_low), Math.abs(f.ci_high)]), 1)
  const lim = Math.ceil(max / 10) * 10

  return (
    <div className="h-[140px] w-full" role="img" aria-label={t.dosH}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 6, right: 14, bottom: 4, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--line)" strokeDasharray="2 4" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-lim, lim]}
            ticks={[-lim, -lim / 2, 0, lim / 2, lim]}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            tickFormatter={(v: number) => numConSigno(v, 0, idioma)}
            label={{
              value: t.dosEje,
              position: 'insideBottomRight',
              offset: 0,
              fontSize: 10,
              fill: 'var(--muted)',
            }}
            height={40}
          />
          <YAxis
            type="number"
            dataKey="fila"
            domain={[-0.6, filas.length - 0.4]}
            ticks={datos.map((d) => d.fila)}
            reversed
            width={92}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--fg)', fontSize: 12 }}
            tickFormatter={(i: number) => filas[i]?.nombre ?? ''}
          />
          <ReferenceLine x={0} stroke="var(--muted)" />
          {/* Solo los bigotes del rango probable; los puntos van en los Scatter de abajo */}
          <Scatter data={datos} isAnimationActive={false} shape={() => <g />}>
            <ErrorBar
              dataKey="err"
              direction="x"
              width={8}
              strokeWidth={2}
              stroke="var(--line-2)"
            />
          </Scatter>
          {/* Un segundo Scatter pinta cada punto con el color de su dirección, encima de los bigotes */}
          {datos.map((d) => (
            <Scatter
              key={d.fila}
              data={[d]}
              isAnimationActive={false}
              shape={(p: { cx?: number; cy?: number }) => (
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={6}
                  fill={`var(${colorDireccion(d.x, 'lluvia')})`}
                  stroke="var(--panel)"
                  strokeWidth={2}
                />
              )}
            />
          ))}
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const f = payload?.[0]?.payload as (typeof datos)[number] | undefined
              if (!active || !f) return null
              return (
                <Globo>
                  <b className="font-semibold">
                    {f.nombre} <span className="font-normal text-muted">· {f.tipo}</span>
                  </b>
                  <span>{t.dosTip(fmt(f.x), fmt(f.ci_low), fmt(f.ci_high))}</span>
                </Globo>
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
