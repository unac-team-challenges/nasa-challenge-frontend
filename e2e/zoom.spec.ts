import { expect, type Locator } from '@playwright/test'
import { test } from './apoyo/espanol'

/**
 * El zoom del navegador (Ctrl +/-) achica o agranda el viewport en px CSS y cambia el
 * devicePixelRatio. Se emula así: una laptop 1366×768 al 150 % ve 910×438 px CSS con DPR 1,5.
 * Con poco alto la página debe pasar al diseño apilado (el de celular), no deformarse.
 */
const CASOS = [
  { nombre: 'laptop al 100 %', viewport: { width: 1366, height: 657 }, dpr: 1 },
  { nombre: 'laptop al 150 %', viewport: { width: 910, height: 438 }, dpr: 1.5 },
  { nombre: 'FHD al 200 %', viewport: { width: 960, height: 470 }, dpr: 2 },
  { nombre: 'FHD al 50 %', viewport: { width: 3840, height: 1880 }, dpr: 0.5 },
  { nombre: 'celular angosto', viewport: { width: 360, height: 740 }, dpr: 3 },
  { nombre: 'celular acostado', viewport: { width: 740, height: 360 }, dpr: 3 },
]

const RUTAS = [
  '/?sinwebgl',
  '/explorar?sinwebgl&variable=temperatura',
  '/explorar?sinwebgl&variable=temperatura&anio=2017',
  '/metodologia',
]

async function seCruzan(a: Locator, b: Locator) {
  const [p, q] = await Promise.all([a.boundingBox(), b.boundingBox()])
  if (!p || !q) return false
  return p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height
}

for (const c of CASOS) {
  test.describe(c.nombre, () => {
    test.use({ viewport: c.viewport, deviceScaleFactor: c.dpr })

    for (const ruta of RUTAS) {
      test(`${ruta}: sin scroll horizontal ni paneles encimados`, async ({ page }) => {
        await page.goto(ruta)
        await expect(page.locator('main#contenido')).toBeVisible()

        const desborde = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(desborde).toBeLessThanOrEqual(0)

        if (!ruta.startsWith('/explorar')) return
        const barra = page.locator('[data-guia="tiempo"]')
        await expect(barra).toBeVisible()
        // Entera a la vista sin bajar: con el diseño de escritorio en poco alto quedaba cortada
        const caja = await barra.boundingBox()
        expect(caja!.y + caja!.height).toBeLessThanOrEqual(c.viewport.height)
        expect(await seCruzan(page.locator('[data-guia="leyenda"]'), barra)).toBe(false)
        const menu = page.getByRole('button', { name: 'Controles del mapa' })
        if (await menu.isVisible()) expect(await seCruzan(menu, barra)).toBe(false)
      })
    }
  })
}
