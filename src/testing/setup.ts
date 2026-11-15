import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'
import { cargarPower } from '@/data/datos'
import { cargarIdioma } from '@/i18n/textos'

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

// datos.ts y textos.ts cargan aparte la copia local y el inglés (import dinámico); main.tsx los espera
// y las pruebas también, y antes de reunirlas: algunas leen TEXTOS.en al declarar los `describe`
await Promise.all([cargarPower(), cargarIdioma('en')])
afterEach(cleanup)
