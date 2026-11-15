import { create } from 'zustand'
import type { Periodo } from '@/data/datos'
import type { Idioma } from '@/i18n/textos'
import { hayWebgl } from '@/utils/webgl'

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
  /** largo = 1981–2024, reciente = 2001–2024 */
  periodo: Periodo
  setPeriodo: (p: Periodo) => void
  /** Quitar los años de El Niño (solo lluvia) */
  sinNino: boolean
  /** El informe empieza minimizado y se abre al tocar una zona (v10) */
  informeMin: boolean
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
  setSinNino: (s: boolean) => void
  setInformeMin: (m: boolean) => void
  alternarTema: () => void
}

export const useApp = create<EstadoApp>((set, get) => ({
  idioma: idiomaInicial(),
  // 2001–2024 por defecto: el periodo decidido el 14 nov (backend, docs/tendencias.md) y el que sirve la API.
  periodo: 'reciente',
  setPeriodo: (periodo) => set({ periodo, reproduciendo: false }),
  reproduciendo: false,
  setReproduciendo: (reproduciendo) => set({ reproduciendo }),
  sinNino: false,
  informeMin: !zonaEnUrl(),
  tema: null,
  conWebgl: GL,
  modoMapa: GL ? '3d' : '2d',
  // Sin WebGL, el 2D es la única vista posible
  setModoMapa: (modoMapa) => set({ modoMapa: GL ? modoMapa : '2d' }),
  girando: true,
  setGirando: (girando) => set({ girando }),
  fuente: null,
  fijarFuente: (fuente) => set((s) => (s.fuente ? {} : { fuente })),
  setIdioma: (idioma) => set({ idioma }),
  setSinNino: (sinNino) => set({ sinNino }),
  setInformeMin: (informeMin) => set({ informeMin }),
  alternarTema: () => {
    const actual = get().tema ?? temaDelSistema()
    const tema: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
    document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light'
    set({ tema })
  },
}))
