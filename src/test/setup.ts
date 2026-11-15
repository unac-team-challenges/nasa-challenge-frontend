import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom no trae matchMedia, scrollTo ni Element.animate (la app los usa al montar)
window.matchMedia ??= (consulta: string) =>
  ({
    matches: false,
    media: consulta,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList
window.scrollTo = () => {}
Element.prototype.animate ??= () => ({}) as Animation

afterEach(cleanup)
