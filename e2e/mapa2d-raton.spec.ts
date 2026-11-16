import { expect, type Page } from '@playwright/test'
import { test } from './apoyo/espanol'

/** Zoom y desplazamiento actuales del mapa (matriz CSS del contenedor .zoom2d). */
const vista = (page: Page) =>
  page.locator('.zoom2d').evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
    return { k: m.a, tx: m.e, ty: m.f }
  })

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 860 })
  await page.goto('/explorar?sinwebgl')
  await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).waitFor()
})

test('con el botón derecho el mapa 2D se arrastra libremente, sin menú ni elegir zona', async ({
  page,
}) => {
  const c = (await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).boundingBox())!
  const [cx, cy] = [c.x + c.width / 2, c.y + c.height * 0.6]
  // Cuenta los menús del navegador que no se cancelaron
  await page.evaluate(() => {
    const w = window as unknown as { menus: number }
    w.menus = 0
    addEventListener('contextmenu', (e) => e.defaultPrevented || w.menus++)
  })
  const antes = await vista(page)
  expect(antes.k).toBeCloseTo(1, 2)

  // Sin zoom también se mueve (con el ratón no hay pellizco)
  await page.mouse.move(cx, cy)
  await page.mouse.down({ button: 'right' })
  await page.mouse.move(cx - 120, cy + 60, { steps: 6 })
  await page.mouse.up({ button: 'right' })
  const despues = await vista(page)
  expect(despues.tx).toBeCloseTo(antes.tx - 120, 0)
  expect(despues.ty).toBeCloseTo(antes.ty + 60, 0)
  expect(despues.k).toBeCloseTo(1, 2)
  expect(await page.evaluate(() => (window as unknown as { menus: number }).menus)).toBe(0)
  await expect(page).not.toHaveURL(/\/zona\//)

  // Arrastrar mucho tiene tope: el mapa no se pierde (como mucho media caja fuera del borde)
  await page.mouse.move(cx, cy)
  await page.mouse.down({ button: 'right' })
  await page.mouse.move(cx + 5000, cy + 5000, { steps: 4 })
  await page.mouse.up({ button: 'right' })
  const tope = await vista(page)
  expect(tope.tx).toBeLessThanOrEqual(c.width * 0.5 + 1)
  expect(tope.ty).toBeLessThanOrEqual(c.height * 0.5 + 1)

  // El botón de recentrar vuelve a la vista inicial
  await page.getByRole('button', { name: 'Volver a la vista inicial' }).first().click()
  await expect.poll(async () => (await vista(page)).tx).toBeCloseTo(antes.tx, 0)
})

test('el clic izquierdo sigue eligiendo el departamento', async ({ page }) => {
  await page.getByRole('button', { name: /^Loreto/ }).click()
  await expect(page).toHaveURL(/\/zona\/16/)
})
