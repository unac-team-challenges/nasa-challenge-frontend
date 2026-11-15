import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

test.describe('celular (390 × 844): la línea de tiempo va acostada, abajo del mapa', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('es horizontal, el año más antiguo queda a la izquierda y se elige de lado', async ({
    page,
  }) => {
    await page.goto('/explorar?sinwebgl&anio=2021')
    const barra = page.getByRole('group', { name: 'Máquina del tiempo' })
    const caja = (await barra.boundingBox())!
    expect(caja.width).toBeGreaterThan(caja.height * 4)
    expect(caja.height).toBeLessThan(80)

    // El riel va de 2001 (izquierda) a 2024 (derecha)
    const franjas = barra.locator('button[aria-label*=" en "]')
    const primera = (await franjas.first().boundingBox())!
    const ultima = (await franjas.last().boundingBox())!
    expect(primera.x).toBeLessThan(ultima.x)
    expect(Math.abs(primera.y - ultima.y)).toBeLessThan(2)

    // El deslizador es horizontal y sin writing-mode: tocar el medio da un año del medio
    const slider = barra.getByRole('slider', { name: 'Año' })
    expect(await slider.evaluate((e) => getComputedStyle(e).writingMode)).toBe('horizontal-tb')
    const s = (await slider.boundingBox())!
    await page.mouse.click(s.x + s.width / 2, s.y + s.height / 2)
    const medio = Number(await slider.getAttribute('aria-valuetext'))
    expect(medio).toBeGreaterThanOrEqual(2010)
    expect(medio).toBeLessThanOrEqual(2015)
    await expect(page).toHaveURL(new RegExp(`anio=${medio}`))
  })

  test('en Tendencia es una sola fila sin deslizador; Año a año agrega el riel', async ({
    page,
  }) => {
    await page.goto('/explorar?sinwebgl')
    const barra = page.getByRole('group', { name: 'Máquina del tiempo' })
    const tendencia = (await barra.boundingBox())!
    expect(tendencia.height).toBeLessThan(50)
    await expect(barra.getByRole('slider', { name: 'Año' })).toHaveCount(0)

    await barra.getByRole('button', { name: 'Año a año' }).click()
    await expect(barra.getByRole('slider', { name: 'Año' })).toBeVisible()
    const porAnio = (await barra.boundingBox())!
    expect(porAnio.height).toBeGreaterThan(tendencia.height)
    expect(porAnio.height).toBeLessThan(80)
    // el interruptor va de lado a lado
    const t = (await barra.getByRole('button', { name: 'Tendencia', exact: true }).boundingBox())!
    const a = (await barra.getByRole('button', { name: 'Año a año' }).boundingBox())!
    expect(a.x).toBeGreaterThan(t.x)
    expect(Math.abs(a.y - t.y)).toBeLessThan(2)
  })

  test('no tapa la leyenda ni el botón «⋯» del mapa', async ({ page }) => {
    await page.goto('/explorar?sinwebgl&anio=2021')
    const barra = (await page.getByRole('group', { name: 'Máquina del tiempo' }).boundingBox())!
    const leyenda = (await page.getByText('Cómo leer el mapa').boundingBox())!
    // En celular los controles del mapa van detrás del botón «⋯»
    const controles = (await page
      .getByRole('button', { name: 'Controles del mapa' })
      .boundingBox())!
    expect(leyenda.y + leyenda.height).toBeLessThanOrEqual(barra.y)
    expect(controles.y + controles.height).toBeLessThanOrEqual(barra.y)
  })
})

test('escritorio: la barra sigue vertical, pegada al borde derecho', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/explorar?sinwebgl&anio=2021')
  const barra = page.getByRole('group', { name: 'Máquina del tiempo' })
  const caja = (await barra.boundingBox())!
  expect(caja.height).toBeGreaterThan(caja.width * 2)
  const slider = barra.getByRole('slider', { name: 'Año' })
  expect(await slider.evaluate((e) => getComputedStyle(e).writingMode)).toBe('vertical-lr')
})
