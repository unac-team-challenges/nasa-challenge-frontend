import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

test('«Saltar al contenido» solo se ve con el foco y lleva al contenido', async ({ page }) => {
  await page.goto('/')
  const enlace = page.getByRole('link', { name: 'Saltar al contenido' })
  await expect(enlace).toBeAttached()
  // Fuera de pantalla (sr-only): 1 px
  expect((await enlace.boundingBox())!.width).toBeLessThanOrEqual(1)
  await page.keyboard.press('Tab')
  await expect(enlace).toBeFocused()
  // Con el foco: fijo arriba a la izquierda y por encima de la cabecera
  const caja = (await enlace.boundingBox())!
  expect(caja.width).toBeGreaterThan(40)
  expect(caja.y).toBeLessThan(40)
  expect(await enlace.evaluate((el) => getComputedStyle(el).position)).toBe('fixed')
  await page.keyboard.press('Enter')
  const main = page.getByRole('main')
  await expect(main).toBeFocused()
  // El foco en main no dibuja un borde alrededor de toda la página
  expect(await main.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none')
  expect(new URL(page.url()).hash).toBe('')
})

test('en inglés dice «Skip to content» y cabe en un celular', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/explorar?lang=en')
  const enlace = page.getByRole('link', { name: 'Skip to content' })
  // main.tsx dibuja después de cargar datos e idioma: sin esperar, el Tab llega antes
  await expect(enlace).toBeAttached()
  await page.keyboard.press('Tab')
  await expect(enlace).toBeFocused()
  const caja = (await enlace.boundingBox())!
  expect(caja.x).toBeGreaterThanOrEqual(0)
  expect(caja.x + caja.width).toBeLessThanOrEqual(360)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})
