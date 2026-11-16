import type { Idioma } from '@/i18n/textos'

/** Etiquetas que ya existen en la app: sirven de ancla mientras falte el data-guia */
export interface Etiquetas {
  variableLbl: string
  perfilLbl: string
  timeAria: string
}

export interface Paso {
  /** Selector CSS de lo que se resalta; sin ancla, la tarjeta sale al centro */
  ancla?: (e: Etiquetas) => string
  /** Abre un departamento de ejemplo para que se vea el informe */
  ejemplo?: true
  texto: Record<Idioma, { titulo: string; cuerpo: string }>
}

/** Departamento que se abre de ejemplo si no hay ninguno elegido (Piura). */
export const ZONA_EJEMPLO = '20'

const guia = (nombre: string) => `[data-guia="${nombre}"]`

/**
 * El tour, en el orden en que alguien nuevo descubre la pantalla: primero qué está viendo,
 * después qué puede tocar. Sin palabras técnicas (nada de «anomalía» ni «pendiente»).
 * Los textos viven aquí y no en i18n/textos.ts para no depender de los cambios de ese archivo.
 */
export const PASOS: Paso[] = [
  {
    texto: {
      es: {
        titulo: '¿Cómo cambió el clima donde vives?',
        cuerpo:
          'Este es el Perú, dibujado con datos de satélites de la NASA. En un minuto te mostramos cómo usarlo.',
      },
      en: {
        titulo: 'How has the climate changed where you live?',
        cuerpo:
          'This is Peru, drawn with data from NASA satellites. In one minute we will show you how to use it.',
      },
    },
  },
  {
    ancla: () => guia('mapa'),
    texto: {
      es: {
        titulo: 'Cada departamento es una columna',
        cuerpo:
          'Si sube, en estos años llueve más (o hace más calor) que antes. Si se hunde, llueve menos. Si queda plana, casi no cambió. Arrastra el mapa con el dedo o el mouse para girarlo.',
      },
      en: {
        titulo: 'Each department is a column',
        cuerpo:
          'If it rises, over these years it has rained more (or got warmer) than before. If it sinks, it rains less. If it stays flat, little changed. Drag the map with your finger or mouse to turn it.',
      },
    },
  },
  {
    ancla: () => guia('leyenda'),
    texto: {
      es: {
        titulo: '¿Cuánto creerle?',
        cuerpo:
          'Color lleno: el cambio es real. Con puntitos: puede ser casualidad. Solo el borde: faltan datos. Toca aquí cuando quieras para volver a leerlo.',
      },
      en: {
        titulo: 'How much to trust it?',
        cuerpo:
          'Solid colour: the change is real. Dotted: it may be chance. Only an outline: not enough data. Tap here any time to read it again.',
      },
    },
  },
  {
    ancla: (e) => `${guia('variables')}, [role="group"][aria-label="${e.variableLbl}"]`,
    texto: {
      es: {
        titulo: '¿Qué quieres mirar?',
        cuerpo:
          'Elige lluvia, temperatura o vegetación. En vegetación, el mapa 3D sube cada departamento según su verdor y planta sus árboles.',
      },
      en: {
        titulo: 'What do you want to see?',
        cuerpo:
          'Pick rainfall, temperature or vegetation. In vegetation, the 3D map raises each department by its greenness and grows its trees.',
      },
    },
  },
  {
    ancla: (e) => `${guia('perfil')}, [role="group"][aria-label="${e.perfilLbl}"]`,
    texto: {
      es: {
        titulo: '¿Cómo te lo explicamos?',
        cuerpo:
          'Agricultor: en palabras de campo, con los años secos y lluviosos. Estudiante: con los números y cómo se calcularon. Puedes cambiar cuando quieras.',
      },
      en: {
        titulo: 'How should we explain it?',
        cuerpo:
          'Farmer: in plain words, with the dry and rainy years. Student: with the numbers and how they were calculated. You can switch any time.',
      },
    },
  },
  {
    ancla: (e) => `${guia('tiempo')}, [role="group"][aria-label="${e.timeAria}"]`,
    texto: {
      es: {
        titulo: 'Todos los años o uno solo',
        cuerpo:
          '«Tendencia» muestra cuánto cambió en todos estos años. «Por año» te deja ver un año especial, como uno con El Niño, y compararlo con lo normal. También puedes darle play.',
      },
      en: {
        titulo: 'All the years or just one',
        cuerpo:
          '"Trend" shows how much it changed over all these years. "By year" lets you look at one special year, like an El Niño year, and compare it with normal. You can also press play.',
      },
    },
  },
  {
    ancla: () => guia('mapa'),
    ejemplo: true,
    texto: {
      es: {
        titulo: 'Toca tu departamento',
        cuerpo:
          'Cuando cierres esta guía, toca en el mapa el departamento que te interesa y se abre su informe. Para mostrarte, ya abrimos uno.',
      },
      en: {
        titulo: 'Tap your department',
        cuerpo:
          'When you close this guide, tap the department you care about on the map and its report opens. To show you, we opened one.',
      },
    },
  },
  {
    ancla: () => guia('informe'),
    texto: {
      es: {
        titulo: 'Aquí está la respuesta',
        cuerpo:
          'Te dice si ahora llueve más o menos, qué tan seguro es y qué años fueron malos. Baja para leer más. Con la flecha lo cierras.',
      },
      en: {
        titulo: 'Here is the answer',
        cuerpo:
          'It tells you whether it now rains more or less, how sure that is and which years were bad. Scroll down to read more. The arrow closes it.',
      },
    },
  },
  {
    ancla: () => guia('controles'),
    texto: {
      es: {
        titulo: 'Botones del mapa',
        cuerpo:
          'Gira el mapa o detenlo, vuelve al inicio, pásalo a 2D si tu celular va lento y comparte el enlace de lo que estás viendo. En el celular están detrás del botón «⋯». El botón «?» repite esta guía.',
      },
      en: {
        titulo: 'Map buttons',
        cuerpo:
          'Turn the map or stop it, go back to the start, switch to 2D if your phone is slow and share a link to what you are seeing. On a phone they are behind the "⋯" button. The "?" button replays this guide.',
      },
    },
  },
  {
    ancla: () => guia('metodologia'),
    texto: {
      es: {
        titulo: '¿De dónde salen los datos?',
        cuerpo:
          'Aquí contamos qué satélites usamos y cómo lo calculamos todo. Listo: ya puedes explorar.',
      },
      en: {
        titulo: 'Where does the data come from?',
        cuerpo:
          'Here we tell you which satellites we use and how we calculate everything. Done: you can start exploring.',
      },
    },
  },
]

export const UI: Record<
  Idioma,
  {
    atras: string
    siguiente: string
    listo: string
    saltar: string
    ver: string
    contador: (n: number, total: number) => string
  }
> = {
  es: {
    atras: 'Atrás',
    siguiente: 'Siguiente',
    listo: 'Listo',
    saltar: 'Saltar la guía',
    ver: 'Ver la guía',
    contador: (n, total) => `${n} de ${total}`,
  },
  en: {
    atras: 'Back',
    siguiente: 'Next',
    listo: 'Done',
    saltar: 'Skip the guide',
    ver: 'Show the guide',
    contador: (n, total) => `${n} of ${total}`,
  },
}
