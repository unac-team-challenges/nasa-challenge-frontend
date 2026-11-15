import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test('la leyenda se puede minimizar con ✕ y recuerda la elección al recargar', async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
  const resumen = detalles.locator('summary')
  const cerrar = page.getByRole('button', { name: 'Minimizar la leyenda' })

  // En celular empieza minimizada: una franja de una línea y sin ✕
  await expect(detalles).not.toHaveAttribute('open', '')
  await expect(cerrar).toHaveCount(0)

  // Se abre al tocar el título y entonces aparece la ✕
  await resumen.click()
  await expect(detalles).toHaveAttribute('open', '')
  await expect(cerrar).toBeVisible()
  await page.screenshot({ path: '/tmp/claude-1000/-home-leandro-rojas-Escritorio-Nasa/4c622a49-0b98-4c76-b7e4-850fd5f04e4c/scratchpad/ley-abierta.png' })

  // La elección de abrirla se recuerda
  await page.reload()
  await expect(detalles).toHaveAttribute('open', '')

  // La ✕ la minimiza y también se recuerda
  await page.getByRole('button', { name: 'Minimizar la leyenda' }).click()
  await expect(detalles).not.toHaveAttribute('open', '')
  await expect(cerrar).toHaveCount(0)
  await page.screenshot({ path: '/tmp/claude-1000/-home-leandro-rojas-Escritorio-Nasa/4c622a49-0b98-4c76-b7e4-850fd5f04e4c/scratchpad/ley-cerrada.png' })
  await page.reload()
  await expect(detalles).not.toHaveAttribute('open', '')
})

test('sin haber elegido nunca, no guarda nada (el valor por defecto sigue al ancho)', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => localStorage.getItem('leyenda-abierta'))).toBeNull()
})
