import { expect, test } from '@playwright/test'

test('temperatura y máquina del tiempo: año, Play, Pausa y vuelta a la tendencia', async ({
  page,
}) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))

  await page.goto('/explorar')
  const variable = page.getByRole('group', { name: 'Variable' })
  await variable.getByRole('button', { name: 'Temperatura' }).click()
  await expect(variable.getByRole('button', { name: 'Temperatura' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  const tiempo = page.getByRole('group', { name: 'Máquina del tiempo' })
  const tendencia = tiempo.getByRole('button', { name: 'Tendencia', exact: true })
  const porAnio = tiempo.getByRole('button', { name: 'Año a año', exact: true })
  const anio = tiempo.getByRole('slider', { name: 'Año' })
  const titulo = page.getByRole('heading', { level: 2, name: /Temperatura media/ })
  await expect(tendencia).toHaveAttribute('aria-pressed', 'true')
  await expect(titulo).toContainText('tendencia')
  // En el modo Tendencia no hay deslizador ni Play
  await expect(anio).toHaveCount(0)
  await expect(tiempo.getByRole('button', { name: /^Reproducir/ })).toHaveCount(0)

  // Año a año muestra el deslizador; el título dice el año
  await porAnio.click()
  await expect(porAnio).toHaveAttribute('aria-pressed', 'true')
  await expect(tendencia).toHaveAttribute('aria-pressed', 'false')
  await expect(titulo).toContainText('solo')

  // Elegir otro año con el teclado sigue en Año a año
  await anio.focus()
  await anio.press('Home')
  await expect(porAnio).toHaveAttribute('aria-pressed', 'true')
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

test('Caso 2: la ficha de La Libertad, Ica y Lambayeque compara 2001 y 2024; Amazonas no', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl') // el mapa 2D se puede elegir con teclado
  const mapa = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  const informe = page.locator('#informe')

  // La Libertad e Ica: el verde es riego documentado («No todo cambio es el clima»). Olmos
  // (Lambayeque) mezcla riego y bosque seco y pesa El Niño: solo las cifras, sin atribuir la causa.
  for (const [departamento, titulo] of [
    ['La Libertad', 'No todo cambio es el clima'],
    ['Ica', 'No todo cambio es el clima'],
    ['Lambayeque', 'La costa que reverdece'],
  ]) {
    const zona = mapa.getByRole('button', { name: new RegExp(`^${departamento}`) })
    await zona.focus()
    await page.keyboard.press('Enter')
    await expect(informe).toContainText(departamento)
    await expect(informe.getByRole('heading', { name: titulo })).toBeVisible()
    await expect(informe.getByRole('img', { name: /2001/ })).toBeVisible()
    await expect(informe.getByRole('img', { name: /2024/ })).toBeVisible()
  }

  const amazonas = mapa.getByRole('button', { name: /^Amazonas/ })
  await amazonas.focus()
  await page.keyboard.press('Enter')
  await expect(informe).toContainText('Amazonas')
  await expect(informe.getByRole('heading', { name: 'No todo cambio es el clima' })).toHaveCount(0)
  await expect(informe.getByRole('heading', { name: 'La costa que reverdece' })).toHaveCount(0)
  await expect(informe.getByRole('heading', { name: 'Árboles de la selva' })).toHaveCount(0)
})

test('Selva: Madre de Dios muestra los árboles de La Pampa con su aviso', async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  const mapa = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  const informe = page.locator('#informe')
  const zona = mapa.getByRole('button', { name: /^Madre de Dios/ })
  await zona.focus()
  await page.keyboard.press('Enter')
  await expect(informe).toContainText('Madre de Dios')
  await expect(informe.getByRole('heading', { name: 'Árboles de la selva' })).toBeVisible()
  await expect(informe).toContainText('La Pampa (Tambopata)')
  await expect(informe).toContainText('Léelo con cuidado')
})
