import { create } from 'zustand'
import type { Variable } from './data/ejemplo'
import type { Idioma, Perfil } from './i18n/textos'

export type Tema = 'claro' | 'oscuro'

function idiomaInicial(): Idioma {
  try {
    return new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function temaDelSistema(): Tema {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

interface EstadoApp {
  idioma: Idioma
  perfil: Perfil
  variable: Variable
  /** Quitar los años de El Niño (solo lluvia) */
  sinNino: boolean
  /** Departamento elegido (ubigeo "01"–"25") */
  sel: string | null
  /** El informe empieza minimizado y se abre al tocar una zona (v10) */
  informeMin: boolean
  /** null = sigue al sistema */
  tema: Tema | null
  setIdioma: (i: Idioma) => void
  setPerfil: (p: Perfil) => void
  setVariable: (v: Variable) => void
  setSinNino: (s: boolean) => void
  seleccionar: (id: string | null) => void
  setInformeMin: (m: boolean) => void
  alternarTema: () => void
}

export const useApp = create<EstadoApp>((set, get) => ({
  idioma: idiomaInicial(),
  perfil: 'publico',
  variable: 'lluvia',
  sinNino: false,
  sel: null,
  informeMin: true,
  tema: null,
  setIdioma: (idioma) => set({ idioma }),
  setPerfil: (perfil) => set({ perfil }),
  setVariable: (variable) => set({ variable, sinNino: false }),
  setSinNino: (sinNino) => set({ sinNino }),
  seleccionar: (sel) => set(sel ? { sel, informeMin: false } : { sel }),
  setInformeMin: (informeMin) => set({ informeMin }),
  alternarTema: () => {
    const actual = get().tema ?? temaDelSistema()
    const tema: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
    document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light'
    set({ tema })
  },
}))
