import { expect, type Page } from '@playwright/test'
import { test } from './apoyo/espanol'

/**
 * Abre la página y espera a que la cabecera ya escuche el desplazamiento. useOcultarAlBajar se
 * suscribe en un useEffect, después de dibujar: un scrollTo justo tras el goto podía llegar antes
 * y perderse (la cabecera quedaba visible y la prueba fallaba a veces). Dos cuadros bastan para
 * que corran los efectos.
 */
const abrir = async (page: Page, url: string) => {
  await page.goto(url)
  await expect(page.locator('body > div header').first()).toBeVisible()
  await page.evaluate(
    () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok(null)))),
  )
}

/** Baja o sube la página y espera a que el cuadro de animación procese el desplazamiento. */
const irA = async (page: Page, y: number) => {
  await page.evaluate((y) => scrollTo(0, y), y)
  await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => ok(null))))
}

/** Borde de abajo de la cabecera en pantalla: ≤ 0 si está escondida arriba. */
const bordeAbajo = (page: Page) =>
  page
    .locator('body > div header')
    .first()
    .evaluate((el) => el.getBoundingClientRect().bottom)

test.describe('celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('la cabecera se oculta al bajar y vuelve al subir', async ({ page }) => {
    await abrir(page, '/metodologia')
    expect(await bordeAbajo(page)).toBeGreaterThan(40)

    await irA(page, 700)
    await expect.poll(() => bordeAbajo(page)).toBeLessThanOrEqual(1)

    // un poco hacia arriba basta para que vuelva
    await irA(page, 600)
    await expect.poll(() => bordeAbajo(page)).toBeGreaterThan(40)

    // y cerca del tope no se oculta aunque se baje
    await irA(page, 0)
    await irA(page, 40)
    await expect.poll(() => bordeAbajo(page)).toBeGreaterThan(0)
  })

  test('con el foco dentro de la cabecera no se oculta', async ({ page }) => {
    await abrir(page, '/metodologia')
    await irA(page, 700)
    await expect.poll(() => bordeAbajo(page)).toBeLessThanOrEqual(1)
    await page.locator('body > div header').first().getByRole('button', { name: 'Lluvia' }).focus()
    await expect.poll(() => bordeAbajo(page)).toBeGreaterThan(40)
  })
})

test('en escritorio la cabecera no se oculta', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await abrir(page, '/metodologia')
  await irA(page, 900)
  await page.waitForTimeout(400)
  expect(await bordeAbajo(page)).toBeGreaterThan(40)
})
