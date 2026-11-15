import { describe, expect, it } from 'vitest'
import { zonasDe } from '@/data/datos'
import { ranking, robustez, tablaCsv } from '@/features/ficha/utils/estudiante'

describe('ficha del estudiante', () => {
  it('robustez: 4 casos (2 periodos × con y sin El Niño)', () => {
    const r = robustez('11', 'lluvia')
    expect(r.casos.map((c) => `${c.periodo}${c.sinNino ? '-sin' : ''}`)).toEqual([
      'reciente',
      'reciente-sin',
      'largo',
      'largo-sin',
    ])
    // Ica: «cambio real» en los 4 y siempre hacia más lluvia (copia local del 14 nov)
    expect(r.veredicto).toBe('robusto')
  })

  it('robustez: Piura cambia de sentido según el periodo', () => {
    const r = robustez('20', 'lluvia')
    expect(r.veredicto).toBe('depende')
    expect(r.cambiaSigno).toBe(true)
  })

  it('robustez: sin datos, «pocos»', () => {
    expect(robustez('07', 'lluvia').veredicto).toBe('pocos')
  })

  it('ranking: de mayor a menor pendiente, sin las zonas con pocos datos', () => {
    const zonas = zonasDe('lluvia', 'reciente')
    const r = ranking(zonas, '21')
    expect(r.total).toBe(Object.values(zonas).filter((z) => z.status !== 'pocos_datos').length)
    for (let i = 1; i < r.orden.length; i++)
      expect(r.orden[i - 1].slope_per_decade).toBeGreaterThanOrEqual(r.orden[i].slope_per_decade)
    expect(r.orden[r.puesto! - 1].id).toBe('21')
    expect(ranking(zonas, '07').puesto).toBeNull()
  })

  it('CSV de los 25 departamentos con cabecera y una fila por zona', () => {
    const zonas = zonasDe('lluvia', 'reciente')
    const csv = tablaCsv(zonas, 'lluvia').split('\n')
    expect(csv[0]).toMatch(/^id,departamento,region,pendiente_mm_decada,/)
    expect(csv).toHaveLength(Object.keys(zonas).length + 1)
    expect(csv.find((l) => l.startsWith('21,'))).toMatch(/^21,"Puno",sierra,140\.7038,/)
  })
})
