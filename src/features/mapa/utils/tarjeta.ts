import { NOMBRE, type Variable, type Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { claveMapa } from '@/utils/direccion'
import { fmtAnomalia, fmtP, fmtValor } from '@/utils/formato'

/**
 * Contenido de la ficha técnica que sale al pasar el puntero (3D y 2D): cambio por década o
 * anomalía del año, estado, rango probable (IC 95 %) frente al cero, q y años.
 */
export function datosTarjeta(
  d: Zona,
  variable: Variable,
  idioma: Idioma,
  valorAnio: number | null | undefined,
) {
  const t = TEXTOS[idioma]
  const enAnio = valorAnio != null
  const pocos = d.status === 'pocos_datos'
  const conIc = !enAnio && !pocos
  // Escala simétrica alrededor del cero: si la barra cruza el medio, puede ser casualidad
  const m =
    Math.max(Math.abs(d.ci_low), Math.abs(d.ci_high), Math.abs(d.slope_per_decade)) * 1.15 || 1
  const x = (val: number) => 50 + (val / m) * 50
  return {
    nombre: NOMBRE[d.id],
    valor: pocos
      ? '—'
      : enAnio
        ? fmtAnomalia(valorAnio, variable, idioma)
        : fmtValor(d.slope_per_decade, variable, idioma),
    unidad: pocos ? '' : enAnio ? t.vsPromedio : t.perDecade,
    estado: t.status[d.status],
    datos: { estado: d.status, clave: claveMapa(d.slope_per_decade, variable) },
    /** Posiciones en % del ancho de la barra; null si no se dibuja */
    ic: conIc
      ? {
          left: x(d.ci_low).toFixed(1) + '%',
          width: (x(d.ci_high) - x(d.ci_low)).toFixed(1) + '%',
          punto: x(d.slope_per_decade).toFixed(1) + '%',
        }
      : null,
    meta: pocos
      ? `${d.n_years} ${t.anios}`
      : (conIc
          ? `${t.ic95}: ${fmtValor(d.ci_low, variable, idioma)} … ${fmtValor(d.ci_high, variable, idioma)}\n`
          : '') + `q = ${fmtP(d.q_value, idioma)} · ${d.n_years} ${t.anios}`,
  }
}
