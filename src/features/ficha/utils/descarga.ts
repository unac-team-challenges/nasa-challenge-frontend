import { NOMBRE, REGION, serie, type Variable, type Zona } from '@/data/datos'
import { fuenteEmbebida } from '@/features/ficha/utils/exportar'
import { serieCsv, type Punto } from '@/features/ficha/utils/serie'

/** Valores de la serie que caen entre dos años (los dos incluidos). */
export function recortar(pts: Punto[], desde: number, hasta: number) {
  return pts.filter((p) => p.y >= desde && p.y <= hasta)
}

/**
 * El CSV con la cita arriba, como líneas de comentario con «#» (pandas: `comment='#'`; R:
 * `comment.char = '#'`; en Excel quedan como las primeras filas). Así el archivo no pierde su fuente.
 */
export function conCita(csv: string, lineas: string[]) {
  return [...lineas.map((l) => `# ${l}`), csv].join('\n')
}

/** Serie de una zona entre dos años, como CSV (año y valor). */
export function serieRangoCsv(pts: Punto[], variable: Variable, desde: number, hasta: number) {
  return serieCsv(recortar(pts, desde, hasta), variable)
}

const COLUMNA = { lluvia: 'lluvia_mm', temperatura: 'temperatura_c', vegetacion: 'ndvi' } as const

/**
 * Un solo año de los 25 departamentos: id, nombre, región, valor de ese año y estado de la
 * tendencia del periodo. Sin dato para ese año (p. ej. sin El Niño) la celda queda vacía, no en 0.
 */
export function cortePorAnioCsv(
  zonas: Record<string, Zona>,
  variable: Variable,
  anio: number,
  sinNino = false,
) {
  const cab = ['id', 'departamento', 'region', 'anio', COLUMNA[variable], 'estado_tendencia']
  const filas = Object.keys(NOMBRE)
    .sort()
    .map((id) => {
      const valor = serie(id, variable, { year_start: anio, year_end: anio }, sinNino)[0]?.v
      return [
        id,
        `"${NOMBRE[id]}"`,
        REGION[id],
        anio,
        valor == null ? '' : +valor.toFixed(3),
        zonas[id]?.status ?? '',
      ].join(',')
    })
  return [cab.join(','), ...filas].join('\n')
}

/** Nombre de archivo sin tildes, espacios ni símbolos: «Madre de Dios» → «madre-de-dios». */
export function nombreArchivo(...partes: (string | number)[]) {
  return partes
    .map((p) =>
      String(p)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    )
    .filter(Boolean)
    .join('-')
}

export interface ColoresGrafico {
  fondo: string
  texto: string
  suave: string
  rejilla: string
  trazo: string
}

const UNIDAD = { lluvia: 'mm', temperatura: '°C', vegetacion: 'NDVI' } as const
const DECIMALES = { lluvia: 0, temperatura: 1, vegetacion: 2 } as const

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * El gráfico de la serie de una zona entre dos años, como un SVG propio (no se copia el de la
 * pantalla, que muestra siempre todo el periodo). Lleva título y la fuente al pie. Los colores
 * llegan ya resueltos: un SVG suelto no ve las variables CSS de la página.
 */
