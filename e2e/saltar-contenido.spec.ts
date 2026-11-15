import { expect, test } from '@playwright/test'

test('«Saltar al contenido» solo se ve con el foco y lleva al contenido', async ({ page }) => {
  await page.goto('/')
  const enlace = page.getByRole('link', { name: 'Saltar al contenido' })
  await expect(enlace).toBeAttached()
  // Fuera de pantalla (sr-only): 1 px
  expect((await enlace.boundingBox())!.width).toBeLessThanOrEqual(1)
  await page.keyboard.press('Tab')
  await expect(enlace).toBeFocused()
  expect((await enlace.boundingBox())!.width).toBeGreaterThan(40)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  expect(new URL(page.url()).hash).toBe('')
})
