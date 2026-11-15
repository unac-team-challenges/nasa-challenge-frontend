/**
 * Caso 2, "la costa que reverdece": NDVI real de MODIS MOD13A3 (1 km), 2001 frente a 2024.
 * Cifras de data/ndvi.json del backend (Chavimochic e Ica: Lab 3 de Favio; Olmos: caja nueva, tarea
 * ee736bc9). La API manda; esto es la copia para cuando no contesta.
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
  /**
   * Por qué leerlo con cuidado (copia de `stats.aviso` del backend y su traducción). En español
   * manda el aviso de la API; esta copia cubre la API caída y el inglés.
   */
  aviso?: { es: string; en: string }
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
  // Olmos: caja sobre las tierras nuevas del proyecto (la del Lab 3 se descartó: caía sobre bosque seco)
  '14': {
    departamento: '14',
    nombre: 'Olmos (tierras nuevas)',
    imagen: 'olmos',
    areaAntes: 125,
    areaDespues: 419,
    sen: 0.081,
    aviso: {
      es: 'Recuadro movido después de descartar el del Lab 3 (caía sobre bosque seco y no tenía tendencia). Mezcla tierras de riego con bosque seco, y la subida pesa mucho en los años de El Niño (2015–2017 y 2023): sin ellos, el rango probable incluye 0.',
      en: 'Box moved after discarding the one from Lab 3 (it fell on dry forest and had no trend). It mixes irrigated land with dry forest, and the rise leans heavily on El Niño years (2015–2017 and 2023): without them, the likely range includes 0.',
    },
  },
}
