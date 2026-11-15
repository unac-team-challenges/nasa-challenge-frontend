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
  const idioma = page.getByRole('group', { name: 'Change language' })
  await expect(idioma.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
  await idioma.getByRole('button', { name: 'ES' }).click()
  await expect(page).not.toHaveURL(/lang=/)
  await expect(
    page.getByRole('group', { name: 'Cambiar idioma' }).getByRole('button', { name: 'ES' }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('en pantallas muy angostas el idioma es un solo botón que muestra el actual', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/explorar?sinwebgl')
  await expect(page.getByRole('group', { name: 'Cambiar idioma' })).toBeHidden()
  await page.getByRole('button', { name: 'Cambiar idioma (ES)' }).click()
  await expect(page).toHaveURL(/lang=en/)
  await expect(page.getByRole('button', { name: 'Change language (EN)' })).toHaveText('EN')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
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
  await page.getByRole('link', { name: 'Metodología' }).first().click()
  await expect(page).toHaveURL(/\/metodologia$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Metodología')
  await expect(page).toHaveTitle(/Metodología/)

  await page.goto('/no-existe')
  await expect(page.getByText('Esta página no existe')).toBeVisible()
  await page.getByRole('link', { name: 'Ir al inicio' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('¿Qué está cambiando')
  expect(errores).toEqual([])
})
