import { NOMBRE, ninoEn, serie, type Periodo, type Variable, type Zona } from '../data/datos'
import { TEXTOS, type Idioma } from '../i18n/textos'
import { fmtValor, num } from '../lib/formato'

interface Props {
  zona: Zona
  variable: Variable
  periodo: Periodo
  sinNino: boolean
  idioma: Idioma
  /** Token del color de la tendencia: --up o --down */
  color: string
}

function pasoRedondo(rango: number, objetivo: number) {
  const crudo = rango / objetivo
  const mag = Math.pow(10, Math.floor(Math.log10(crudo)))
  const n = crudo / mag
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag
}

/**
 * Serie anual real a escala (SVG, portada del prototipo): puntos por año, línea de
 * tendencia de Sen, banda del rango probable (IC 95 %) y años de El Niño.
 */
export function GraficoSerie({ zona: d, variable, periodo, sinNino, idioma, color }: Props) {
  const t = TEXTOS[idioma]
  const W = 400
  const H = 214
  const ml = 46
  const mr = 10
  const mt = 12
  const mb = 28
  const pts = serie(d.id, variable, periodo, sinNino)
  if (pts.length < 2) return null
  const y0 = pts[0].y
  const y1 = pts[pts.length - 1].y
  // Recta de Sen que pasa por la mediana: pivote en el año central con el valor de la tendencia
  const media = pts.reduce((a, p) => a + p.v, 0) / pts.length
  const xc = (y0 + y1) / 2
  const yc = media
  const recta = (s: number, y: number) => yc + (s / 10) * (y - xc)
  const vals = pts
    .map((p) => p.v)
    .concat([recta(d.ci_low, y0), recta(d.ci_high, y0), recta(d.ci_low, y1), recta(d.ci_high, y1)])
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  if (variable === 'lluvia') lo = Math.max(0, lo)
  const paso = pasoRedondo(hi - lo || 1, 4)
  lo = Math.floor(lo / paso) * paso
  hi = Math.ceil(hi / paso) * paso
  const X = (y: number) => ml + ((y - y0) / (y1 - y0)) * (W - ml - mr)
  const Y = (v: number) => mt + ((hi - v) / (hi - lo)) * (H - mt - mb)
  const f = (n: number) => n.toFixed(1)
  const lineas: number[] = []
  for (let v = lo; v <= hi + paso / 2; v += paso) lineas.push(v)
  const marcas: number[] = []
  for (let y = Math.ceil(y0 / 5) * 5; y <= y1; y += periodo === 'largo' ? 10 : 5) marcas.push(y)
  const banda = (
    [
      [y0, d.ci_low],
      [xc, null],
      [y1, d.ci_high],
      [y1, d.ci_low],
      [xc, null],
      [y0, d.ci_high],
    ] as [number, number | null][]
  )
    .map(([y, s]) => `${f(X(y))},${f(Y(s == null ? yc : recta(s, y)))}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full overflow-visible"
      role="img"
      aria-label={`${NOMBRE[d.id]}: ${fmtValor(d.slope_per_decade, variable, idioma)} ${t.perDecade}`}
    >
      {variable === 'lluvia' &&
        !sinNino &&
        ninoEn(periodo).map((y) => (
          <rect
            key={y}
            x={f(X(y) - 4)}
            y={mt}
            width={8}
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
            {variable === 'temperatura' ? num(v, paso < 1 ? 1 : 0, idioma) : Math.round(v)}
          </text>
        </g>
      ))}
      {marcas.map((y) => (
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
        <circle key={p.y} cx={f(X(p.y))} cy={f(Y(p.v))} r={2.6} style={{ fill: 'var(--muted)' }} />
      ))}
      <line
        x1={f(X(y0))}
        y1={f(Y(recta(d.slope_per_decade, y0)))}
        x2={f(X(y1))}
        y2={f(Y(recta(d.slope_per_decade, y1)))}
        style={{ stroke: `var(${color})` }}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <text x={ml} y={mt - 2} fontSize={11} style={{ fill: 'var(--muted)' }}>
        {t.unitAxis[variable]}
      </text>
    </svg>
  )
}
