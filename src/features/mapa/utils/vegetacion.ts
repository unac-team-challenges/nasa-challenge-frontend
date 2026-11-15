/**
 * Los 5 lugares con vegetación medida (Caso 2 y árboles de la selva). No hay datos de vegetación de
 * los 25 departamentos, así que el botón «Vegetación» del mapa atenúa los departamentos y dibuja
 * estos 5 recuadros reales (los del backend: data/ndvi.json y data/cobertura_arboles.json), con el
 * color de su tendencia. Tocar uno abre su antes y después.
 */
export type TendenciaVegetacion = 'sube' | 'baja' | 'igual'

export interface LugarVegetacion {
  id: string
  /** Ubigeo del departamento donde está (su ficha muestra el Caso 2 o la selva) */
  departamento: string
  nombre: string
  /** Recuadro medido: [oeste, sur, este, norte] en grados */
  caja: [number, number, number, number]
  /** Centro del recuadro */
  lon: number
  lat: number
  /**
   * sube = más vegetación (NDVI, Caso 2); baja = menos árboles (La Pampa, rango probable sin 0);
   * igual = sin cambio distinguible de 0 (Iquitos). Copia de los datos de la ficha (lo comprueba
   * src/app/vegetacion.test.ts).
   */
  tendencia: TendenciaVegetacion
}

const lugar = (
  id: string,
  departamento: string,
  nombre: string,
  caja: [number, number, number, number],
  tendencia: TendenciaVegetacion,
): LugarVegetacion => ({
  id,
  departamento,
  nombre,
  caja,
  lon: (caja[0] + caja[2]) / 2,
  lat: (caja[1] + caja[3]) / 2,
  tendencia,
})

export const LUGARES_VEGETACION: LugarVegetacion[] = [
  lugar('olmos', '14', 'Olmos', [-80.15, -6.25, -79.9, -6.0], 'sube'),
  lugar('chavimochic', '13', 'Chavimochic', [-78.85, -8.6, -78.6, -8.35], 'sube'),
  lugar('ica', '11', 'Ica', [-75.9, -14.15, -75.65, -13.9], 'sube'),
  lugar('iquitos', '16', 'Iquitos', [-73.7, -4.2, -73.5, -4.0], 'igual'),
  lugar('la-pampa', '17', 'La Pampa', [-70.125, -13.0875, -69.875, -12.8375], 'baja'),
]

/** Lugar con vegetación medida de un departamento, si lo tiene. */
export const lugarDe = (departamento: string | null) =>
  LUGARES_VEGETACION.find((l) => l.departamento === departamento)

/**
 * Token de color del mapa para cada tendencia: verde = más, ocre = menos y el color del texto
 * (claro en oscuro, oscuro en claro) = sin cambio claro, que se lee sobre los departamentos atenuados.
 */
export const COLOR_TENDENCIA: Record<TendenciaVegetacion, string> = {
  sube: '--map-green',
  baja: '--map-down',
  igual: '--fg',
}
