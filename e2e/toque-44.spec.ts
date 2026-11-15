import { expect, test, type Locator, type Page } from '@playwright/test'

/** ¿Qué elemento recibe el toque a `dy` px del borde de arriba (negativo) o de abajo (positivo)? */
async function recibeToque(page: Page, c: Locator, lado: 'arriba' | 'abajo', fuera: number) {
  const caja = (await c.boundingBox())!
  const x = caja.x + caja.width / 2
  const y = lado === 'arriba' ? caja.y - fuera : caja.y + caja.height + fuera
  return c.evaluate(
    (el, [x, y]) => {
      const a = document.elementFromPoint(x, y)
      return !!a && (a === el || el.contains(a))
    },
    [x, y] as [number, number],
  )
}

test.describe('celular (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  const controles = async (page: Page) => {
    await page.goto('/zona/08?sinwebgl')
    await expect(page.locator('#informe')).toContainText('Cusco')
    return [
      ['Tendencia', page.getByRole('button', { name: 'Tendencia', exact: true })],
      ['Año a año', page.getByRole('button', { name: 'Año a año', exact: true })],
      ['Cómo leer el mapa', page.locator('summary', { hasText: 'Cómo leer el mapa' })],
      ['Ocultar el informe', page.getByRole('button', { name: 'Ocultar el informe' })],
    ] as const
  }

  test('los controles chicos se tocan en 44 px sin agrandarse', async ({ page }) => {
    for (const [nombre, c] of await controles(page)) {
      const caja = (await c.boundingBox())!
      expect(caja.height, `${nombre} no crece`).toBeLessThan(40)
      const falta = (44 - caja.height) / 2
      // dentro del borde invisible, el toque llega al control; un poco más lejos, ya no
      for (const lado of ['arriba', 'abajo'] as const) {
        expect(await recibeToque(page, c, lado, falta - 1), `${nombre} ${lado} dentro`).toBe(true)
        expect(await recibeToque(page, c, lado, falta + 3), `${nombre} ${lado} fuera`).toBe(false)
      }
    }
  })

  test('el ✕ de la leyenda abierta también se toca en 44 px', async ({ page }) => {
    await page.goto('/explorar?sinwebgl')
    await page.locator('summary', { hasText: 'Cómo leer el mapa' }).click()
    const cerrar = page.getByRole('button', { name: 'Minimizar la leyenda' })
    const caja = (await cerrar.boundingBox())!
    expect(caja.height).toBeLessThan(40)
    expect(await recibeToque(page, cerrar, 'abajo', (44 - caja.height) / 2 - 1)).toBe(true)
  })

  test('un toque en el borde invisible de Tendencia la activa', async ({ page }) => {
    await page.goto('/explorar?sinwebgl&anio=2010')
    const tendencia = page.getByRole('button', { name: 'Tendencia', exact: true })
    await expect(tendencia).toHaveAttribute('aria-pressed', 'false')
    const caja = (await tendencia.boundingBox())!
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height + 4)
    await expect(tendencia).toHaveAttribute('aria-pressed', 'true')
  })
})

test('en escritorio no hay borde invisible: el puntero usa el tamaño real', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/explorar?sinwebgl')
  const contenido = await page
    .getByRole('button', { name: 'Tendencia', exact: true })
    .evaluate((el) => getComputedStyle(el, '::after').content)
  expect(contenido).toBe('none')
})
