import { expect } from '@playwright/test'
import { test } from './apoyo/espanol'

test('el .ico va con su tamaño real y el SVG al final, para que Chrome use el SVG', async ({
  page,
}) => {
  await page.goto('/')
  const enlaces = await page
    .locator('link[rel="icon"]')
    .evaluateAll((ls) =>
      ls.map((l) => ({ href: l.getAttribute('href'), sizes: l.getAttribute('sizes') })),
    )
  expect(enlaces.map((e) => e.href)).toEqual(['/favicon.ico', '/favicon.svg'])
  // con sizes="any" Chrome elige el .ico y nunca llega al SVG con modo oscuro
  expect(enlaces[0].sizes).not.toBe('any')
})

test('las imágenes de marca existen: favicon.svg, .ico y og.png de 1200 × 630', async ({
  request,
}) => {
  for (const ruta of ['/favicon.svg', '/favicon.ico', '/logo.png']) {
    const r = await request.get(ruta)
    expect(r.ok(), ruta).toBe(true)
  }
  const svg = await (await request.get('/favicon.svg')).text()
  expect(svg).toContain('prefers-color-scheme:dark')
  const og = Buffer.from(await (await request.get('/og.png')).body())
  expect(og.readUInt32BE(16)).toBe(1200)
  expect(og.readUInt32BE(20)).toBe(630)
})
