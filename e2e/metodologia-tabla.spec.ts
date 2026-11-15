import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

for (const ancho of [390, 320]) {
  test(`en ${ancho} px la tabla de fuentes no se corta ni obliga a deslizar de lado`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: ancho, height: 800 })
    await page.goto('/metodologia')
    const tabla = page.getByRole('table')
    await expect(tabla.getByRole('row')).toHaveCount(7) // encabezado + 6 fuentes
    const { envoltura, pagina } = await tabla.evaluate((t) => ({
      envoltura: t.parentElement!.scrollWidth - t.parentElement!.clientWidth,
      pagina: document.documentElement.scrollWidth - innerWidth,
    }))
    expect(envoltura).toBeLessThanOrEqual(0)
    expect(pagina).toBeLessThanOrEqual(0)
    // cada dato lleva su rótulo, y conservan su semántica de tabla
    await expect(tabla.getByRole('rowheader', { name: 'Árboles de la selva' })).toBeVisible()
    const fila = tabla.getByRole('row', { name: /Árboles de la selva/ })
    await expect(fila.getByRole('cell').nth(2)).toHaveAttribute('data-etiqueta', 'Años')
    await expect(fila.getByRole('cell').nth(2)).toBeVisible()
  })
}

test('en escritorio sigue siendo una tabla con sus cuatro encabezados a la vista', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/metodologia')
  const cols = page.getByRole('table').getByRole('columnheader')
  await expect(cols).toHaveText(['Variable', 'Fuente', 'Resolución', 'Años'])
  for (const c of await cols.all()) await expect(c).toBeVisible()
})
