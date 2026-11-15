import { create } from 'zustand'
import { cargarIdioma, type Idioma } from '@/i18n/textos'
import { hayWebgl } from '@/utils/webgl'
import { SIN_MARGEN, type Margen } from '@/utils/margenMapa'

export type Tema = 'claro' | 'oscuro'

function idiomaInicial(): Idioma {
  try {
    return new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

/** Un enlace a /zona/20 abre el informe de esa zona */
function zonaEnUrl(): boolean {
  try {
    return location.pathname.startsWith('/zona/')
  } catch {
    return false
  }
}

function temaDelSistema(): Tema {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export type ModoVista = '3d' | '2d'
/** De dónde salen los datos de la sesión: la API del backend o la copia local de respaldo. */
export type Fuente = 'api' | 'local'
const GL = hayWebgl()

interface EstadoApp {
  idioma: Idioma
  reproduciendo: boolean
  setReproduciendo: (r: boolean) => void
  /** El informe empieza minimizado y se abre al tocar una zona (v10) */
  informeMin: boolean
  /** La última zona elegida salió de un toque en el mapa (y no de la Pista o de la URL) */
  zonaDesdeMapa: boolean
  /** Lo que tapan los paneles del explorador arriba y abajo del mapa 2D (px); lo mide el explorador */
  margenMapa: Margen
  /** Sube cada vez que se pide volver a la vista inicial: el mapa 2D deshace su zoom manual */
  reinicio2d: number
  /** null = sigue al sistema */
  tema: Tema | null
  /** El navegador puede dibujar 3D (WebGL) */
  conWebgl: boolean
  modoMapa: ModoVista
  setModoMapa: (m: ModoVista) => void
  /** El mapa 3D gira solo (lo avisa la escena; lo usa el botón de giro) */
  girando: boolean
  setGirando: (g: boolean) => void
  /** Se decide una sola vez por sesión (null = aún no): así el mapa no salta de una fuente a otra */
  fuente: Fuente | null
  fijarFuente: (f: Fuente) => void
  setIdioma: (i: Idioma) => void
  setInformeMin: (m: boolean) => void
  alternarTema: () => void
}

export const useApp = create<EstadoApp>((set, get) => ({
  idioma: idiomaInicial(),
  reproduciendo: false,
  setReproduciendo: (reproduciendo) => set({ reproduciendo }),
  informeMin: !zonaEnUrl(),
  zonaDesdeMapa: false,
  margenMapa: SIN_MARGEN,
  reinicio2d: 0,
  tema: null,
  conWebgl: GL,
  modoMapa: GL ? '3d' : '2d',
  // Sin WebGL, el 2D es la única vista posible
  setModoMapa: (modoMapa) => set({ modoMapa: GL ? modoMapa : '2d' }),
  girando: true,
  setGirando: (girando) => set({ girando }),
  fuente: null,
  fijarFuente: (fuente) => set((s) => (s.fuente ? {} : { fuente })),
  // El inglés es un chunk aparte: el idioma cambia cuando ya está cargado
  setIdioma: (idioma) => void cargarIdioma(idioma).then(() => set({ idioma })),
  setInformeMin: (informeMin) => set({ informeMin }),
  alternarTema: () => {
    const actual = get().tema ?? temaDelSistema()
    const tema: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
    document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light'
    set({ tema })
  },
}))
