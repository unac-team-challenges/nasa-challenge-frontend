import {
  NOMBRE,
  PERIODOS,
  REGION,
  zonasDe,
  type Periodo,
  type Rango,
  type Variable,
  type Zona,
} from '@/data/datos'

export interface CasoRobustez {
  periodo: Periodo
  sinNino: boolean
  rango: Rango
  zona: Zona
}

/**
 * ¿Se sostiene el resultado? La misma zona en los 4 casos que tiene la copia local: periodo
 * reciente y largo, con y sin los años de El Niño.
 *   - robusto: «cambio real» en los 4 y siempre en el mismo sentido.
 *   - nunca: ningún caso llega a «cambio real».
 *   - depende: cambia el estado o el sentido según el caso.
 *   - pocos: no hay datos suficientes.
 */
export function robustez(id: string, variable: Variable) {
  const casos: CasoRobustez[] = (['reciente', 'largo'] as Periodo[]).flatMap((periodo) =>
    [false, true].map((sinNino) => ({
      periodo,
      sinNino,
      rango: PERIODOS[periodo],
      zona: zonasDe(variable, periodo, sinNino)[id],
    })),
  )
  const con = casos.filter((c) => c.zona && c.zona.status !== 'pocos_datos')
  const reales = con.filter((c) => c.zona.status === 'real')
  const signos = new Set(con.map((c) => Math.sign(c.zona.slope_per_decade)))
  const veredicto: 'robusto' | 'nunca' | 'depende' | 'pocos' = !con.length
    ? 'pocos'
    : reales.length === casos.length && signos.size === 1
      ? 'robusto'
      : !reales.length
        ? 'nunca'
        : 'depende'
  return { casos, veredicto, cambiaSigno: signos.size > 1 }
}

/** Departamentos con datos, de mayor a menor pendiente, y el puesto de `id` (1 = el que más sube). */
export function ranking(zonas: Record<string, Zona>, id: string) {
  const orden = Object.values(zonas)
    .filter((z) => z.status !== 'pocos_datos')
    .sort((a, b) => b.slope_per_decade - a.slope_per_decade)
  const i = orden.findIndex((z) => z.id === id)
  return { orden, puesto: i < 0 ? null : i + 1, total: orden.length }
}

/** Los 25 departamentos como CSV: la tabla que el estudiante abre en Excel, R o Python. */
export function tablaCsv(zonas: Record<string, Zona>, variable: Variable) {
  const u = variable === 'lluvia' ? 'mm' : 'c'
  const cab = [
    'id',
    'departamento',
    'region',
    `pendiente_${u}_decada`,
    'ic95_bajo',
    'ic95_alto',
    'cambio_pct_decada',
    'p_value',
    'q_value',
    'lag1',
    'n_anios',
    'anio_inicio',
    'anio_fin',
    'estado',
  ]
  const n = (v: number | null | undefined, d = 4) => (v == null ? '' : String(+v.toFixed(d)))
  const filas = Object.values(zonas)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((z) =>
      [
        z.id,
        `"${NOMBRE[z.id]}"`,
        REGION[z.id],
        n(z.slope_per_decade),
        n(z.ci_low),
        n(z.ci_high),
        n(z.pct_change_per_decade, 2),
        n(z.p_value, 6),
        n(z.q_value, 6),
        n(z.lag1, 3),
        z.n_years,
        z.year_start ?? '',
        z.year_end ?? '',
        z.status,
      ].join(','),
    )
  return [cab.join(','), ...filas].join('\n')
}

/** Baja un texto como archivo (se arma en el navegador; no pide nada a la API). */
export function descargarTexto(nombre: string, texto: string, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
