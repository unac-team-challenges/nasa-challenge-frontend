import { expect, test } from '@playwright/test'

test('un enlace compartido abre la misma zona, variable y año', async ({ page }) => {
  await page.goto('/zona/20?variable=temperatura&anio=2010&perfil=estudiante')
  await expect(page.locator('#informe')).toContainText('Piura')
  await expect(
    page.getByRole('group', { name: 'Variable' }).getByRole('button', { name: 'Temperatura' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#perfil')).toHaveValue('estudiante')
  await expect(
    page.getByRole('group', { name: 'Máquina del tiempo' }).getByRole('slider', { name: 'Año' }),
  ).toHaveAttribute('aria-valuetext', '2010')
})

test('un enlace con ?lang=en se abre en inglés y el cambio de idioma queda en la URL', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl&lang=en')
  await expect(page.getByRole('region', { name: 'Explorer' })).toBeVisible()
  await expect(page.getByRole('button', { name: /English/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: /Español/ }).click()
  await expect(page.getByRole('region', { name: 'Explorador' })).toBeVisible()
  await expect(page).not.toHaveURL(/lang=/)
  await page.getByRole('button', { name: /English/ }).click()
  await expect(page).toHaveURL(/lang=en/)
})

test('elegir una zona actualiza la URL y se puede recargar', async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  await page
    .getByRole('group', { name: 'Mapa del Perú en 2D' })
    .getByRole('button', { name: /^Cusco/ })
    .click()
  await expect(page).toHaveURL(/\/zona\/08/)
  await page.reload()
  await expect(page.locator('#informe')).toContainText('Cusco')
})

test('metodología desde la cabecera y ruta inexistente', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto('/')
  await page.getByRole('button', { name: 'Metodología' }).click()
  await page.getByRole('menuitem', { name: /Ver la metodología completa/ }).click()
  await expect(page).toHaveURL(/\/metodologia$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Metodología')
  await expect(page).toHaveTitle(/Metodología/)

  await page.goto('/no-existe')
  await expect(page.getByText('Esta página no existe')).toBeVisible()
  await page.getByRole('link', { name: 'Ir al inicio' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('¿Qué está cambiando')
  expect(errores).toEqual([])
})
