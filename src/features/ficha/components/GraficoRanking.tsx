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
import { NOMBRE, type Variable, type Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { fmtP, fmtValor, numConSigno } from '@/utils/formato'
import { Globo } from '@/features/ficha/components/Globo'

interface Props {
  /** Zonas con datos, ya ordenadas de mayor a menor pendiente */
  orden: Zona[]
  /** La zona de la ficha: se resalta */
  id: string
  variable: Variable
  idioma: Idioma
  /** Ir a la ficha de otra zona al tocar su punto */
  ir: (id: string) => void
}

const ALTO_FILA = 17

/**
 * Pendiente de cada departamento con su IC 95 %, uno por fila y ordenados (un «forest plot»).
 * La zona de la ficha va resaltada; las demás, apagadas. Al tocar un punto se abre esa ficha.
 */
export function GraficoRanking({ orden, id, variable, idioma, ir }: Props) {
  const t = TEXTOS[idioma]
  const fmt = (v: number) => fmtValor(v, variable, idioma)
  const datos = orden.map((z, i) => ({
    ...z,
    fila: i,
    x: z.slope_per_decade,
    err: [z.slope_per_decade - z.ci_low, z.ci_high - z.slope_per_decade],
  }))
  const lim = Math.max(...orden.flatMap((z) => [Math.abs(z.ci_low), Math.abs(z.ci_high)]), 1e-9)
  const temp = variable === 'temperatura'

  return (
    <div
      className="w-full"
      style={{ height: orden.length * ALTO_FILA + 44 }}
      role="img"
      aria-label={t.rankAria}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--line)" strokeDasharray="2 4" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-lim, lim]}
            ticks={[-lim, -lim / 2, 0, lim / 2, lim]}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            tickFormatter={(v: number) => numConSigno(v, temp ? 2 : 0, idioma)}
            label={{
              value: `${t.unitAxis[variable]} / ${t.perDecade}`,
              position: 'insideBottomRight',
              offset: 0,
              fontSize: 10,
              fill: 'var(--muted)',
            }}
            height={36}
          />
          <YAxis
            type="number"
            dataKey="fila"
            domain={[-0.6, orden.length - 0.4]}
            ticks={datos.map((d) => d.fila)}
            interval={0}
            reversed
            width={104}
            tickLine={false}
            axisLine={false}
            tick={(p: { x: string | number; y: string | number; payload: { value: number } }) => {
              const z = orden[p.payload.value]
              const yo = z?.id === id
              return (
                <text
                  x={p.x}
                  y={p.y}
                  dy={4}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight={yo ? 700 : 400}
                  fill={yo ? 'var(--fg)' : 'var(--muted)'}
                >
                  {z ? NOMBRE[z.id] : ''}
                </text>
              )
            }}
          />
          <ReferenceLine x={0} stroke="var(--muted)" />
          {/* Bigotes del IC; los puntos van encima, en otro Scatter */}
          <Scatter data={datos} isAnimationActive={false} shape={() => <g />}>
            <ErrorBar
              dataKey="err"
              direction="x"
              width={5}
              strokeWidth={1.5}
              stroke="var(--muted)"
            />
          </Scatter>
          <Scatter
            data={datos}
            isAnimationActive={false}
            onClick={(p: { payload?: { id: string } }) => p.payload && ir(p.payload.id)}
            shape={(p: { cx?: number; cy?: number; payload?: (typeof datos)[number] }) => {
              const z = p.payload
              if (!z) return <g />
              const yo = z.id === id
              const color = `var(${colorDireccion(z.x, variable)})`
              return (
                <g style={{ cursor: 'pointer' }}>
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={yo ? 6 : 4}
                    fill={color}
                    fillOpacity={z.status === 'real' ? 1 : 0.45}
                    stroke={yo ? 'var(--fg)' : 'var(--panel)'}
                    strokeWidth={yo ? 2 : 1}
                  />
                </g>
              )
            }}
          />
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const z = payload?.[0]?.payload as (typeof datos)[number] | undefined
              if (!active || !z) return null
              return (
                <Globo>
                  <b className="font-semibold">{NOMBRE[z.id]}</b>
                  <span>
                    {fmt(z.x)} {t.perDecade} ({fmt(z.ci_low)} – {fmt(z.ci_high)})
                  </span>
                  <span className="text-muted">
                    q = {fmtP(z.q_value, idioma)} · {t.status[z.status]}
                  </span>
                </Globo>
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
