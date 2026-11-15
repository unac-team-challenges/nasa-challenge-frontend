import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'
import { cargarPower } from '@/data/datos'

// jsdom no trae matchMedia, scrollTo, Element.animate ni ResizeObserver (la app los usa al montar)
window.matchMedia ??= (consulta: string) =>
  ({
    matches: false,
    media: consulta,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList
window.scrollTo = () => {}
Element.prototype.animate ??= () => ({}) as Animation
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// findBy*/waitFor esperan 1 s por defecto: la primera pantalla que carga en frío (chunks lazy) tarda más
// con la máquina cargada y la prueba fallaba a veces. Solo se espera más cuando algo tarda; si todo
// va bien, no se nota.
configure({ asyncUtilTimeout: 5000 })

// datos.ts carga la copia local aparte (import dinámico); main.tsx la espera y las pruebas también
beforeAll(cargarPower)
afterEach(cleanup)
