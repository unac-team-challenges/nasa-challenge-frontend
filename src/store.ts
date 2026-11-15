import { create } from 'zustand'
import type { Periodo, Variable } from './data/datos'
import type { Idioma, Perfil } from './i18n/textos'
import { hayWebgl } from './lib/webgl'

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

export type ModoVista = '3d' | '2d'
/** De dónde salen los datos de la sesión: la API del backend o la copia local de respaldo. */
export type Fuente = 'api' | 'local'
const GL = hayWebgl()

interface EstadoApp {
  idioma: Idioma
  perfil: Perfil
  variable: Variable
  /** Máquina del tiempo: año elegido (null = ver la tendencia) */
  anio: number | null
  reproduciendo: boolean
  setAnio: (a: number | null) => void
  setReproduciendo: (r: boolean) => void
  /** largo = 1981–2024, reciente = 2001–2024 */
  periodo: Periodo
  setPeriodo: (p: Periodo) => void
  /** Quitar los años de El Niño (solo lluvia) */
  sinNino: boolean
  /** Departamento elegido (ubigeo "01"–"25") */
  sel: string | null
  /** El informe empieza minimizado y se abre al tocar una zona (v10) */
  informeMin: boolean
  /** null = sigue al sistema */
  tema: Tema | null
  /** El navegador puede dibujar 3D (WebGL) */
  conWebgl: boolean
  modoMapa: ModoVista
  setModoMapa: (m: ModoVista) => void
  /** Se decide una sola vez por sesión (null = aún no): así el mapa no salta de una fuente a otra */
  fuente: Fuente | null
  fijarFuente: (f: Fuente) => void
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
  perfil: 'agricultor',
  variable: 'lluvia',
  // Solo la tendencia larga (1981–2024): decisión de Favio, 14 nov. El periodo reciente sigue en los datos.
  periodo: 'largo',
  // Al cambiar de periodo se vuelve a la tendencia: el año puede quedar fuera del rango
  setPeriodo: (periodo) => set({ periodo, anio: null, reproduciendo: false }),
  anio: null,
  reproduciendo: false,
  setAnio: (anio) => set(anio == null ? { anio, reproduciendo: false } : { anio }),
  setReproduciendo: (reproduciendo) => set({ reproduciendo }),
  sinNino: false,
  sel: null,
  informeMin: true,
  tema: null,
  conWebgl: GL,
  modoMapa: GL ? '3d' : '2d',
  // Sin WebGL, el 2D es la única vista posible
  setModoMapa: (modoMapa) => set({ modoMapa: GL ? modoMapa : '2d' }),
  fuente: null,
  fijarFuente: (fuente) => set((s) => (s.fuente ? {} : { fuente })),
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
