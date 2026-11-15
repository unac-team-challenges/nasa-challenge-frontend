/**
 * Exporta un gráfico de Recharts (su <svg>) como SVG o PNG para pegarlo en una tesis.
 * Los colores del tema son variables CSS (var(--up)…) que fuera de la página no existen:
 * antes de exportar se copian los colores ya calculados a cada elemento.
 */

import fuenteUrl from '@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2?url'

/**
 * Un SVG abierto como imagen (o dentro de un PNG) no puede cargar las fuentes de la página: sin esto
 * los textos salen con la fuente de reserva. Se incrusta la fuente de la interfaz como data URI
 * (solo el subconjunto latino, ~36 kB en base64). Si no se puede bajar, el gráfico sale igual.
 */
let fuenteCss: Promise<string> | null = null
export function fuenteEmbebida() {
  fuenteCss ??= fetch(fuenteUrl)
    .then((r) => r.blob())
    .then(
      (b) =>
        new Promise<string>((ok, mal) => {
          const lector = new FileReader()
          lector.onload = () => ok(String(lector.result))
          lector.onerror = () => mal(lector.error)
          lector.readAsDataURL(b)
        }),
    )
    .then(
      (datos) =>
        `@font-face{font-family:'Public Sans Variable';font-style:normal;font-weight:100 900;src:url(${datos}) format('woff2')}`,
    )
    .catch(() => '')
  return fuenteCss
}

const PROPS = ['fill', 'stroke', 'stop-color', 'color', 'opacity', 'fill-opacity', 'stroke-opacity']

export async function svgSuelto(svg: SVGSVGElement) {
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
    if (el.localName === 'text') {
      dest.style.setProperty('font-family', cs.fontFamily)
      dest.style.setProperty('font-size', cs.fontSize)
      dest.style.setProperty('font-weight', cs.fontWeight)
    }
  })
  const { width, height } = svg.getBoundingClientRect()
  copia.setAttribute('width', String(Math.round(width)))
  copia.setAttribute('height', String(Math.round(height)))
  // Fondo del panel: sin él, el PNG sale transparente y los textos claros no se leen
  const fondo = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  fondo.setAttribute('width', '100%')
  fondo.setAttribute('height', '100%')
  // Fondo del panel donde vive el gráfico (no el del body, que es más oscuro)
  const panel = getComputedStyle(document.documentElement).getPropertyValue('--panel').trim()
  fondo.style.setProperty('fill', panel || getComputedStyle(document.body).backgroundColor)
  copia.insertBefore(fondo, copia.firstChild)
  const css = await fuenteEmbebida()
  if (css) {
    const estilo = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    estilo.textContent = css
    copia.insertBefore(estilo, copia.firstChild)
  }
  return { texto: new XMLSerializer().serializeToString(copia), width, height }
}

function bajar(nombre: string, url: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  // Safari necesita que la URL siga viva un momento después del clic
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportarSvg(svg: SVGSVGElement, nombre: string) {
  const { texto } = await svgSuelto(svg)
  const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
  bajar(`${nombre}.svg`, url)
}

/** PNG al doble de resolución, para que se vea nítido impreso. */
export async function exportarPng(svg: SVGSVGElement, nombre: string) {
  const { texto, width, height } = await svgSuelto(svg)
  const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
  const img = new Image()
  img.onload = () => {
    const escala = 2
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(width * escala)
    lienzo.height = Math.round(height * escala)
    const ctx = lienzo.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return
    }
    ctx.scale(escala, escala)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(url)
    lienzo.toBlob((b) => {
      if (!b) return
      const png = URL.createObjectURL(b)
      bajar(`${nombre}.png`, png)
    }, 'image/png')
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}
