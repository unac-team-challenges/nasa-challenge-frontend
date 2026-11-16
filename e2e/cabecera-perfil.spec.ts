import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

test('el perfil es un interruptor con íconos, no una lista del sistema', async ({ page }) => {
  await page.goto('/explorar?sinwebgl&perfil=agricultor')
  const perfil = page.getByRole('group', { name: 'Perfil' })
  await expect(page.locator('select')).toHaveCount(0)
  await expect(perfil.getByRole('button', { name: 'Agricultor' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(perfil.getByRole('button', { name: 'Estudiante' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(perfil.locator('svg')).toHaveCount(2)

  await perfil.getByRole('button', { name: 'Estudiante' }).click()
  await expect(page).toHaveURL(/perfil=estudiante/)
  await expect(perfil.getByRole('button', { name: 'Estudiante' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(perfil.getByRole('button', { name: 'Agricultor' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test.describe('celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('la cabecera es 1 fila: marca, variable y menú ☰ sin salirse de la pantalla', async ({
    page,
  }) => {
    await page.goto('/explorar?sinwebgl')
    const cabecera = page.locator('body > div header').first()
    const alto = (await cabecera.boundingBox())!.height
    expect(alto).toBeLessThan(80)
    for (const boton of [
      page.getByRole('button', { name: /^Variable: / }),
      page.getByRole('button', { name: 'Menú' }),
    ]) {
      const caja = (await boton.boundingBox())!
      expect(caja.height).toBeGreaterThanOrEqual(44)
      expect(caja.x + caja.width).toBeLessThanOrEqual(390)
    }
  })

  test('el selector de variable cambia la variable y muestra la actual', async ({ page }) => {
    await page.goto('/explorar?sinwebgl')
    await page.getByRole('button', { name: 'Variable: Lluvia' }).tap()
    await page.getByRole('menuitemradio', { name: 'Temperatura' }).tap()
    await expect(page).toHaveURL(/variable=temperatura/)
    await expect(page.getByRole('button', { name: 'Variable: Temperatura' })).toBeVisible()
  })

  test('el perfil está en el menú ☰, con botones de 44 px que se tocan', async ({ page }) => {
    await page.goto('/explorar?sinwebgl')
    await page.getByRole('button', { name: 'Menú' }).tap()
    const perfil = page.getByRole('dialog', { name: 'Menú' }).getByRole('group', { name: 'Perfil' })
    for (const nombre of ['Agricultor', 'Estudiante']) {
      const caja = (await perfil.getByRole('button', { name: nombre }).boundingBox())!
      expect(caja.height).toBeGreaterThanOrEqual(44)
      expect(caja.x + caja.width).toBeLessThanOrEqual(390)
    }
    await perfil.getByRole('button', { name: 'Estudiante' }).tap()
    await expect(page).toHaveURL(/perfil=estudiante/)
    await expect(perfil.getByRole('button', { name: 'Estudiante' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
