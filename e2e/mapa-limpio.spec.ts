import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test('el título del mapa es una píldora de una línea en celular', async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  const titulo = page.getByRole('heading', { level: 2, name: /Lluvia anual/ })
  await expect(titulo).toBeVisible()
  const caja = (await titulo.locator('xpath=..').boundingBox())!
  expect(caja.height).toBeLessThan(46)
  // el subtítulo no está en el título: pasó a la leyenda
  await expect(titulo.locator('xpath=..').getByText('Cambio por década')).toBeHidden()
})

test('la leyenda abierta es una hoja pegada abajo del mapa y tocar el mapa la cierra', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  const mapa = (await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).boundingBox())!
  const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
  await detalles.locator('summary').click()
  await expect(detalles).toHaveAttribute('open', '')

  const hoja = (await detalles.locator('xpath=..').boundingBox())!
  expect(hoja.x).toBeLessThanOrEqual(mapa.x + 1)
  expect(hoja.width).toBeGreaterThanOrEqual(mapa.width - 2)
  expect(hoja.y + hoja.height).toBeCloseTo(mapa.y + mapa.height, -1)
  expect(hoja.height).toBeLessThanOrEqual(mapa.height * 0.7 + 2)
  // en la hoja se explica qué se pinta (antes iba bajo el título)
  await expect(detalles.getByText('Cambio por década')).toBeVisible()

  // tocar el mapa (arriba de la hoja) la cierra
  await page.mouse.click(mapa.x + mapa.width / 2, mapa.y + 40)
  await expect(detalles).not.toHaveAttribute('open', '')
})

test('en el 3D solo quedan 4 etiquetas de referencia en celular', async ({ page }) => {
  await page.goto('/explorar')
  await expect(page.locator('canvas')).toBeVisible()
  const visibles = page.locator('.lbl3d:not(.country):not(.ocean):not(.sel)')
  await expect
    .poll(() => visibles.evaluateAll((els) => els.filter((e) => !(e as HTMLElement).hidden).length))
    .toBe(4)
})

test('en escritorio la leyenda sigue flotando y el título conserva su subtítulo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/explorar?sinwebgl')
  await expect(page.getByText('Cambio por década').first()).toBeVisible()
  const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
  await expect(detalles).toHaveAttribute('open', '')
  const hoja = (await detalles.locator('xpath=..').boundingBox())!
  expect(hoja.width).toBeLessThan(400)
})

test('con todo cerrado, los paneles tapan menos del 25 % del mapa', async ({ page }) => {
  await page.goto('/explorar')
  const barra = page.getByRole('group', { name: 'Máquina del tiempo' })
  await barra.waitFor()
  await page.waitForTimeout(2500) // que termine la animación de entrada
  const pct = await page.evaluate(() => {
    const caja = (el: Element | null | undefined) => {
      const b = el?.getBoundingClientRect()
      return b && b.width && b.height ? { x: b.left, y: b.top, w: b.width, h: b.height } : null
    }
    const m = caja(document.querySelector('section[aria-label="Explorador"] > div'))!
    const paneles = [
      caja(document.querySelector('h2')?.parentElement),
      caja(
        [...document.querySelectorAll('p')].find((p) => p.textContent?.startsWith('Tendencia:')),
      ),
      caja(document.querySelector('details')?.parentElement),
      caja(document.querySelector('[role=group][aria-label="Máquina del tiempo"]')),
      caja(document.querySelector('button[aria-label="Controles del mapa"]')),
    ]
    const [w, h] = [Math.round(m.w), Math.round(m.h)]
    const grid = new Uint8Array(w * h)
    for (const p of paneles) {
      if (!p) continue
      for (
        let y = Math.max(0, Math.round(p.y - m.y));
        y < Math.min(h, Math.round(p.y - m.y + p.h));
        y++
      )
        for (
          let x = Math.max(0, Math.round(p.x - m.x));
          x < Math.min(w, Math.round(p.x - m.x + p.w));
          x++
        )
          grid[y * w + x] = 1
    }
    return (grid.reduce((a, v) => a + v, 0) / grid.length) * 100
  })
  expect(pct).toBeLessThan(25)
})

test('los controles del mapa van detrás de «⋯» en celular y a la vista en escritorio', async ({
  page,
}) => {
  await page.goto('/explorar')
  const menu = page.getByRole('button', { name: 'Controles del mapa' })
  await expect(menu).toBeVisible()
  await expect(page.getByRole('button', { name: 'Volver a la vista inicial' })).toHaveCount(0)

  await menu.click()
  const vista = page.getByRole('group', { name: 'Vista del mapa' })
  await expect(vista).toBeVisible()
  await expect(page.getByRole('button', { name: 'Volver a la vista inicial' })).toBeVisible()
  await vista.getByRole('button', { name: '2D' }).click()
  await expect(vista.getByRole('button', { name: '2D' })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(vista).toHaveCount(0)

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(menu).toBeHidden()
  await expect(page.getByRole('group', { name: 'Vista del mapa' })).toBeVisible()
})

test('la tarjeta de ayuda no sale en celular: su texto está en la leyenda', async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  await expect(page.getByRole('button', { name: 'Cerrar la ayuda' })).toBeHidden()
  const detalles = page.locator('details', { hasText: 'Cómo leer el mapa' })
  await detalles.locator('summary').click()
  await expect(detalles.getByText(/^Tendencia: cuánto cambió en \d+ años/)).toBeVisible()
})
