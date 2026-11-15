import { expect, test } from '@playwright/test'

test('recorrido completo: portada → perfil → explorador → zona → informe', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))

  // Portada con el mapa 3D
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('¿Qué está cambiando')
  await expect(page.getByRole('img', { name: /Mapa del Perú en 3D/ })).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()

  // Elegir perfil lleva al explorador
  await page.getByRole('button', { name: /Agricultor/ }).click()
  await expect(page).toHaveURL(/\/explorar\?.*perfil=agricultor/)
  await expect(page.getByRole('region', { name: 'Explorador' })).toBeVisible()
  await expect(page.locator('#perfil')).toHaveValue('agricultor')

  // Variable: lluvia → temperatura (datos reales de NASA POWER)
  const variable = page.getByRole('group', { name: 'Variable' })
  await expect(variable.getByRole('button', { name: 'Lluvia' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await variable.getByRole('button', { name: 'Temperatura' }).click()
  await expect(variable.getByRole('button', { name: 'Temperatura' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await variable.getByRole('button', { name: 'Lluvia' }).click()

  // Cambiar a 2D y elegir un departamento con el teclado
  const vista = page.getByRole('group', { name: 'Vista del mapa' })
  await vista.getByRole('button', { name: '2D' }).click()
  await expect(vista.getByRole('button', { name: '2D' })).toHaveAttribute('aria-pressed', 'true')
  const mapa2d = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  await expect(mapa2d).toBeVisible()
  const amazonas = mapa2d.getByRole('button', { name: /^Amazonas/ })
  await amazonas.focus()
  await page.keyboard.press('Enter')
  await expect(amazonas).toHaveAttribute('aria-pressed', 'true')

  // Informe abierto con la ficha de la zona
  await expect(page.locator('#informe')).toContainText('Amazonas')
  await expect(page.locator('#informe').getByRole('img').first()).toBeVisible() // gráfico
  const nino = page.getByRole('checkbox', { name: /El Niño/ })
  await nino.check()
  await expect(nino).toBeChecked()

  // Minimizar y volver a abrir el informe
  await page.getByRole('button', { name: 'Ocultar el informe' }).click()
  await expect(page.locator('#informe')).toHaveCount(0)
  await page.getByRole('button', { name: 'Mostrar el informe' }).click()
  await expect(page.locator('#informe')).toBeVisible()

  // Idioma y tema
  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('region', { name: 'Explorer' })).toBeVisible()
  await page.getByRole('button', { name: /Change theme/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/)

  // Volver al inicio
  await page
    .getByRole('link', { name: /Detective del Perú|Detective of Peru|home/i })
    .first()
    .click()
  await expect(page).not.toHaveURL(/\/explorar/)

  expect(errores).toEqual([])
})

test('sin WebGL: el explorador cae al mapa 2D', async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  await expect(page.getByRole('group', { name: 'Mapa del Perú en 2D' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Vista del mapa' })).toHaveCount(0)
  // El 2D pinta su suelo en un canvas 2D (data-suelo2d); lo que no debe haber es el del 3D
  await expect(page.locator('canvas:not([data-suelo2d])')).toHaveCount(0)
})
