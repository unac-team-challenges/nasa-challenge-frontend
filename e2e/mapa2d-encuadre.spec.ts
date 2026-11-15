import { expect, test, type Page } from '@playwright/test'

/** Abre el explorador con el mapa en 2D y espera a que dibuje las zonas. */
async function abrir2D(page: Page) {
  await page.goto('/explorar')
  await page
    .getByRole('group', { name: 'Vista del mapa' })
    .getByRole('button', { name: '2D' })
    .click()
  await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).waitFor()
  await page.waitForTimeout(400) // el margen se mide con ResizeObserver, un cuadro después
}

/** Rectángulo que ocupa el Perú (unión de todas sus zonas) y el de cada panel marcado. */
const medir = (page: Page) =>
  page.evaluate(() => {
    const zonas = [...document.querySelectorAll('path.zona2d')].map((z) =>
      z.getBoundingClientRect(),
    )
    const peru = {
      top: Math.min(...zonas.map((r) => r.top)),
      bottom: Math.max(...zonas.map((r) => r.bottom)),
      left: Math.min(...zonas.map((r) => r.left)),
      right: Math.max(...zonas.map((r) => r.right)),
    }
    const paneles = [...document.querySelectorAll('[data-cubre-mapa]')]
      .map((p) => p.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
    return { peru, paneles }
  })

test.describe('celular (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('ningún panel tapa el Perú; con la ayuda del modo abierta solo lo roza', async ({
    page,
  }) => {
    await abrir2D(page)
    // Cuánto se mete el panel más metido en el Perú (px de alto): 0 = no lo toca
    const solape = async () => {
      const { peru, paneles } = await medir(page)
      expect(paneles.length).toBeGreaterThan(0)
      return Math.max(
        0,
        ...paneles
          .filter((p) => p.left < peru.right && p.right > peru.left)
          .map((p) => Math.min(p.bottom, peru.bottom) - Math.max(p.top, peru.top)),
      )
    }
    // Con la ayuda abierta hay un aviso más: el tope del 55 % del alto impide evitarlo del todo
    expect(await solape()).toBeLessThanOrEqual(40)

    await page
      .getByRole('button', { name: /cerrar/i })
      .first()
      .click()
    await page.waitForTimeout(400)
    expect(await solape()).toBe(0)
  })

  test('elegir una zona sigue acercando el mapa a ella', async ({ page }) => {
    await abrir2D(page)
    const antes = await page.locator('.zoom2d').evaluate((el) => getComputedStyle(el).transform)
    // El clic va a la zona misma: en pantalla, su centro puede caer en el borde de toque de una vecina chica
    await page.getByRole('button', { name: /^Cusco/ }).dispatchEvent('click')
    await expect(page).toHaveURL(/\/zona\/08/)
    await expect
      .poll(() => page.locator('.zoom2d').evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(antes)
  })
})

test('en escritorio el mapa sigue ocupando toda la caja', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await abrir2D(page)
  const [svg, caja] = await Promise.all([
    page.locator('.zoom2d svg').boundingBox(),
    page.locator('.zoom2d').boundingBox(),
  ])
  expect(Math.round(svg!.height)).toBe(Math.round(caja!.height))
  expect(Math.round(svg!.y)).toBe(Math.round(caja!.y))
})
