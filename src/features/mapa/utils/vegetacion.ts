/**
 * Los 5 lugares con vegetación medida (Caso 2 y árboles de la selva). El mapa los marca para que se
 * encuentren: la vegetación no es una variable del mapa (solo hay datos de estos recuadros, no de los
 * 25 departamentos) y se ve en la ficha al tocar su departamento. Punto = centro del recuadro del
 * backend (data/ndvi.json y data/cobertura_arboles.json).
 */
export interface LugarVegetacion {
  id: string
  /** Ubigeo del departamento donde está (su ficha muestra el Caso 2 o la selva) */
  departamento: string
  nombre: string
  lon: number
  lat: number
  /** Corrimiento en px [x, y] para no tapar la etiqueta de un departamento (como Tumbes) */
  corre?: [number, number]
}

export const LUGARES_VEGETACION: LugarVegetacion[] = [
  { id: 'olmos', departamento: '14', nombre: 'Olmos', lon: -80.025, lat: -6.125 },
  { id: 'chavimochic', departamento: '13', nombre: 'Chavimochic', lon: -78.725, lat: -8.475 },
  { id: 'ica', departamento: '11', nombre: 'Ica', lon: -75.775, lat: -14.025 },
  { id: 'iquitos', departamento: '16', nombre: 'Iquitos', lon: -73.6, lat: -4.1, corre: [24, 26] },
  {
    id: 'la-pampa',
    departamento: '17',
    nombre: 'La Pampa',
    lon: -70.0,
    lat: -12.9625,
    corre: [30, -14],
  },
]
