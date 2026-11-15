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

  test('los dos botones de perfil miden al menos 36 px de alto y se tocan', async ({ page }) => {
    await page.goto('/explorar?sinwebgl')
    const perfil = page.getByRole('group', { name: 'Perfil' })
    for (const nombre of ['Agricultor', 'Estudiante']) {
      const caja = (await perfil.getByRole('button', { name: nombre }).boundingBox())!
      expect(caja.height).toBeGreaterThanOrEqual(36)
    }
    // ninguno queda cortado por el borde de la pantalla: se ven enteros sin deslizar la tira
    for (const nombre of ['Agricultor', 'Estudiante']) {
      const caja = (await perfil.getByRole('button', { name: nombre }).boundingBox())!
      expect(caja.x + caja.width).toBeLessThanOrEqual(390)
      expect(caja.width).toBeGreaterThanOrEqual(36)
    }
    await perfil.getByRole('button', { name: 'Estudiante' }).tap()
    await expect(page).toHaveURL(/perfil=estudiante/)
  })
})
