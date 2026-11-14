/**
 * Caso 2, "la costa que reverdece": NDVI real de MODIS MOD13A3 (1 km), 2001 frente a 2024.
 * Cifras del Lab 3 de Favio (pipeline/exploracion/favio/resultados/lab3_resumen.json en el backend).
 * Área verde = píxeles con NDVI anual > 0,3. Tendencia con TFPW + Sen (lab5 de Josue).
 */
export interface Valle {
  /** Departamento donde está el valle (ubigeo) */
  departamento: string
  nombre: string
  imagen: string
  areaAntes: number
  areaDespues: number
  /** Pendiente de Sen del NDVI por década */
  sen: number
}

export const VALLES: Record<string, Valle> = {
  '13': {
    departamento: '13',
    nombre: 'Chavimochic (Virú-Chao)',
    imagen: 'chavimochic',
    areaAntes: 189,
    areaDespues: 355,
    sen: 0.054,
  },
  '11': {
    departamento: '11',
    nombre: 'Ica (valle y Villacurí)',
    imagen: 'ica',
    areaAntes: 118,
    areaDespues: 222,
    sen: 0.027,
  },
}
