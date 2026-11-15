import { describe, expect, it } from 'vitest'
import type { Zona } from '@/data/datos'
import {
  anomalias,
  filasSerie,
  peoresAnios,
  promedio,
  serieCsv,
  iniciosDeRacha,
  escalaTendencia,
  medida,
  aniosMalosPorMitad,
  anioParaRecordar,
  compararMalos,
  cuantoFalto,
  frecuencia,
  mediana,
  respuestaMalos,
  comoFue,
  tendenciaSinMasMalos,
  efectoNino,
  anioNormal,
  m3PorHectarea,
} from '@/features/ficha/utils/serie'

const pts = [
  { y: 2001, v: 100 },
  { y: 2002, v: 50 },
  { y: 2003, v: 150 },
  { y: 2004, v: 100 },
]

describe('utilidades de la serie de la ficha', () => {
  it('promedio es «lo normal» de la serie', () => {
    expect(promedio(pts)).toBe(100)
    expect(promedio([])).toBe(0)
  })

  it('la recta de Sen usa el intercepto del pipeline, no el promedio, y la banda la contiene', () => {
    // 1 mm por año e intercepto −1900: valor(2001) = 101. El promedio (100) daría otra recta.
    const filas = filasSerie(pts, {
      slope_per_decade: 10,
      ci_low: 0,
      ci_high: 20,
      intercept: -1900,
    })
    expect(filas[0].tendencia).toBeCloseTo(101)
    expect(filas[3].tendencia).toBeCloseTo(104)
    for (const f of filas) {
      expect(f.banda[0]).toBeLessThanOrEqual(f.tendencia)
      expect(f.banda[1]).toBeGreaterThanOrEqual(f.tendencia)
    }
  })

  it('sin intercepto la recta pasa por el promedio en el año central', () => {
    const filas = filasSerie(pts, { slope_per_decade: 10, ci_low: 0, ci_high: 20, intercept: null })
    expect(filas[0].tendencia).toBeCloseTo(98.5)
    expect(filas[3].tendencia).toBeCloseTo(101.5)
  })

  it('la lluvia se compara en % del promedio; la temperatura en °C', () => {
    expect(anomalias(pts, 'lluvia').map((f) => f.a)).toEqual([0, -50, 50, 0])
    expect(anomalias(pts, 'temperatura').map((f) => f.a)).toEqual([0, -50, 50, 0])
  })

  it('peores años: los más secos para lluvia, los más calurosos para temperatura', () => {
    expect(peoresAnios(pts, 'lluvia', 1)).toEqual([2002])
    expect(peoresAnios(pts, 'temperatura', 1)).toEqual([2003])
  })

  it('CSV con cabecera según la variable', () => {
    expect(serieCsv(pts.slice(0, 1), 'lluvia')).toBe('anio,lluvia_mm\n2001,100')
  })
})

describe('etiquetas y escala', () => {
  it('El Niño se etiqueta una vez por racha de años seguidos', () => {
    expect(iniciosDeRacha([1997, 1998, 2015, 2016, 2023])).toEqual([1997, 2015, 2023])
  })

  it('la escala del medidor es el mayor |valor| de las zonas con datos', () => {
    const z = (s: number, a: number, b: number, status = 'real', pct: number | null = null) =>
      ({
        slope_per_decade: s,
        ci_low: a,
        ci_high: b,
        status,
        pct_change_per_decade: pct,
      }) as unknown as Zona
    expect(
      escalaTendencia([z(10, 2, 30), z(-5, -40, 1), z(99, 99, 99, 'pocos_datos')], 'temperatura'),
    ).toBe(40)
    // Lluvia: en % de su promedio; 50 mm con +10 % → el rango 20–80 mm es 4–16 %
    expect(escalaTendencia([z(50, 20, 80, 'real', 10)], 'lluvia')).toBeCloseTo(16)
  })
})

describe('medida del medidor', () => {
  it('lluvia en % del promedio; temperatura tal cual', () => {
    const z = { slope_per_decade: 50, ci_low: 20, ci_high: 80, pct_change_per_decade: 10 }
    expect(medida(z, 'lluvia')).toEqual({ v: 10, lo: 4, hi: 16, pct: true })
    expect(medida(z, 'temperatura')).toEqual({ v: 50, lo: 20, hi: 80, pct: false })
    expect(medida({ ...z, slope_per_decade: 0 }, 'lluvia').pct).toBe(false)
  })
})

