import type { SelvaApi } from '@/api/consultas'

/**
 * Árboles de la selva: cobertura de árboles de MODIS MOD44B (250 m), 2001 frente a 2024, en un
 * recuadro por departamento (el NDVI se satura en la selva y no ve la pérdida de bosque).
 * Copia de data/cobertura_arboles.json del backend para cuando la API no contesta: la API manda.
 */
export interface ZonaSelva extends Omit<SelvaApi, 'aviso'> {
  /** Departamento donde está el recuadro (ubigeo) */
  departamento: string
  /** Cómo se nombra dentro de una frase («En …, los árboles…»), en cada idioma */
  nombre: { es: string; en: string }
  /** Por qué leerlo con cuidado (copia de `stats.aviso` y su traducción); en español manda la API */
  aviso?: { es: string; en: string }
}

export const SELVA: Record<string, ZonaSelva> = {
  // La Pampa (Tambopata): minería de oro aluvial, en la zona de amortiguamiento de la Reserva Tambopata
  '17': {
    departamento: '17',
    nombre: { es: 'La Pampa (Tambopata)', en: 'La Pampa (Tambopata)' },
    pctAntes: 74.1,
    pctDespues: 45.86,
    bosqueAntes: 725,
    bosqueDespues: 462,
    sen: -15.263158,
    ciLow: -17.4533,
    ciHigh: -12.5238,
    status: 'posible_casualidad',
    aviso: {
      es: 'La pérdida no fue pareja: de 2001 a 2008 la cobertura se mantuvo cerca del 75 % y desde 2009 baja casi cada año, hasta 46 % en 2024. La caída es grande y su rango probable no incluye 0, pero como empezó de golpe una recta la describe mal, y el criterio único no la marca como cambio real. Años muy parecidos entre sí (lag1 alto): la tendencia puede parecer más segura de lo que es',
      en: 'The loss was not steady: from 2001 to 2008 tree cover stayed near 75 %, and from 2009 it drops almost every year, down to 46 % in 2024. The drop is large and its likely range does not include 0, but because it started abruptly a straight line describes it poorly, and the single criterion does not mark it as a real change. Very similar consecutive years (high lag1): the trend may look more certain than it is',
    },
  },
  // Selva cerca de Iquitos: bosque sin un frente de pérdida conocido, el contraste
  '16': {
    departamento: '16',
    nombre: { es: 'la selva cerca de Iquitos', en: 'the forest near Iquitos' },
    pctAntes: 76.73,
    pctDespues: 79.68,
    bosqueAntes: 491,
    bosqueDespues: 491,
    sen: 1.305882,
    ciLow: -0.2,
    ciHigh: 2.8625,
    status: 'posible_casualidad',
  },
}
