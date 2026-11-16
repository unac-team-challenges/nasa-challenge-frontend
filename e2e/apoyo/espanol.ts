import { test as base } from '@playwright/test'

/**
 * La web abre en inglés por defecto; estas pruebas se escribieron con los textos en español.
 * `page.goto` agrega ?lang=es cuando la URL no elige idioma (las que piden `lang=en` no cambian).
 */
export const test = base.extend({
  page: async ({ page }, usar) => {
    // La guía de la primera visita taparía el explorador: se da por vista (e2e/guia.spec.ts la prueba aparte)
    await page.addInitScript(() => localStorage.setItem('guia-vista', '1'))
    const goto = page.goto.bind(page)
    page.goto = (url, opciones) => {
      const absoluta = /^https?:/.test(url)
      const u = new URL(url, 'http://local')
      if (!u.searchParams.has('lang')) u.searchParams.set('lang', 'es')
      return goto(absoluta ? u.href : u.pathname + u.search + u.hash, opciones)
    }
    await usar(page)
  },
})
