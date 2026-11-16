import { NOMBRE, type Variable, type Zona } from '@/data/datos'
import { TEXTOS, type Idioma } from '@/i18n/textos'
import { claveMapa } from '@/utils/direccion'
import { fmtAnomalia, fmtP, fmtValor } from '@/utils/formato'

/** Nivel de verdor (0 desierto … 4 bosque denso) según el NDVI medio. */
export const nivelNdvi = (ndvi: number) =>
  ndvi < 0.15 ? 0 : ndvi < 0.3 ? 1 : ndvi < 0.5 ? 2 : ndvi < 0.7 ? 3 : 4

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

/** Ficha del modo Vegetación: el NDVI medio del departamento y qué tan verde es. */
export function datosTarjetaVeg(
  id: string,
  ndvi: number,
  celdas: number,
  anios: [number, number],
  idioma: Idioma,
  altitud: number,
  /** Celdas en costa, sierra y selva */
  regiones: number[],
) {
  const t = TEXTOS[idioma]
  const total = regiones.reduce((a, b) => a + b, 0) || 1
  const partes = regiones
    .map((n, r) => [n / total, t.regionNombre[r]] as const)
    .filter(([f]) => f >= 0.05)
    .sort((a, b) => b[0] - a[0])
    .map(([f, nombre]) => `${nombre} ${Math.round(f * 100)} %`)
  const nivel = nivelNdvi(ndvi)
  return {
    nombre: NOMBRE[id],
    valor: idioma === 'es' ? ndvi.toFixed(2).replace('.', ',') : ndvi.toFixed(2),
    unidad: t.ndviMedio,
    estado: t.ndviNivel[nivel],
    datos: { estado: 'real', clave: 'green' },
    ic: null,
    meta:
      `${partes.join(' · ')} · ${t.altitudMedia(Math.round(altitud / 10) * 10)}\n` +
      t.vegTarjetaMeta(anios[0], anios[1], celdas),
  }
}
