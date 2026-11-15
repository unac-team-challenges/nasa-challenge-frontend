import { expect, test } from '@playwright/test'

for (const [nombre, viewport] of [
  ['celular', { width: 390, height: 844 }],
  ['escritorio', { width: 1400, height: 900 }],
] as const) {
  test(`${nombre}: la leyenda empieza minimizada y se abre y se cierra con la misma flecha`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/explorar?sinwebgl&variable=temperatura')
    const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
    const resumen = detalles.locator('summary')

    // Minimizada: una franja de una línea, sin un segundo botón para cerrar
    await expect(detalles).not.toHaveAttribute('open', '')
    await expect(page.getByRole('button', { name: 'Minimizar la leyenda' })).toHaveCount(0)

    await resumen.click()
    await expect(detalles).toHaveAttribute('open', '')
    // Las cifras de la escala van aparte del texto que las explica
    await expect(detalles.getByText('°C', { exact: false }).first()).toBeVisible()

    await resumen.click()
    await expect(detalles).not.toHaveAttribute('open', '')

    // Al volver a entrar, minimizada otra vez
    await resumen.click()
    await page.reload()
    await expect(detalles).not.toHaveAttribute('open', '')
  })
}

test('los rótulos de las columnas dependen del perfil', async ({ page }) => {
  await page.goto('/explorar?sinwebgl&variable=lluvia&perfil=estudiante')
  const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
  await detalles.locator('summary').click()
  await expect(detalles.getByRole('img', { name: /pendiente > 0/ })).toBeVisible()
  await page.goto('/explorar?sinwebgl&variable=lluvia&perfil=agricultor')
  await detalles.locator('summary').click()
  await expect(detalles.getByRole('img', { name: /llueve más/ })).toBeVisible()
})

test('al elegir un departamento la leyenda se minimiza para dejar sitio al informe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 700 })
  await page.goto('/explorar?sinwebgl')
  const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
  await detalles.locator('summary').click()
  await expect(detalles).toHaveAttribute('open', '')
  // con el teclado: la leyenda abierta puede tapar a Cusco y el clic no le llegaría
  await page.getByRole('button', { name: /^Cusco/i }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#informe')).toContainText('Cusco')
  await expect(detalles).not.toHaveAttribute('open', '')
})
