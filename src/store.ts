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
  /** null = sigue al sistema */
  tema: Tema | null
  setIdioma: (i: Idioma) => void
  setPerfil: (p: Perfil) => void
  alternarTema: () => void
}

export const useApp = create<EstadoApp>((set, get) => ({
  idioma: idiomaInicial(),
  perfil: 'publico',
  variable: 'lluvia',
  tema: null,
  setIdioma: (idioma) => set({ idioma }),
  setPerfil: (perfil) => set({ perfil }),
  alternarTema: () => {
    const actual = get().tema ?? temaDelSistema()
    const tema: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
    document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light'
    set({ tema })
  },
}))
