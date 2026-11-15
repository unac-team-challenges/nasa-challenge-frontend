/**
 * Posibles causas y consecuencias de los cambios que muestra la ficha, cada una con su fuente.
 * Regla: solo lo documentado. Cada entrada cita al menos una fuente verificada (artículo con DOI,
 * IPCC o institución pública); los textos están en i18n/textos.ts (CAUSAS_TEXTOS), por id.
 * Nuestros datos muestran QUÉ cambió; el POR QUÉ viene de estos estudios.
 * Fuentes revisadas el 15 nov 2026.
 */
import type { Variable } from '@/data/datos'

export interface Fuente {
  /** Cita corta para el agricultor: institución o autor y año */
  corta: string
  /** Referencia completa (APA 7) para el estudiante */
  apa: string
  url: string
}

export const FUENTES = {
  lavado2014: {
    corta: 'SENAMHI · Lavado y Espinoza (2014)',
    apa: 'Lavado-Casimiro, W., & Espinoza, J. C. (2014). Impactos de El Niño y La Niña en las lluvias del Perú (1965-2007). Revista Brasileira de Meteorologia, 29(2), 171–182.',
    url: 'https://doi.org/10.1590/S0102-77862014000200003',
  },
  sulca2018: {
    corta: 'IGP · Sulca et al. (2018)',
    apa: 'Sulca, J., Takahashi, K., Espinoza, J. C., Vuille, M., & Lavado-Casimiro, W. (2018). Impacts of different ENSO flavors and tropical Pacific convection variability (ITCZ, SPCZ) on austral summer rainfall in South America, with a focus on Peru. International Journal of Climatology, 38(1), 420–435.',
    url: 'https://doi.org/10.1002/joc.5185',
  },
  vuille2018: {
    corta: 'Vuille et al. (2018)',
    apa: 'Vuille, M., Carey, M., Huggel, C., Buytaert, W., Rabatel, A., et al. (2018). Rapid decline of snow and ice in the tropical Andes – Impacts, uncertainties and challenges ahead. Earth-Science Reviews, 176, 195–213.',
    url: 'https://doi.org/10.1016/j.earscirev.2017.09.019',
  },
  ipcc2022: {
    corta: 'IPCC (2022)',
    apa: 'Castellanos, E., Lemos, M. F., et al. (2022). Central and South America. En H.-O. Pörtner et al. (Eds.), Climate Change 2022: Impacts, Adaptation and Vulnerability. Contribution of Working Group II to the Sixth Assessment Report of the IPCC (pp. 1689–1816). Cambridge University Press.',
    url: 'https://doi.org/10.1017/9781009325844.014',
  },
  smith2023: {
    corta: 'Smith et al. (2023)',
    apa: 'Smith, C., Baker, J. C. A., & Spracklen, D. V. (2023). Tropical deforestation causes large reductions in observed precipitation. Nature, 615, 270–275.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9995269',
  },
  glaciares2023: {
    corta: 'INAIGEM (2023)',
    apa: 'Instituto Nacional de Investigación en Glaciares y Ecosistemas de Montaña. (2023). Inventario Nacional de Glaciares y Lagunas de Origen Glaciar 2023. INAIGEM.',
    url: 'https://sinia.minam.gob.pe/documentos/inventario-nacional-glaciares-lagunas-origen-glaciar-2023',
  },
  ops2017: {
    corta: 'OPS (2017)',
    apa: 'Organización Panamericana de la Salud. (2017). Emergencia por impacto del Fenómeno “El Niño Costero” – Perú, 2017. OPS/OMS Perú.',
    url: 'https://www.paho.org/es/peru/emergencia-por-impacto-fenomeno-nino-costero-peru-2017',
  },
  chavimochic2020: {
    corta: 'Proyecto Especial Chavimochic (2021)',
    apa: 'Proyecto Especial Chavimochic. (2021). Memoria anual 2020. Gobierno Regional La Libertad.',
    url: 'https://cdn.www.gob.pe/uploads/document/file/3933664/Memoria%202020.pdf.pdf',
  },
  damonte2016: {
    corta: 'PUCP · Damonte et al. (2016)',
    apa: 'Damonte, G., Gonzales, I., & Lahud, J. (2016). La construcción del poder hídrico: agroexportadores y escasez de agua subterránea en el valle de Ica y las pampas de Villacurí. Anthropologica, 34(37), 87–114.',
    url: 'https://doi.org/10.18800/anthropologica.201602.004',
  },
} satisfies Record<string, Fuente>

