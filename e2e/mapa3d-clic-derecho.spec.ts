import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

// Chromium sin pantalla no trae WebGL: SwiftShader lo da por software
test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } })

// Con WebGL (sin ?sinwebgl): el clic derecho no elige departamento; el izquierdo, en el mismo punto, sí
test('mapa 3D: el clic derecho no hace nada', async ({ page }) => {
  await page.goto('/explorar')
  const lienzo = page.locator('canvas').first()
  const hay3d = await lienzo
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)
  test.skip(!hay3d, 'sin WebGL el mapa es 2D')

  const caja = (await lienzo.boundingBox())!
  const x = caja.x + caja.width / 2
  const y = caja.y + caja.height / 2
  await page.mouse.click(x, y, { button: 'right' })
  await page.waitForTimeout(500)
  await expect(page).toHaveURL(/\/explorar/)

  await page.mouse.click(x, y)
  await expect(page).toHaveURL(/\/zona\//)
})
