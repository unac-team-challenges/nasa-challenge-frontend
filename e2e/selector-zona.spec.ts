import { expect, type Page } from '@playwright/test'
import { test } from './apoyo/espanol'

const selector = (page: Page) => page.locator('#informe').getByLabel('Departamento')

test('sin zona elegida, la lista de departamentos lleva a uno sin tocar el mapa', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  // el informe empieza minimizado: se abre con su botón
  await page
    .getByRole('button', { name: /informe/i })
    .first()
    .click()
  const lista = selector(page)
  await expect(lista).toBeVisible()
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
  await expect(selector(page)).toHaveValue('08')
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

  test('la lista cabe en la ficha y se puede tocar (≥ 36 px de alto)', async ({ page }) => {
    await page.goto('/zona/08?sinwebgl')
    await expect(page.locator('#informe')).toContainText('Cusco')
    const caja = (await selector(page).boundingBox())!
    expect(caja.height).toBeGreaterThan(35.5)
    expect(caja.x + caja.width).toBeLessThanOrEqual(390)
  })
})