describe('ficha del agricultor', () => {
  const serie = (vals: number[]) => vals.map((v, i) => ({ y: 2001 + i, v }))

  it('años secos por mitad: 20 % o más bajo lo normal', () => {
    // promedio 100: 70 y 80 son secos; 90 no
    const r = aniosMalosPorMitad(serie([70, 100, 130, 100, 80, 90, 130, 100]), 'lluvia')!
    expect([r.antes.desde, r.antes.hasta, r.antes.malos]).toEqual([2001, 2004, 1])
    expect([r.ahora.desde, r.ahora.hasta, r.ahora.malos]).toEqual([2005, 2008, 1])
  })

  it('años secos: la línea base es la primera mitad, no el promedio de todo el periodo', () => {
    // Baja de 120 a 90. Contra el promedio de todo el periodo (105) ningún año sale seco (−14 %);
    // contra la primera mitad (120), los 4 años recientes sí (−25 %).
    const r = aniosMalosPorMitad(serie([120, 120, 120, 120, 90, 90, 90, 90]), 'lluvia')!
    expect(r.antes.malos).toBe(0)
    expect(r.ahora.malos).toBe(4)
  })

  it('años secos: lo de siempre es la mediana sin El Niño, no el promedio inflado por el Niño', () => {
    // 2003 es Niño (300 mm). Con el promedio de la primera mitad (150), 85 mm saldría seco (−43 %);
    // contra la mediana sin el Niño (100) es −15 %: un año flojo, no de seca.
    const r = aniosMalosPorMitad(serie([100, 100, 300, 100, 85, 85, 85, 85]), 'lluvia', [2003])!
    expect(r.ahora.malos).toBe(0)
    // Sin decirle cuál es el Niño, la mediana igual lo aguanta mejor que el promedio
    expect(
      aniosMalosPorMitad(serie([100, 100, 300, 100, 85, 85, 85, 85]), 'lluvia')!.ahora.malos,
    ).toBe(0)
  })

  it('mediana: el valor del medio', () => {
    expect(mediana([3, 1, 2])).toBe(2)
    expect(mediana([4, 1, 3, 2])).toBe(2.5)
  })

  it('años calurosos: 0,3 °C o más sobre lo normal', () => {
    const r = aniosMalosPorMitad(serie([10, 10, 10, 10, 10.5, 9.5]), 'temperatura')!
    expect(r.ahora.malos).toBe(1)
    expect(r.antes.malos).toBe(0)
  })

  it('años de poco verdor: el piso de 0,01 NDVI en un departamento estable (selva)', () => {
    // Primeros años 0,830 ± 0,002: la desviación (0,002) queda bajo el piso. 0,825 es ruido; 0,815 es año malo.
    const r = aniosMalosPorMitad(serie([0.828, 0.832, 0.828, 0.832, 0.825, 0.815]), 'vegetacion')!
    expect(r.antes.malos).toBe(0)
    expect(r.ahora.malos).toBe(1)
  })

  it('años de poco verdor: un departamento que varía mucho exige una caída mayor que 0,01', () => {
    // Primeros años 0,36 ± 0,04: el umbral sube a ~0,04. Bajar 0,02 no cuenta; bajar 0,08 sí.
    const r = aniosMalosPorMitad(serie([0.32, 0.4, 0.32, 0.4, 0.34, 0.28]), 'vegetacion')!
    expect(r.ahora.malos).toBe(1)
  })

  it('El Niño: promedio de la anomalía en sus años', () => {
    const e = efectoNino(serie([100, 200, 100, 0]), 'lluvia', [2002, 2004, 1998])!
    expect(e.anios).toEqual([2002, 2004])
    expect(e.promedio).toBeCloseTo(0) // +100 % y −100 %
    expect(efectoNino(serie([1, 2]), 'lluvia', [1998])).toBeNull()
  })

  it('El Niño: se mide contra la recta de Sen, no contra el promedio, si hay tendencia', () => {
    // sube 1 mm por año (intercepto −1900): esperado(2002) = 102, esperado(2004) = 104
    const p = [
      { y: 2001, v: 101 },
      { y: 2002, v: 112 }, // +10 sobre lo esperado
      { y: 2003, v: 103 },
      { y: 2004, v: 104 }, // justo lo esperado
    ]
    const e = efectoNino(p, 'lluvia', [2002, 2004], { slope_per_decade: 10, intercept: -1900 })!
    expect(e.promedio).toBeCloseTo(((10 / 102) * 100) / 2, 5)
    // contra el promedio (105) saldría negativo: la tendencia taparía el efecto
    expect(efectoNino(p, 'lluvia', [2002, 2004])!.promedio).toBeLessThan(5)
  })

  it('año normal: promedio y mitad central de los años', () => {
    expect(anioNormal(serie([10, 20, 30, 40, 50]))).toEqual({ promedio: 30, bajo: 20, alto: 40 })
    expect(m3PorHectarea(231)).toBe(2310)
  })
})

describe('compararMalos', () => {
  const m = (malos: number, n: number) => ({ malos, anios: Array(n).fill(0) })
  it('compara proporciones, no conteos', () => {
    expect(compararMalos(m(2, 12), m(5, 12))).toBe('mas')
    expect(compararMalos(m(5, 12), m(2, 12))).toBe('menos')
    expect(compararMalos(m(3, 12), m(4, 12))).toBe('igual')
    // mitades desiguales (sin El Niño): 4 de 8 es más que 3 de 12 aunque la diferencia en conteo sea 1
    expect(compararMalos(m(3, 12), m(4, 8))).toBe('mas')
  })
})

