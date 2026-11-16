import { describe, expect, it } from 'vitest'
import { PERIODOS, serie, zonasDe } from '@/data/datos'
import {
  conCita,
  cortePorAnioCsv,
  graficoSvg,
  nombreArchivo,
  recortar,
  serieRangoCsv,
} from '@/features/ficha/utils/descarga'

const pts = [2001, 2002, 2003, 2004, 2005].map((y, i) => ({ y, v: 100 + i }))
const colores = { fondo: '#fff', texto: '#111', suave: '#555', rejilla: '#ddd', trazo: '#06c' }

describe('descarga del estudiante', () => {
  it('recortar deja los años entre desde y hasta, los dos incluidos', () => {
    expect(recortar(pts, 2002, 2004).map((p) => p.y)).toEqual([2002, 2003, 2004])
    expect(recortar(pts, 2004, 2004).map((p) => p.y)).toEqual([2004])
    expect(recortar(pts, 2010, 2020)).toEqual([])
  })

  it('CSV de una zona en un rango: cabecera según la variable y solo esos años', () => {
    expect(serieRangoCsv(pts, 'lluvia', 2003, 2004)).toBe('anio,lluvia_mm\n2003,102\n2004,103')
  })

  it('la cita va arriba, como comentarios con «#», y la cabecera sigue en su línea', () => {
    const csv = conCita('anio,lluvia_mm\n2003,102', ['Fuente: NASA POWER', 'Datos del 2026-11-14'])
    expect(csv.split('\n')).toEqual([
      '# Fuente: NASA POWER',
      '# Datos del 2026-11-14',
      'anio,lluvia_mm',
      '2003,102',
    ])
  })

  it('un año de los 25 departamentos: una fila por zona con su valor de ese año', () => {
    const zonas = zonasDe('lluvia', 'reciente')
    const anio = PERIODOS.reciente.year_start + 3
    const filas = cortePorAnioCsv(zonas, 'lluvia', anio).split('\n')
    expect(filas[0]).toBe('id,departamento,region,anio,lluvia_mm,estado_tendencia')
    expect(filas).toHaveLength(26)
    const puno = filas.find((l) => l.startsWith('21,'))!
    const esperado = serie('21', 'lluvia', { year_start: anio, year_end: anio })[0].v
    expect(puno).toContain(`"Puno",sierra,${anio},${+esperado.toFixed(3)},`)
  })

  it('un año sin dato sale con la celda vacía, no en cero', () => {
    const zonas = zonasDe('lluvia', 'reciente')
    const fila = cortePorAnioCsv(zonas, 'lluvia', 1900).split('\n')[1]
    expect(fila.split(',')[4]).toBe('')
  })

  it('nombre de archivo sin tildes ni espacios', () => {
    expect(nombreArchivo('Madre de Dios', 'lluvia', 2001, 2024)).toBe(
      'madre-de-dios-lluvia-2001-2024',
    )
    expect(nombreArchivo('Áncash', 'temperatura')).toBe('ancash-temperatura')
  })

  it('el gráfico en SVG lleva título, los años de los extremos y la fuente al pie', () => {
    const { texto, alto } = graficoSvg(pts, 'lluvia', {
      titulo: 'Piura & «lluvia»',
      pie: ['Fuente: NASA POWER'],
      colores,
    })
    expect(texto).toContain('Piura &amp; «lluvia»')
    expect(texto).toContain('>2001<')
    expect(texto).toContain('>2005<')
    expect(texto).toContain('Fuente: NASA POWER')
    expect(texto).toContain('<polyline')
    expect(alto).toBeGreaterThan(360)
  })

  it('un solo año se dibuja como un punto, sin línea ni división por cero', () => {
    const { texto } = graficoSvg(pts.slice(0, 1), 'lluvia', { titulo: 'x', pie: [], colores })
    expect(texto).not.toContain('<polyline')
    expect(texto).not.toContain('NaN')
  })
})
