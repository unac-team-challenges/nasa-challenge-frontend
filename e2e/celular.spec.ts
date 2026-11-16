import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'
import { coberturaPaneles } from './apoyo/cobertura'

// Proyecto «celular» (Pixel 7, ver playwright.config.ts). Tres comprobaciones del documento de UX,
// una por cada arreglo de celular que más fácil se rompe sin que nadie lo note.

test('la Pista no devuelve la página al mapa (mejora 1)', async ({ page }) => {
  await page.goto('/zona/08?sinwebgl')
  await expect(page.locator('#informe')).toContainText('Cusco')
  const pista = page.getByRole('button', { name: /^Ir a / })
  await pista.scrollIntoViewIfNeeded()
  const antes = await page.evaluate(() => scrollY)
  expect(antes, 'la prueba parte con la Pista a la vista, abajo del mapa').toBeGreaterThan(300)

  const destino = (await pista.innerText()).replace(/^Ir a\s+/, '').trim()
  await pista.tap()
  await expect(page).not.toHaveURL(/\/zona\/08/)
  await expect(page.locator('#informe h2')).toContainText(destino)
  await page.waitForTimeout(600) // el fundido de la ficha y cualquier salto tardío

  const despues = await page.evaluate(() => scrollY)
  // no vuelve arriba: se queda donde estaba o, si la ficha nueva es más corta, al inicio del informe
  const inicioInforme = await page.evaluate(
    () => document.querySelector('#informe')!.getBoundingClientRect().top + scrollY,
  )
  expect(despues).toBeGreaterThan(0)
  expect(despues).toBeGreaterThanOrEqual(Math.min(antes, inicioInforme) - 2)
})

test('el idioma muestra cuál está activo y cambiarlo lo deja en la URL (mejora 2)', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl&lang=en')
  // En celular el idioma está en el menú ☰
  await page.getByRole('button', { name: 'Menu' }).tap()
  const idioma = page.getByRole('group', { name: 'Change language' })
  await expect(idioma.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
  await expect(idioma.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'false')

  await idioma.getByRole('button', { name: 'ES' }).tap()
  const espanol = page.getByRole('group', { name: 'Cambiar idioma' })
  await expect(espanol.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/lang=es/) // el inglés es el idioma por defecto
})

test('con todo cerrado, los paneles tapan menos del 25 % del mapa (mejora 3)', async ({ page }) => {
  await page.goto('/explorar')
  expect(await coberturaPaneles(page)).toBeLessThan(25)
})