describe('respuestaMalos', () => {
  const z = (status: 'real' | 'posible_casualidad', slope: number) => ({
    status,
    slope_per_decade: slope,
  })
  it('afirma solo si la tendencia es real y va hacia el mismo lado', () => {
    expect(respuestaMalos('mas', z('real', -20), 'lluvia')).toBe('si')
    expect(respuestaMalos('menos', z('real', 20), 'lluvia')).toBe('no')
    expect(respuestaMalos('mas', z('real', 0.2), 'temperatura')).toBe('si')
  })
  it('si puede ser casualidad, no lo llama costumbre (no contradice a la confianza)', () => {
    expect(respuestaMalos('mas', z('posible_casualidad', -20), 'lluvia')).toBe('masSinSeguro')
    expect(respuestaMalos('menos', z('posible_casualidad', 20), 'lluvia')).toBe('menosSinSeguro')
  })
  it('si la tendencia real va al otro lado, tampoco afirma', () => {
    expect(respuestaMalos('mas', z('real', 20), 'lluvia')).toBe('masSinSeguro')
  })
  it('igual es igual, sea cual sea la tendencia', () => {
    expect(respuestaMalos('igual', z('real', -20), 'lluvia')).toBe('igual')
  })
})

describe('frecuencia', () => {
  it('cada cuánto viene un año malo, en palabras de campo', () => {
    expect(frecuencia(0, 22)).toEqual({ tipo: 'ninguno' })
    expect(frecuencia(20, 22)).toEqual({ tipo: 'casiTodos' })
    expect(frecuencia(14, 22)).toEqual({ tipo: 'dosDeTres' })
    expect(frecuencia(11, 22)).toEqual({ tipo: 'unoSiUnoNo' })
    expect(frecuencia(4, 22)).toEqual({ tipo: 'cadaEntre', de: 5, a: 6 })
    expect(frecuencia(5, 12)).toEqual({ tipo: 'cadaEntre', de: 2, a: 3 })
    expect(frecuencia(3, 12)).toEqual({ tipo: 'cada', cada: 4 })
    expect(frecuencia(1, 12)).toEqual({ tipo: 'cada', cada: 12 })
  })
})

describe('anioParaRecordar y cuantoFalto', () => {
  const a = (y: number, v: number, malo: boolean) => ({ y, a: v, malo })
  it('el peor año malo reciente; si no hay, el peor de antes', () => {
    const antes = { anios: [a(2001, -40, true), a(2002, 5, false)] }
    expect(
      anioParaRecordar(
        { antes, ahora: { anios: [a(2003, -22, true), a(2004, -30, true)] } },
        'lluvia',
      )?.y,
    ).toBe(2004)
    expect(anioParaRecordar({ antes, ahora: { anios: [a(2003, 3, false)] } }, 'lluvia')?.y).toBe(
      2001,
    )
    expect(anioParaRecordar({ antes: { anios: [] }, ahora: { anios: [] } }, 'lluvia')).toBeNull()
  })
  it('cuánta lluvia faltó, en fracciones', () => {
    expect(cuantoFalto(-22)).toBe('cuarto')
    expect(cuantoFalto(-33)).toBe('tercio')
    expect(cuantoFalto(-50)).toBe('mitad')
    expect(cuantoFalto(-70)).toBe('masMitad')
  })
})

describe('comoFue', () => {
  it('por debajo, dentro o por encima de la mitad central de los años', () => {
    const n = { bajo: 800, alto: 1200 }
    expect(comoFue(600, n)).toBe('bajo')
    expect(comoFue(1000, n)).toBe('normal')
    expect(comoFue(1300, n)).toBe('alto')
  })
})

describe('tendenciaSinMasMalos', () => {
  const z = (status: 'real' | 'posible_casualidad', slope: number) => ({
    status,
    slope_per_decade: slope,
  })
  it('Loreto: llueve menos en promedio (cambio real) pero no hay más años de seca', () => {
    expect(tendenciaSinMasMalos('igual', z('real', -90), 'lluvia')).toBe(true)
    expect(tendenciaSinMasMalos('menosSinSeguro', z('real', -90), 'lluvia')).toBe(true)
  })
  it('no aclara si la tendencia no es clara, va hacia lo bueno o ya hay más años malos', () => {
    expect(tendenciaSinMasMalos('igual', z('posible_casualidad', -90), 'lluvia')).toBe(false)
    expect(tendenciaSinMasMalos('igual', z('real', 90), 'lluvia')).toBe(false)
    expect(tendenciaSinMasMalos('si', z('real', -90), 'lluvia')).toBe(false)
  })
})
