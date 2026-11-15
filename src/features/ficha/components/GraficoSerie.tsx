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
import { filasSerie, iniciosDeRacha, type Punto } from '@/features/ficha/utils/serie'
import { animacion, ejeX, ejeY, MARGEN } from '@/features/ficha/utils/ejes'
import { Globo } from '@/features/ficha/components/Globo'
import { LeyendaGrafico } from '@/features/ficha/components/LeyendaGrafico'

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
 * Serie anual a escala (ficha del estudiante): punto por año, recta de Sen, banda del rango
 * probable (IC 95 %) y El Niño. Al pasar el puntero: valor, tendencia y residuo del año.
 * Al quitar El Niño, la recta y la banda se mueven hasta su nueva posición.
 */
export function GraficoSerie({ zona: d, variable, pts, sinNino, idioma, color, anio }: Props) {
  const t = TEXTOS[idioma]
  if (!pts || pts.length < 2) return null
  const filas = filasSerie(pts, d)
  const y0 = pts[0].y
  const y1 = pts[pts.length - 1].y
  const temp = variable === 'temperatura'
  const valor = (v: number) => (temp ? `${num(v, 1, idioma)} °C` : `${Math.round(v)} mm`)
  const residuo = (v: number) =>
    temp ? `${numConSigno(v, 1, idioma)} °C` : `${numConSigno(v, 0, idioma)} mm`
  const nino = variable === 'lluvia' && !sinNino ? ninoEn({ year_start: y0, year_end: y1 }) : []
  const etiquetados = iniciosDeRacha(nino)
  const anim = animacion()

  return (
    <div className="flex flex-col gap-2">
      <div
        className="aspect-[400/224] w-full"
        role="img"
        aria-label={`${NOMBRE[d.id]}: ${fmtValor(d.slope_per_decade, variable, idioma)} ${t.perDecade}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filas} margin={{ ...MARGEN, top: 30 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
            {nino.map((y) => (
              <ReferenceArea
                key={y}
                x1={y - 0.4}
                x2={y + 0.4}
                fill="var(--nino)"
                fillOpacity={1}
                zIndex={-60}
                ifOverflow="extendDomain"
                label={
                  etiquetados.includes(y)
                    ? {
                        value: t.nino,
                        // Cerca del borde derecho, la etiqueta se alinea a la derecha para no cortarse
                        position: y >= y1 - 2 ? 'insideTopRight' : 'insideTopLeft',
                        offset: 2,
                        fontSize: 10,
                        fill: 'var(--muted)',
                      }
                    : undefined
                }
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
              activeDot={false}
              {...anim}
            />
            <Line
              dataKey="v"
              stroke="var(--line-2)"
              strokeWidth={1}
              dot={{ r: 3, fill: 'var(--muted)', stroke: 'var(--panel)', strokeWidth: 1 }}
              activeDot={{ r: 5.5, fill: 'var(--fg)', stroke: 'var(--panel)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              dataKey="tendencia"
              stroke={`var(${color})`}
              strokeWidth={3}
              strokeLinecap="round"
              dot={false}
              activeDot={false}
              {...anim}
            />
            {anio != null && anio >= y0 && anio <= y1 && (
              <ReferenceLine
                x={anio}
                stroke="var(--accent)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: String(anio),
                  position: 'top',
                  fontSize: 10,
                  fill: 'var(--accent-text)',
                }}
              />
            )}
            <Tooltip
              cursor={{ stroke: 'var(--line-2)', strokeDasharray: '3 3' }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const f = payload?.[0]?.payload as (typeof filas)[number] | undefined
                if (!active || !f) return null
                return (
                  <Globo>
                    <b className="font-semibold">
                      {f.y}: {valor(f.v)}
                      {nino.includes(f.y) && ` · ${t.nino}`}
                    </b>
                    <span>{t.serieTipTend(valor(f.tendencia))}</span>
                    <span className="text-muted">{t.serieTipRes(residuo(f.v - f.tendencia))}</span>
                  </Globo>
                )
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <LeyendaGrafico
        entradas={[
          { texto: t.serieLeyenda.puntos, color: '--muted', forma: 'punto' },
          { texto: t.serieLeyenda.tendencia, color, forma: 'linea' },
          { texto: t.serieLeyenda.banda, color: `${color}-soft`, forma: 'barra' },
          ...(nino.length ? [{ texto: t.nino, color: '--nino', forma: 'franja' as const }] : []),
        ]}
      />
    </div>
  )
}
