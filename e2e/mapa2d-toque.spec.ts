import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

test('en celular se puede tocar Callao un poco fuera de su contorno (zona de ~3 px)', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  const mapa = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  const callao = (await mapa.getByRole('button', { name: /^Callao/i }).boundingBox())!
  expect(callao.width).toBeLessThan(15)
  // 8 px mar adentro: fuera del polígono, dentro del área de toque
  await page.touchscreen.tap(callao.x - 8, callao.y + callao.height / 2)
  await expect(page).toHaveURL(/\/zona\/07/)
  // viene del mapa: sale la presentación del departamento (no es un cambio desde la Pista)
  await expect(page.locator('.presentacion')).toHaveCount(1)
})

test('la ficha flotante sale con el ratón, no con el dedo; tocar abre el informe', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  const mapa = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  const cusco = mapa.getByRole('button', { name: /^Cusco/i })
  const caja = (await cusco.boundingBox())!
  const punto = { clientX: caja.x + caja.width / 2, clientY: caja.y + caja.height / 2 }
  const evento = (tipo: string, pointerType: string) =>
    cusco.dispatchEvent(tipo, { ...punto, pointerType, bubbles: true })

  // Dedo: ni «encima» ni ficha flotante
  await evento('pointerover', 'touch')
  await evento('pointermove', 'touch')
  await expect(page.locator('.ficha3d.on')).toHaveCount(0)
  await evento('pointerout', 'touch')

  // Ratón (control): la ficha sí sale
  await evento('pointerover', 'mouse')
  await evento('pointermove', 'mouse')
  await expect(page.locator('.ficha3d.on')).toHaveCount(1)

  // Tocar abre el informe. El clic va a la zona misma: su centro en pantalla puede caer en el
  // borde de toque de una vecina pequeña (Apurímac), que está dibujado encima.
  await cusco.dispatchEvent('click')
  await expect(page).toHaveURL(/\/zona\/08/)
  await expect(page.locator('#informe')).toContainText('Cusco')
})

test('el borde de toque de una zona chica no le quita terreno a una vecina grande', async ({
  page,
}) => {
  await page.goto('/explorar?sinwebgl')
  const mapa = page.getByRole('group', { name: 'Mapa del Perú en 2D' })
  const caja = (await mapa.getByRole('button', { name: /^Cusco/i }).boundingBox())!
  // En cada punto que cae dentro de Cusco, lo que recibe el toque no es el borde de otra zona
  const robados = await page.evaluate((c) => {
    let n = 0
    for (let fy = 0.05; fy < 1; fy += 0.1)
      for (let fx = 0.05; fx < 1; fx += 0.1) {
        const pila = document.elementsFromPoint(c.x + c.width * fx, c.y + c.height * fy)
        const enCusco = pila.some((e) => e.getAttribute('aria-label')?.startsWith('Cusco'))
        const arriba = pila[0]?.getAttribute('data-toque')
        if (enCusco && arriba && arriba !== '08') n++
      }
    return n
  }, caja)
  expect(robados).toBe(0)
})
