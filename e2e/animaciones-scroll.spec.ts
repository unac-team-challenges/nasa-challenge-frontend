import { expect, type Page } from '@playwright/test'
import { test } from './apoyo/espanol'

test.use({ viewport: { width: 390, height: 844 } })

const nombreAnimacion = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).animationName)

const opacidad = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => Number(getComputedStyle(el).opacity))

test.beforeEach(async ({ page }) => {
  const soporta = await page.evaluate(() => CSS.supports('animation-timeline: view()'))
  test.skip(!soporta, 'este navegador no tiene animation-timeline: la página se ve sin animar')
})

test('las secciones de la metodología entran al desplazarse', async ({ page }) => {
  await page.goto('/metodologia')
  const ultima = '#m-creditos >> xpath=..'
  expect(await nombreAnimacion(page, ultima)).toBe('entrada')
  // lejos de la pantalla: todavía no entra
  expect(await opacidad(page, ultima)).toBeLessThan(0.05)
  await page.locator(ultima).evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect.poll(() => opacidad(page, ultima)).toBe(1)
  // el encabezado de la página no se anima
  expect(await nombreAnimacion(page, 'article > header')).toBe('none')
})

test('con «reducir movimiento» no hay animación de entrada', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/metodologia')
  const ultima = '#m-creditos >> xpath=..'
  expect(await nombreAnimacion(page, ultima)).toBe('none')
  expect(await opacidad(page, ultima)).toBe(1)
})

test('en la ficha, los bloques bajo el título entran al desplazarse; el título no', async ({
  page,
}) => {
  await page.goto('/zona/08?sinwebgl')
  await expect(page.locator('#informe')).toContainText('Cusco')
  const bloques = page.locator('#informe .aparece-hijos > *')
  expect(await bloques.count()).toBeGreaterThan(2)
  expect(await bloques.first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  expect(await bloques.nth(1).evaluate((el) => getComputedStyle(el).animationName)).toBe('entrada')
})