export type IdFuente = keyof typeof FUENTES

/** Costa norte: donde El Niño trae las lluvias fuertes (Tumbes, Piura, Lambayeque, La Libertad). */
const COSTA_NORTE = ['24', '20', '14', '13']
/** Sur andino y altiplano: donde El Niño fuerte suele traer menos lluvia. */
const SUR_ANDINO = ['21', '08', '03', '04', '18', '23']
/** Departamentos con cordilleras glaciares (sin Cajamarca, que no tiene glaciares). */
const CON_GLACIARES = ['02', '03', '04', '05', '08', '09', '10', '12', '15', '19', '21']
/** Selva amazónica. */
const SELVA = ['01', '16', '17', '22', '25']

export interface Entrada {
  id: string
  tipo: 'causa' | 'consecuencia'
  variable: Variable
  /** Departamentos donde aplica; sin lista, en todos */
  zonas?: string[]
  /** Solo si la tendencia va en ese sentido; sin sentido, en los dos */
  sentido?: 'sube' | 'baja'
  fuentes: IdFuente[]
}

export const ENTRADAS: Entrada[] = [
  // Causas
  {
    id: 'ninoNorte',
    tipo: 'causa',
    variable: 'lluvia',
    zonas: COSTA_NORTE,
    fuentes: ['lavado2014', 'sulca2018'],
  },
  {
    id: 'ninoSur',
    tipo: 'causa',
    variable: 'lluvia',
    zonas: SUR_ANDINO,
    fuentes: ['lavado2014', 'sulca2018'],
  },
  {
    id: 'bosque',
    tipo: 'causa',
    variable: 'lluvia',
    zonas: SELVA,
    sentido: 'baja',
    fuentes: ['smith2023'],
  },
  {
    id: 'calentamientoAndes',
    tipo: 'causa',
    variable: 'temperatura',
    zonas: CON_GLACIARES,
    sentido: 'sube',
    fuentes: ['vuille2018'],
  },
  {
    id: 'calentamientoRegion',
    tipo: 'causa',
    variable: 'temperatura',
    sentido: 'sube',
    fuentes: ['ipcc2022'],
  },
  // Consecuencias
  {
    id: 'inundaciones',
    tipo: 'consecuencia',
    variable: 'lluvia',
    zonas: COSTA_NORTE,
    fuentes: ['ops2017'],
  },
  {
    id: 'glaciares',
    tipo: 'consecuencia',
    variable: 'temperatura',
    zonas: CON_GLACIARES,
    sentido: 'sube',
    fuentes: ['glaciares2023', 'vuille2018'],
  },
  {
    id: 'cultivosCalor',
    tipo: 'consecuencia',
    variable: 'temperatura',
    sentido: 'sube',
    fuentes: ['ipcc2022'],
  },
  {
    id: 'menosAgua',
    tipo: 'consecuencia',
    variable: 'lluvia',
    sentido: 'baja',
    fuentes: ['ipcc2022'],
  },
]

/** Las entradas que aplican a una zona, variable y sentido de la tendencia. */
export function entradasPara(id: string, variable: Variable, sube: boolean) {
  return ENTRADAS.filter(
    (e) =>
      e.variable === variable &&
      (!e.zonas || e.zonas.includes(id)) &&
      (!e.sentido || (e.sentido === 'sube') === sube),
  )
}

/**
 * «No todo cambio es el clima»: por qué reverdeció la costa en los valles del Caso 2. Es riego,
 * una causa humana, no la lluvia. La clave es el departamento (ubigeo).
 */
export const CAUSA_VERDE: Record<string, IdFuente[]> = {
  '13': ['chavimochic2020'],
  '11': ['damonte2016'],
}
