/** Lo mínimo de una tendencia para comparar dos fuentes: pendiente, rango probable y estado. */
interface Tendencia {
  slope_per_decade: number
  ci_low: number
  ci_high: number
  status: string
}

/**
 * Qué dice el bloque «¿Coinciden dos fuentes de NASA?».
 *   - pocos: alguna fuente tiene muy pocos datos; no se comparan.
 *   - coinciden: mismo sentido y al menos una con rango probable que no cruza el cero.
 *   - coincidenDebil: mismo sentido, pero las dos con rango que cruza el cero (ninguna es segura).
 *   - noCoinciden: sentido contrario y rangos probables que no se tocan.
 *   - dudoso: sentido contrario, pero los rangos se tocan: no se puede afirmar que se contradigan.
 * Así +1 mm frente a −0,5 mm (rangos que se solapan) no sale «no coinciden».
 */
export type Veredicto = 'pocos' | 'coinciden' | 'coincidenDebil' | 'noCoinciden' | 'dudoso'

export function veredictoDosFuentes(a: Tendencia, b: Tendencia): Veredicto {
  if (a.status === 'pocos_datos' || b.status === 'pocos_datos') return 'pocos'
  const cruzaCero = (t: Tendencia) => t.ci_low <= 0 && t.ci_high >= 0
  if (a.slope_per_decade >= 0 === b.slope_per_decade >= 0)
    return cruzaCero(a) && cruzaCero(b) ? 'coincidenDebil' : 'coinciden'
  const seTocan = a.ci_low <= b.ci_high && b.ci_low <= a.ci_high
  return seTocan ? 'dudoso' : 'noCoinciden'
}
