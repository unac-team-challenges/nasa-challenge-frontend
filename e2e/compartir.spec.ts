import { expect, type Page } from '@playwright/test'
import { test } from './apoyo/espanol'

const URL_VISTA = '/zona/08?sinwebgl&variable=temperatura&anio=2010&perfil=estudiante'

/** Define (o quita) el menú de compartir del navegador y anota lo que recibe. */
const conShare = (page: Page, modo: 'ok' | 'cancela' | 'falla' | 'sin') =>
  page.addInitScript((modo) => {
    const w = window as unknown as { __compartido: unknown[] }
    w.__compartido = []
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value:
        modo === 'sin'
          ? undefined
          : async (d: unknown) => {
              w.__compartido.push(d)
              if (modo === 'cancela') throw new DOMException('cancelado', 'AbortError')
              if (modo === 'falla') throw new DOMException('no', 'NotAllowedError')
            },
    })
  }, modo)

const boton = (page: Page) =>
  page.getByRole('button', { name: 'Compartir esta vista' }).and(page.locator(':visible'))

test.describe('escritorio', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('sin menú de compartir, copia el enlace con zona, variable, año y perfil', async ({
    page,
  }) => {
    await conShare(page, 'sin')
    await page.goto(URL_VISTA)
    await expect(page.locator('#informe')).toContainText('Cusco')
    await boton(page).click()
    await expect(page.getByRole('status').filter({ hasText: 'Enlace copiado' })).toBeVisible()
    const copiado = await page.evaluate(() => navigator.clipboard.readText())
    expect(copiado).toBe(page.url())
    for (const trozo of ['/zona/08', 'variable=temperatura', 'anio=2010', 'perfil=estudiante'])
      expect(copiado).toContain(trozo)
    // el aviso se va solo
    await expect(page.getByRole('status').filter({ hasText: 'Enlace copiado' })).toHaveCount(0, {
      timeout: 5000,
    })
  })

  test('con menú de compartir, lo abre con el título y el enlace y no copia', async ({ page }) => {
    await conShare(page, 'ok')
    await page.goto(URL_VISTA)
    await expect(page.locator('#informe')).toContainText('Cusco')
    await boton(page).click()
    const recibido = await page.evaluate(
      () => (window as unknown as { __compartido: { title: string; url: string }[] }).__compartido,
    )
    expect(recibido).toHaveLength(1)
    expect(recibido[0].url).toBe(page.url())
    expect(recibido[0].title).toBe(await page.title())
    await expect(page.getByRole('status').filter({ hasText: 'Enlace copiado' })).toHaveCount(0)
  })

  test('cerrar el menú de compartir sin elegir no copia nada ni avisa', async ({ page }) => {
    await conShare(page, 'cancela')
    await page.goto(URL_VISTA)
    await boton(page).click()
    await page.waitForTimeout(300)
    await expect(page.getByRole('status').filter({ hasText: 'Enlace copiado' })).toHaveCount(0)
  })

  test('si el menú de compartir falla de verdad, copia el enlace', async ({ page }) => {
    await conShare(page, 'falla')
    await page.goto(URL_VISTA)
    await boton(page).click()
    await expect(page.getByRole('status').filter({ hasText: 'Enlace copiado' })).toBeVisible()
  })

  test('el aviso sigue el idioma', async ({ page }) => {
    await conShare(page, 'sin')
    await page.goto(`${URL_VISTA}&lang=en`)
    await page
      .getByRole('button', { name: 'Share this view' })
      .and(page.locator(':visible'))
      .click()
    await expect(page.getByRole('status').filter({ hasText: 'Link copied' })).toBeVisible()
  })
})

test.describe('celular', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('el botón está en el menú «⋯» de los controles del mapa', async ({ page }) => {
    await conShare(page, 'sin')
    await page.goto(URL_VISTA)
    await expect(page.locator('#informe')).toContainText('Cusco')
    await page.getByRole('button', { name: 'Controles del mapa' }).click()
    await boton(page).click()
    await expect(page.getByRole('status').filter({ hasText: 'Enlace copiado' })).toBeVisible()
  })
})
