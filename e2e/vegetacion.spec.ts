import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

test('solo hay 3 mapas y Vegetación muestra el bosque con su leyenda, la barra de tiempo y el informe', async ({
  page,
}) => {
  await page.goto('/explorar')
  const variables = page.getByRole('group', { name: 'Variable' })
  await expect(variables.getByRole('button')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Lugares medidos' })).toHaveCount(0)

  await variables.getByRole('button', { name: 'Vegetación' }).click()
  await expect(page).toHaveURL(/variable=vegetacion/)
  await expect(page.getByText('Altura: verdor medio')).toBeVisible()
  // La máquina del tiempo sigue: los datos de la vegetación no cambiaron
  await expect(page.getByRole('button', { name: 'Año a año' })).toBeVisible()

  await page.goto('/zona/16?variable=vegetacion')
  const informe = page.getByRole('complementary', { name: /informe/i })
  await expect(informe.getByRole('heading', { name: 'Loreto' })).toBeVisible()
})

test('un enlace viejo de «Lugares medidos» abre Vegetación', async ({ page }) => {
  await page.goto('/explorar?capa=vegetacion')
  await expect(
    page.getByRole('group', { name: 'Variable' }).getByRole('button', { name: 'Vegetación' }),
  ).toHaveAttribute('aria-pressed', 'true')
})
