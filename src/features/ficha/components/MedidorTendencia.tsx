import type { Variable, Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { fmtPct, fmtValor } from '@/utils/formato'
import { medida } from '@/features/ficha/utils/serie'

interface Props {
  zona: Zona
  variable: Variable
  idioma: Idioma
  /** Mayor |valor| entre todas las zonas (ver escalaTendencia): la misma escala para los 25 */
  escala: number
  /** campo: palabras en los extremos; tecnico: cero, marcas con valor y el IC con sus bigotes */
  modo: 'campo' | 'tecnico'
}

/** Posición en % de un valor sobre el medidor (−escala a la izquierda, +escala a la derecha). */
const pos = (v: number, escala: number) => Math.min(100, Math.max(0, 50 + (v / escala) * 50))

/**
 * La tendencia sobre un medidor horizontal, el mismo dato en los dos perfiles: la aguja es la
 * pendiente de Sen y la zona clara su rango probable (IC 95 %). Abajo del medio, menos; arriba, más.
 */
export function MedidorTendencia({ zona: d, variable, idioma, escala, modo }: Props) {
  const t = TEXTOS[idioma]
  const m = medida(d, variable)
  // Lluvia en % de su promedio; temperatura en °C
  const fmt = (v: number) => (m.pct ? fmtPct(v) : fmtValor(v, variable, idioma))
  const color = colorDireccion(d.slope_per_decade, variable)
  const [izq, der] = t.medExtremos[variable]
  const a = pos(m.lo, escala)
  const b = pos(m.hi, escala)
  const x = pos(m.v, escala)
  const marcas = [-escala, -escala / 2, 0, escala / 2, escala]
  // Los extremos del medidor llevan el color de lo que significan (lluvia: ocre seco, azul húmedo)
  const fondo = `linear-gradient(90deg, var(${colorDireccion(-1, variable)}-soft), var(--panel-2) 50%, var(${colorDireccion(1, variable)}-soft))`

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <div
        role="img"
        aria-label={t.medAria(fmt(m.v), fmt(m.lo), fmt(m.hi))}
        className="relative h-9"
      >
        <div
          className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full"
          style={{ background: fondo }}
        />
        {/* Rango probable */}
        <div
          className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full border"
          style={{
            left: `${a}%`,
            width: `${Math.max(b - a, 1)}%`,
            background: `color-mix(in srgb, var(${color}) 22%, transparent)`,
            borderColor: `color-mix(in srgb, var(${color}) 55%, transparent)`,
          }}
        />
        {modo === 'tecnico' && (
          <>
            {/* Bigotes del IC */}
            <span
              className="absolute top-1/2 h-px -translate-y-1/2"
              style={{ left: `${a}%`, width: `${b - a}%`, background: `var(${color})` }}
            />
            {[a, b].map((p) => (
              <span
                key={p}
                className="absolute top-1/2 h-4 w-px -translate-y-1/2"
                style={{ left: `${p}%`, background: `var(${color})` }}
              />
            ))}
          </>
        )}
        {/* Cero */}
        <span className="absolute inset-y-1 left-1/2 w-px bg-muted" />
        {/* Aguja */}
        <span
          className="absolute top-0 bottom-0 w-1 -translate-x-1/2 rounded-full ring-2 ring-panel"
          style={{ left: `${x}%`, background: `var(${color})` }}
        />
      </div>
      {modo === 'campo' ? (
        <div className="grid grid-cols-3 text-xs text-muted">
          <span>{izq}</span>
          <span className="text-center">{t.medIgual}</span>
          <span className="text-right">{der}</span>
        </div>
      ) : (
        <div className="relative h-4 text-[11px] text-muted tabular-nums">
          {marcas.map((v, i) => (
            <span
              key={v}
              className={`absolute whitespace-nowrap ${i === 0 ? '' : i === marcas.length - 1 ? '-translate-x-full' : '-translate-x-1/2'}`}
              style={{ left: `${pos(v, escala)}%` }}
            >
              {v === 0 ? '0' : fmt(v)}
            </span>
          ))}
        </div>
      )}
      <figcaption className="text-xs text-muted">
        {modo === 'campo' ? t.medCampoPie : t.medTecPie(m.pct)}
      </figcaption>
    </figure>
  )
}
