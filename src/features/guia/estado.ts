import { create } from 'zustand'

const CLAVE = 'guia-vista'
/** La pista de AyudaModo dice lo mismo que el paso de la barra de tiempo: no sale encima del tour */
const CLAVE_AYUDA_MODO = 'ayuda-modo-tiempo'

export function yaVista() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

export function marcarVista() {
  try {
    localStorage.setItem(CLAVE, '1')
    localStorage.setItem(CLAVE_AYUDA_MODO, '1')
  } catch {
    /* sin almacenamiento (modo privado): la guía vuelve a salir en la próxima visita */
  }
}

interface EstadoGuia {
  /** Índice del paso a la vista; null = guía cerrada */
  paso: number | null
  abrir: () => void
  ir: (paso: number) => void
  cerrar: () => void
}

/** Lo comparten el tour y el botón «?» de los controles del mapa. */
export const useGuia = create<EstadoGuia>((set) => ({
  paso: null,
  abrir: () => set({ paso: 0 }),
  ir: (paso) => set({ paso }),
  cerrar: () => set({ paso: null }),
}))