export function graficoSvg(
  pts: Punto[],
  variable: Variable,
  opciones: { titulo: string; pie: string[]; colores: ColoresGrafico; fuenteCss?: string },
) {
  const { titulo, pie, colores: c } = opciones
  const ancho = 720
  const margen = { izq: 64, der: 24, arriba: 56, abajo: 44 }
  const alto = 360 + pie.length * 16
  const hGraf = 360 - margen.arriba - margen.abajo
  const wGraf = ancho - margen.izq - margen.der
  const y0 = pts[0]?.y ?? 0
  const y1 = pts[pts.length - 1]?.y ?? 1
  const vals = pts.map((p) => p.v)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const hueco = (max - min || Math.abs(max) || 1) * 0.1
  const lo = min - hueco
  const hi = max + hueco
  const x = (a: number) => margen.izq + (y1 === y0 ? wGraf / 2 : ((a - y0) / (y1 - y0)) * wGraf)
  const y = (v: number) => margen.arriba + (1 - (v - lo) / (hi - lo)) * hGraf
  const fmt = (v: number) => v.toFixed(DECIMALES[variable])
  const marcas = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3)
  const anios = [...new Set([y0, Math.round((y0 + y1) / 2), y1])]
  const linea = pts.map((p) => `${x(p.y).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')

  const partes = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}" font-family="'Public Sans Variable', system-ui, sans-serif">`,
    opciones.fuenteCss ? `<style>${opciones.fuenteCss}</style>` : '',
    `<rect width="100%" height="100%" fill="${c.fondo}"/>`,
    `<text x="${margen.izq}" y="30" font-size="17" font-weight="700" fill="${c.texto}">${esc(titulo)}</text>`,
    `<text x="${margen.izq - 8}" y="${margen.arriba - 14}" font-size="11" text-anchor="end" fill="${c.suave}">${UNIDAD[variable]}</text>`,
    ...marcas.map(
      (v) =>
        `<line x1="${margen.izq}" x2="${ancho - margen.der}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="${c.rejilla}"/>` +
        `<text x="${margen.izq - 8}" y="${(y(v) + 4).toFixed(1)}" font-size="11" text-anchor="end" fill="${c.suave}">${fmt(v)}</text>`,
    ),
    ...anios.map(
      (a) =>
        `<text x="${x(a).toFixed(1)}" y="${margen.arriba + hGraf + 20}" font-size="11" text-anchor="middle" fill="${c.suave}">${a}</text>`,
    ),
    pts.length > 1
      ? `<polyline points="${linea}" fill="none" stroke="${c.trazo}" stroke-width="2.5" stroke-linejoin="round"/>`
      : '',
    ...pts.map(
      (p) =>
        `<circle cx="${x(p.y).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.5" fill="${c.trazo}"/>`,
    ),
    ...pie.map(
      (l, i) =>
        `<text x="${margen.izq}" y="${360 + i * 16}" font-size="10.5" fill="${c.suave}">${esc(l)}</text>`,
    ),
    '</svg>',
  ]
  return { texto: partes.join(''), ancho, alto }
}

/** Pasa un SVG (como texto) a PNG al doble de resolución, para que se vea nítido impreso. */
export function svgAPng(texto: string, ancho: number, alto: number) {
  return new Promise<Blob>((ok, mal) => {
    const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => {
      const escala = 2
      const lienzo = document.createElement('canvas')
      lienzo.width = ancho * escala
      lienzo.height = alto * escala
      const ctx = lienzo.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return mal(new Error('canvas'))
      }
      ctx.scale(escala, escala)
      ctx.drawImage(img, 0, 0, ancho, alto)
      URL.revokeObjectURL(url)
      lienzo.toBlob((b) => (b ? ok(b) : mal(new Error('png'))), 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      mal(new Error('svg'))
    }
    img.src = url
  })
}

/** Baja un blob como archivo. */
export function bajarBlob(nombre: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  // Safari necesita que la URL siga viva un momento después del clic
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Lee los colores del tema activo (el PNG sale con el mismo tema que se está viendo). */
export function coloresDelTema(tokenTrazo: string): ColoresGrafico {
  const cs = getComputedStyle(document.documentElement)
  const v = (n: string) => cs.getPropertyValue(n).trim()
  return {
    fondo: v('--panel'),
    texto: v('--fg'),
    suave: v('--muted'),
    rejilla: v('--line'),
    trazo: v(tokenTrazo),
  }
}

/** Arma y baja el PNG del gráfico de la serie recortada. */
export async function bajarGraficoPng(
  nombre: string,
  pts: Punto[],
  variable: Variable,
  opciones: { titulo: string; pie: string[]; tokenTrazo: string },
) {
  const { texto, ancho, alto } = graficoSvg(pts, variable, {
    titulo: opciones.titulo,
    pie: opciones.pie,
    colores: coloresDelTema(opciones.tokenTrazo),
    fuenteCss: await fuenteEmbebida(),
  })
  bajarBlob(`${nombre}.png`, await svgAPng(texto, ancho, alto))
}

/**
 * La ficha como PDF por la vía del navegador («Guardar como PDF» del diálogo de impresión).
 * Mientras se imprime, la pestaña se llama como el archivo que se quiere guardar.
 */
export function imprimirFicha(nombre: string) {
  const antes = document.title
  const restaurar = () => {
    document.title = antes
    removeEventListener('afterprint', restaurar)
  }
  addEventListener('afterprint', restaurar)
  document.title = nombre
  print()
}
