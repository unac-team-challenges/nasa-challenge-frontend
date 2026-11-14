/** Textos de la interfaz en español e inglés (del prototipo v2). */
export type Idioma = 'es' | 'en'
export type Perfil = 'publico' | 'agricultor' | 'municipalidad' | 'estudiante'

export const TEXTOS = {
  es: {
    marca: 'Detective del Perú',
    inicio: 'Detective del Perú: inicio',
    cambiarIdioma: 'Cambiar idioma',
    cambiarTema: 'Cambiar tema',
    heroH: '¿Qué está cambiando en tu zona del Perú?',
    heroLead:
      'Datos de satélites de la NASA de 2000 a 2025. En el mapa, cada departamento sube si llueve más y se hunde si llueve menos.',
    stripesCap:
      'El Perú año por año: cada franja es la lluvia de un año frente al promedio 2000–2025.',
    stripeTitle: (y: number, p: string) => `${y}: ${p} frente al promedio`,
    whoH: '¿Quién eres? Así te lo explicamos',
    perfiles: {
      publico: ['Público general', 'Lo esencial, en frases cortas'],
      agricultor: ['Agricultor', 'Lluvia y años secos, en palabras de campo'],
      municipalidad: ['Municipalidad', 'Cifras claras para planificar'],
      estudiante: ['Estudiante', 'Con el detalle de cómo se calcula'],
    } satisfies Record<Perfil, [string, string]>,
    exploreBtn: 'Explorar el mapa',
    heroCase: 'Abrir el Expediente 1',
    sample: 'Prototipo con datos de ejemplo',
    heroCap: 'Arrastra para girar el Perú. Altura: cambio de la lluvia por década, 2000–2025.',
    ocean: 'Océano Pacífico',
    sinWebgl: 'Tu navegador no puede mostrar el mapa en 3D. Pronto verás aquí la versión en 2D.',
    mapaAria:
      'Mapa del Perú en 3D: cada departamento sube o se hunde según cuánto cambió la lluvia',
  },
  en: {
    marca: 'Peru Trend Detective',
    inicio: 'Peru Trend Detective: home',
    cambiarIdioma: 'Change language',
    cambiarTema: 'Change theme',
    heroH: 'What is changing in your part of Peru?',
    heroLead:
      'NASA satellite data from 2000 to 2025. On the map, each department rises where it rains more and sinks where it rains less.',
    stripesCap:
      "Peru year by year: each stripe is one year's rainfall compared with the 2000–2025 average.",
    stripeTitle: (y: number, p: string) => `${y}: ${p} vs average`,
    whoH: "Who are you? We'll explain it your way",
    perfiles: {
      publico: ['General public', 'The essentials, in short sentences'],
      agricultor: ['Farmer', 'Rain and dry years, in plain words'],
      municipalidad: ['Local government', 'Clear figures for planning'],
      estudiante: ['Student', 'With the details of how it is calculated'],
    } satisfies Record<Perfil, [string, string]>,
    exploreBtn: 'Explore the map',
    heroCase: 'Open Case file 1',
    sample: 'Prototype with sample data',
    heroCap: 'Drag to turn Peru. Height: rainfall change per decade, 2000–2025.',
    ocean: 'Pacific Ocean',
    sinWebgl: 'Your browser cannot show the 3D map. The 2D version will appear here soon.',
    mapaAria: 'Map of Peru in 3D: each department rises or sinks by how much rainfall changed',
  },
}

/** Orden de los perfiles en la portada. */
export const ORDEN_PERFILES: Perfil[] = ['agricultor', 'municipalidad', 'estudiante', 'publico']
