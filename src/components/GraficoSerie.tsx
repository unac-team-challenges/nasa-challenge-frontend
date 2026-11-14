import { ANIOS_NINO, NOMBRE, serie, type Variable, type Zona } from '../data/ejemplo'
import { TEXTOS, type Idioma } from '../i18n/textos'
import { fmtValor, num } from '../lib/formato'

interface Props {
  zona: Zona
  variable: Variable
  sinNino: boolean
  idioma: Idioma
  /** Token del color de la tendencia: --up, --down o --green */
  color: string
}

function pasoRedondo(rango: number, objetivo: number) {
  const crudo = rango / objetivo
  const mag = Math.pow(10, Math.floor(Math.log10(crudo)))
  const n = crudo / mag
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag
}

/**
 * Serie 2000–2025 a escala, portada del prototipo en SVG:
 * puntos por año, línea de tendencia (Sen), banda del rango probable y años de El Niño.
 * (El stack proponía Recharts; este SVG es más liviano y fiel al diseño. Se puede cambiar.)
 */
export function GraficoSerie({ zona: d, variable, sinNino, idioma, color }: Props) {
  const t = TEXTOS[idioma]
  const W = 400
  const H = 214
  const ml = 46
  const mr = 10
  const mt = 12
  const mb = 28
  const pts = serie(d.id, variable, sinNino)
  const media = pts.reduce((a, p) => a + p.v, 0) / pts.length
  const recta = (s: number, y: number) => media + (s / 10) * (y - 2012.5)
  const vals = pts
    .map((p) => p.v)
    .concat([
      recta(d.ci_low, 2000),
      recta(d.ci_high, 2000),
      recta(d.ci_low, 2025),
      recta(d.ci_high, 2025),
    ])
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  if (variable === 'lluvia') lo = Math.max(0, lo)
  const paso = pasoRedondo(hi - lo || 1, 4)
  lo = Math.floor(lo / paso) * paso
  hi = Math.ceil(hi / paso) * paso
  const X = (y: number) => ml + ((y - 2000) / 25) * (W - ml - mr)
  const Y = (v: number) => mt + ((hi - v) / (hi - lo)) * (H - mt - mb)
  const f = (n: number) => n.toFixed(1)
  const lineas: number[] = []
  for (let v = lo; v <= hi + paso / 2; v += paso) lineas.push(v)
  const banda = (
    [
      [2000, d.ci_low],
      [2012.5, null],
      [2025, d.ci_high],
      [2025, d.ci_low],
      [2012.5, null],
      [2000, d.ci_high],
    ] as [number, number | null][]
  )
    .map(([y, s]) => `${f(X(y))},${f(Y(s == null ? media : recta(s, y)))}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full overflow-visible"
      role="img"
      aria-label={`${NOMBRE[d.id]}: ${fmtValor(d.slope_per_decade, variable, idioma)} ${t.perDecade[variable]}`}
    >
      {variable === 'lluvia' &&
        !sinNino &&
        ANIOS_NINO.map((y) => (
          <rect
            key={y}
            x={f(X(y) - 5)}
            y={mt}
            width={10}
            height={H - mt - mb}
            style={{ fill: 'var(--nino)' }}
          />
        ))}
      {lineas.map((v) => (
        <g key={v}>
          <line x1={ml} x2={W - mr} y1={f(Y(v))} y2={f(Y(v))} style={{ stroke: 'var(--line)' }} />
          <text
            x={ml - 6}
            y={f(Y(v) + 4)}
            textAnchor="end"
            fontSize={11}
            style={{ fill: 'var(--muted)' }}
          >
            {variable === 'ndvi' ? num(v, 2, idioma) : Math.round(v)}
          </text>
        </g>
      ))}
      {[2000, 2005, 2010, 2015, 2020, 2025].map((y) => (
        <text
          key={y}
          x={f(X(y))}
          y={H - 8}
          textAnchor="middle"
          fontSize={11}
          style={{ fill: 'var(--muted)' }}
        >
          {y}
        </text>
      ))}
      <polygon points={banda} style={{ fill: `var(${color})` }} fillOpacity={0.16} />
      <polyline
        points={pts.map((p) => `${f(X(p.y))},${f(Y(p.v))}`).join(' ')}
        fill="none"
        style={{ stroke: 'var(--line-2)' }}
        strokeWidth={1.2}
      />
      {pts.map((p) => (
        <circle key={p.y} cx={f(X(p.y))} cy={f(Y(p.v))} r={3} style={{ fill: 'var(--muted)' }} />
      ))}
      <line
        x1={f(X(2000))}
        y1={f(Y(recta(d.slope_per_decade, 2000)))}
        x2={f(X(2025))}
        y2={f(Y(recta(d.slope_per_decade, 2025)))}
        style={{ stroke: `var(${color})` }}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <text x={ml} y={mt - 2} fontSize={11} style={{ fill: 'var(--muted)' }}>
        {variable === 'ndvi' ? 'NDVI' : t.unitAxis}
      </text>
    </svg>
  )
}
