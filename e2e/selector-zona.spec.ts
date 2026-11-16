import { expect, type Page } from '@playwright/test'
import { test } from './apoyo/espanol'

// La lista es para teclado y lector de pantalla: oculta (sr-only, 1 px) hasta que recibe el foco
const selector = (page: Page) => page.locator('#informe').getByLabel('Departamento')
// Se mide la etiqueta, que es la que se oculta: el <select> de adentro conserva su ancho, recortado
const ancho = async (page: Page) =>
  (await page.locator('#informe label').filter({ has: page.locator('select') }).boundingBox())!
    .width

test('sin zona elegida, la lista solo aparece con el foco y lleva a un departamento', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  // el informe empieza minimizado: se abre con su botón
  await page
    .getByRole('button', { name: /informe/i })
    .first()
    .click()
  const lista = selector(page)
  await expect(lista).toBeAttached()
  expect(await ancho(page)).toBeLessThanOrEqual(1)
  await lista.focus()
  await expect.poll(() => ancho(page)).toBeGreaterThan(40)

  // 25 departamentos + la invitación (deshabilitada), en orden alfabético
  const nombres = await lista.locator('option').allTextContents()
  expect(nombres).toHaveLength(26)
  expect(nombres[1]).toBe('Amazonas')
  expect(nombres.slice(1)).toEqual([...nombres.slice(1)].sort((a, b) => a.localeCompare(b, 'es')))

  await lista.selectOption({ label: 'Puno' })
  await expect(page).toHaveURL(/\/zona\/21/)
  await expect(page.locator('#informe')).toContainText('Puno')
})

test('con una zona elegida, la lista cambia de departamento y marca el actual', async ({
  page,
}) => {
  await page.goto('/zona/08?sinwebgl')
  await expect(page.locator('#informe')).toContainText('Cusco')
  expect(await ancho(page)).toBeLessThanOrEqual(1)
  await expect(selector(page)).toHaveValue('08')
  await selector(page).focus()
  await selector(page).selectOption({ label: 'Tumbes' })
  await expect(page).toHaveURL(/\/zona\/24/)
  await expect(page.locator('#informe h2')).toContainText('Tumbes')
  await expect(selector(page)).toHaveValue('24')
})

test('el selector sigue el idioma', async ({ page }) => {
  await page.goto('/zona/08?sinwebgl&lang=en')
  await expect(page.locator('#informe').getByLabel('Department')).toHaveValue('08')
})

test.describe('celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('sin foco no se ve; con foco cabe en la ficha (≥ 36 px de alto)', async ({ page }) => {
    await page.goto('/zona/08?sinwebgl')
    await expect(page.locator('#informe')).toContainText('Cusco')
    expect(await ancho(page)).toBeLessThanOrEqual(1)
    await selector(page).focus()
    await expect.poll(() => ancho(page)).toBeGreaterThan(40)
    const caja = (await selector(page).boundingBox())!
    expect(caja.height).toBeGreaterThan(35.5)
    expect(caja.x + caja.width).toBeLessThanOrEqual(390)
  })
})
