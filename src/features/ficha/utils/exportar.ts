/**
 * Exporta un gráfico de Recharts (su <svg>) como SVG o PNG para pegarlo en una tesis.
 * Los colores del tema son variables CSS (var(--up)…) que fuera de la página no existen:
 * antes de exportar se copian los colores ya calculados a cada elemento.
 */

const PROPS = ['fill', 'stroke', 'stop-color', 'color', 'opacity', 'fill-opacity', 'stroke-opacity']

function svgSuelto(svg: SVGSVGElement) {
  const copia = svg.cloneNode(true) as SVGSVGElement
  const orig = [svg, ...svg.querySelectorAll('*')]
  const nuevos = [copia, ...copia.querySelectorAll('*')]
  orig.forEach((el, i) => {
    const cs = getComputedStyle(el)
    const dest = nuevos[i] as SVGElement
    for (const p of PROPS) {
      const v = cs.getPropertyValue(p)
      if (v) dest.style.setProperty(p, v)
    }
    if (el instanceof SVGTextElement) {
      dest.style.setProperty('font-family', cs.fontFamily)
      dest.style.setProperty('font-size', cs.fontSize)
      dest.style.setProperty('font-weight', cs.fontWeight)
    }
  })
  const { width, height } = svg.getBoundingClientRect()
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copia.setAttribute('width', String(Math.round(width)))
  copia.setAttribute('height', String(Math.round(height)))
  // Fondo del panel: sin él, el PNG sale transparente y los textos claros no se leen
  const fondo = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  fondo.setAttribute('width', '100%')
  fondo.setAttribute('height', '100%')
  fondo.style.setProperty('fill', getComputedStyle(document.body).backgroundColor)
  copia.insertBefore(fondo, copia.firstChild)
  return { texto: new XMLSerializer().serializeToString(copia), width, height }
}

function bajar(nombre: string, url: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
}

export function exportarSvg(svg: SVGSVGElement, nombre: string) {
  const { texto } = svgSuelto(svg)
  const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
  bajar(`${nombre}.svg`, url)
  URL.revokeObjectURL(url)
}

/** PNG al doble de resolución, para que se vea nítido impreso. */
export function exportarPng(svg: SVGSVGElement, nombre: string) {
  const { texto, width, height } = svgSuelto(svg)
  const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
  const img = new Image()
  img.onload = () => {
    const escala = 2
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(width * escala)
    lienzo.height = Math.round(height * escala)
    const ctx = lienzo.getContext('2d')
    if (!ctx) return
    ctx.scale(escala, escala)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(url)
    lienzo.toBlob((b) => {
      if (!b) return
      const png = URL.createObjectURL(b)
      bajar(`${nombre}.png`, png)
      URL.revokeObjectURL(png)
    }, 'image/png')
  }
  img.src = url
}
