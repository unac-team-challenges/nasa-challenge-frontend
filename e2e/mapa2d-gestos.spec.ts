import { expect, test, type Page } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

/** Emite eventos de puntero táctil sobre la zona de abajo (Playwright no trae pellizco). */
const toque = (page: Page, tipo: string, id: number, x: number, y: number, pointerType = 'touch') =>
  page.evaluate(
    ([tipo, id, x, y, pointerType]) => {
      const el = document.elementFromPoint(x as number, y as number) ?? document.body
      el.dispatchEvent(
        new PointerEvent(tipo as string, {
          pointerId: id as number,
          pointerType: pointerType as string,
          clientX: x as number,
          clientY: y as number,
          isPrimary: id === 1,
          bubbles: true,
          cancelable: true,
        }),
      )
    },
    [tipo, id, x, y, pointerType],
  )

/** Zoom y desplazamiento actuales del mapa (matriz CSS del contenedor .zoom2d). */
const vista = (page: Page) =>
  page.locator('.zoom2d').evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
    return { k: m.a, tx: m.e, ty: m.f }
  })

test.beforeEach(async ({ page }) => {
  await page.goto('/explorar?sinwebgl')
  await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).waitFor()
})

test('dos dedos separándose acercan el mapa; juntándose lo alejan, sin pasar de 1×', async ({
  page,
}) => {
  const c = (await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).boundingBox())!
  const [cx, cy] = [c.x + c.width / 2, c.y + c.height / 2]
  expect((await vista(page)).k).toBeCloseTo(1, 2)

  await toque(page, 'pointerdown', 1, cx - 30, cy)
  await toque(page, 'pointerdown', 2, cx + 30, cy)
  await toque(page, 'pointermove', 1, cx - 90, cy)
  await toque(page, 'pointermove', 2, cx + 90, cy)
  const cerca = await vista(page)
  expect(cerca.k).toBeCloseTo(3, 1)

  // el punto bajo el centro de los dedos no se movió
  expect(cerca.tx).toBeCloseTo(cx * (1 - cerca.k), 0)

  // juntarlos más allá del inicio no baja de 1×
  await toque(page, 'pointermove', 1, cx - 2, cy)
  await toque(page, 'pointermove', 2, cx + 2, cy)
  expect((await vista(page)).k).toBeCloseTo(1, 2)
  await toque(page, 'pointerup', 1, cx - 2, cy)
  await toque(page, 'pointerup', 2, cx + 2, cy)
})

test('con el mapa acercado un dedo lo arrastra, sin salirse de los bordes ni elegir zona', async ({
  page,
}) => {
  const c = (await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).boundingBox())!
  const [cx, cy] = [c.x + c.width / 2, c.y + c.height / 2]
  await toque(page, 'pointerdown', 1, cx - 30, cy)
  await toque(page, 'pointerdown', 2, cx + 30, cy)
  await toque(page, 'pointermove', 1, cx - 90, cy)
  await toque(page, 'pointermove', 2, cx + 90, cy)
  await toque(page, 'pointerup', 1, cx - 90, cy)
  await toque(page, 'pointerup', 2, cx + 90, cy)
  const antes = await vista(page)

  // arrastre de 40 px a la izquierda con un dedo
  await toque(page, 'pointerdown', 3, cx, cy)
  await toque(page, 'pointermove', 3, cx - 40, cy)
  await toque(page, 'pointerup', 3, cx - 40, cy)
  const despues = await vista(page)
  expect(despues.tx).toBeCloseTo(antes.tx - 40, 0)
  expect(despues.k).toBeCloseTo(antes.k, 3)

  // el «click» que sigue al arrastre no elige zona
  await toque(page, 'pointerdown', 4, cx, cy)
  await toque(page, 'pointermove', 4, cx - 30, cy)
  await toque(page, 'pointerup', 4, cx - 30, cy)
  await page.evaluate(
    ([x, y]) =>
      document
        .elementFromPoint(x, y)
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })),
    [cx - 30, cy],
  )
  await expect(page).not.toHaveURL(/\/zona\//)

  // arrastrar mucho no deja huecos: el borde del mapa no pasa del borde de la caja
  await toque(page, 'pointerdown', 5, cx, cy)
  await toque(page, 'pointermove', 5, cx + 5000, cy + 5000)
  await toque(page, 'pointerup', 5, cx + 5000, cy + 5000)
  const tope = await vista(page)
  expect(tope.tx).toBeLessThanOrEqual(0)
  expect(tope.ty).toBeLessThanOrEqual(0)
})

test('un toque simple sigue eligiendo la zona, y el botón de recentrar deshace el zoom', async ({
  page,
}) => {
  const c = (await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).boundingBox())!
  const [cx, cy] = [c.x + c.width / 2, c.y + c.height / 2]
  await toque(page, 'pointerdown', 1, cx - 30, cy)
  await toque(page, 'pointerdown', 2, cx + 30, cy)
  await toque(page, 'pointermove', 1, cx - 90, cy)
  await toque(page, 'pointermove', 2, cx + 90, cy)
  await toque(page, 'pointerup', 1, cx - 90, cy)
  await toque(page, 'pointerup', 2, cx + 90, cy)
  expect((await vista(page)).k).toBeGreaterThan(2)

  await page.getByRole('button', { name: 'Volver a la vista inicial' }).click()
  await expect.poll(async () => (await vista(page)).k, { timeout: 4000 }).toBeCloseTo(1, 1)

  // sin gestos, tocar una zona la elige como siempre
  const cusco = (await page.getByRole('button', { name: /^Cusco/i }).boundingBox())!
  await page.touchscreen.tap(cusco.x + cusco.width / 2, cusco.y + cusco.height / 2)
  await expect(page).toHaveURL(/\/zona\/08/)
})

test('con ratón no hay gestos: arrastrar no mueve el mapa', async ({ page }) => {
  const c = (await page.getByRole('group', { name: 'Mapa del Perú en 2D' }).boundingBox())!
  const [cx, cy] = [c.x + c.width / 2, c.y + c.height / 2]
  await toque(page, 'pointerdown', 1, cx, cy, 'mouse')
  await toque(page, 'pointermove', 1, cx - 80, cy, 'mouse')
  await toque(page, 'pointerup', 1, cx - 80, cy, 'mouse')
  const v = await vista(page)
  expect(v.k).toBeCloseTo(1, 2)
  expect(v.tx).toBeCloseTo(0, 0)
})
