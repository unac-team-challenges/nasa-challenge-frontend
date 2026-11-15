import { expect, test } from '@playwright/test'

test('temperatura y máquina del tiempo: año, Play, Pausa y vuelta a la tendencia', async ({
  page,
}) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))

  await page.goto('/#explorar')
  const variable = page.getByRole('group', { name: 'Variable' })
  await variable.getByRole('button', { name: 'Temperatura' }).click()
  await expect(variable.getByRole('button', { name: 'Temperatura' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  const tiempo = page.getByRole('group', { name: 'Máquina del tiempo' })
  const tendencia = tiempo.getByRole('button', { name: 'Tendencia', exact: true })
  const anio = tiempo.getByRole('slider', { name: 'Año' })
  await expect(tendencia).toHaveAttribute('aria-pressed', 'true')

  // Elegir un año con el teclado sale de la vista de tendencia
  await anio.focus()
  await anio.press('Home')
  await expect(tendencia).toHaveAttribute('aria-pressed', 'false')
  const primero = await anio.getAttribute('aria-valuetext')
  expect(primero).toMatch(/^\d{4}$/)

  // Play avanza solo; Pausa lo detiene
  await tiempo.getByRole('button', { name: /^Reproducir/ }).click()
  await expect(tiempo.getByRole('button', { name: 'Pausar' })).toBeVisible()
  await expect.poll(() => anio.getAttribute('aria-valuetext')).not.toBe(primero)
  await tiempo.getByRole('button', { name: 'Pausar' }).click()
  await expect(tiempo.getByRole('button', { name: /^Reproducir/ })).toBeVisible()

  await tendencia.click()
  await expect(tendencia).toHaveAttribute('aria-pressed', 'true')
  expect(errores).toEqual([])
})

test('Caso 2: la ficha de La Libertad e Ica compara 2001 y 2024; Amazonas no', async ({ page }) => {
  await page.goto('/?sinwebgl#explorar') // el mapa 2D se puede elegir con teclado
  const mapa = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  const informe = page.locator('#informe')

  for (const departamento of ['La Libertad', 'Ica']) {
    const zona = mapa.getByRole('button', { name: new RegExp(`^${departamento}`) })
    await zona.focus()
    await page.keyboard.press('Enter')
    await expect(informe).toContainText(departamento)
    await expect(informe.getByRole('heading', { name: 'La costa que reverdece' })).toBeVisible()
    await expect(informe.getByRole('img', { name: /2001/ })).toBeVisible()
    await expect(informe.getByRole('img', { name: /2024/ })).toBeVisible()
  }

  const amazonas = mapa.getByRole('button', { name: /^Amazonas/ })
  await amazonas.focus()
  await page.keyboard.press('Enter')
  await expect(informe).toContainText('Amazonas')
  await expect(informe.getByRole('heading', { name: 'La costa que reverdece' })).toHaveCount(0)
})
