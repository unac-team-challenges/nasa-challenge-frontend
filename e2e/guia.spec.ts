import { expect, test } from '@playwright/test'

// Sin el fixture `apoyo/espanol`: ese da la guía por vista y aquí tiene que arrancar sola.
for (const [nombre, viewport] of [
  ['celular', { width: 390, height: 844 }],
  ['escritorio', { width: 1400, height: 900 }],
] as const) {
  test(`${nombre}: la guía arranca sola, recorre los 10 pasos y no vuelve a salir`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/explorar?lang=es&sinwebgl')
    const guia = page.getByRole('dialog')
    await expect(guia).toContainText('¿Cómo cambió el clima donde vives?')

    for (let n = 1; n < 10; n++) {
      await expect(guia).toContainText(`${n} de 10`)
      await guia.getByRole('button', { name: 'Siguiente' }).click()
    }
    await expect(guia).toContainText('10 de 10')
    // El paso de ejemplo abrió Piura y el informe está a la vista
    await expect(page).toHaveURL(/\/zona\/20/)
    await guia.getByRole('button', { name: 'Listo' }).click()
    await expect(guia).toBeHidden()
    await expect(page).toHaveURL(/\/explorar/)

    await page.reload()
    await expect(page.getByRole('group', { name: 'Perfil' })).toBeVisible()
    await expect(guia).toBeHidden()
  })

  test(`${nombre}: se salta y se repite con «?»`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/explorar?lang=es&sinwebgl')
    const guia = page.getByRole('dialog')
    await guia.getByRole('button', { name: 'Saltar la guía' }).click()
    await expect(guia).toBeHidden()

    if (nombre === 'celular') await page.getByRole('button', { name: 'Controles del mapa' }).click()
    await page.getByRole('button', { name: 'Ver la guía' }).click()
    await expect(guia).toContainText('1 de 10')
  })

  test(`${nombre}: en la primera visita sale en la portada y sigue en el explorador`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/?lang=es&sinwebgl')
    const guia = page.getByRole('dialog')
    await expect(guia).toContainText('1 de 10')
    await guia.getByRole('button', { name: 'Siguiente' }).click()
    await expect(page).toHaveURL(/\/explorar/)
    await expect(guia).toContainText('2 de 10')
  })
}
