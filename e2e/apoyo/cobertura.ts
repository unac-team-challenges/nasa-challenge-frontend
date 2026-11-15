import type { Page } from '@playwright/test'

/**
 * Qué porcentaje de la caja del mapa tapan los paneles flotantes (título, avisos, leyenda,
 * barra del tiempo y botón «⋯»). Espera a que termine la animación de entrada.
 */
export async function coberturaPaneles(page: Page): Promise<number> {
  const barra = page.getByRole('group', { name: 'Máquina del tiempo' })
  await barra.waitFor()
  await page.waitForTimeout(2500)
  return page.evaluate(() => {
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
}
