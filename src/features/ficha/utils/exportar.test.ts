import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SVG_NS = 'http://www.w3.org/2000/svg'

function grafico() {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  const linea = document.createElementNS(SVG_NS, 'path')
  linea.setAttribute('style', 'stroke: rgb(1, 2, 3); fill: none')
  const texto = document.createElementNS(SVG_NS, 'text')
  texto.textContent = 'Áncash'
  svg.append(linea, texto)
  document.body.append(svg)
  vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
    width: 320,
    height: 180,
  } as DOMRect)
  return svg
}

function fuenteQueCarga() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ blob: () => Promise.resolve(new Blob(['woff2'])) })),
  )
}

beforeEach(() => {
  document.documentElement.style.setProperty('--panel', '#ebefef')
  URL.createObjectURL = vi.fn(() => 'blob:prueba')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
  document.body.innerHTML = ''
})

describe('exportar gráficos', () => {
  it('el SVG suelto lleva tamaño, colores ya calculados, fondo del panel y la fuente incrustada', async () => {
    fuenteQueCarga()
    const { svgSuelto } = await import('@/features/ficha/utils/exportar')
    const { texto, width, height } = await svgSuelto(grafico())
    expect([width, height]).toEqual([320, 180])
    // el espacio de nombres sale una sola vez (dos `xmlns` harían inválido el SVG)
    expect(texto.match(/xmlns="http:\/\/www.w3.org\/2000\/svg"/g)).toHaveLength(1)
    expect(texto).toContain('width="320"')
    // fondo: el panel, y va antes que el gráfico
    expect(texto).toMatch(/<rect[^>]*fill: rgb\(235, 239, 239\)/)
    // los colores del gráfico viajan en el propio elemento
    expect(texto).toMatch(/stroke: rgb\(1, 2, 3\)/)
    // la fuente de la interfaz va dentro del SVG como data URI
    expect(texto).toContain('@font-face')
    expect(texto).toContain("font-family:'Public Sans Variable'")
    expect(texto).toContain('url(data:')
  })

  it('si la fuente no se puede bajar, el SVG sale igual, sin @font-face', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('sin red'))),
    )
    const { svgSuelto } = await import('@/features/ficha/utils/exportar')
    const { texto } = await svgSuelto(grafico())
    expect(texto).toContain('Áncash')
    expect(texto).not.toContain('@font-face')
  })

  it('exportarSvg baja «nombre.svg» y libera la URL después del clic', async () => {
    fuenteQueCarga()
    const nombres: string[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      nombres.push(this.download)
    })
    const { exportarSvg } = await import('@/features/ficha/utils/exportar')
    await exportarSvg(grafico(), 'piura-lluvia-serie')
    expect(nombres).toEqual(['piura-lluvia-serie.svg'])
    // no se libera en el mismo instante del clic (Safari), sino un poco después
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:prueba'), {
      timeout: 3000,
    })
  })

  it('exportarPng: si la imagen no carga, libera la URL y no baja nada', async () => {
    fuenteQueCarga()
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_: string) {
          queueMicrotask(() => this.onerror?.())
        }
      },
    )
    const { exportarPng } = await import('@/features/ficha/utils/exportar')
    await exportarPng(grafico(), 'ranking-lluvia')
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:prueba'))
    expect(clic).not.toHaveBeenCalled()
  })
})
