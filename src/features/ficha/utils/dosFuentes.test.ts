import { describe, expect, it } from 'vitest'
import { veredictoDosFuentes } from '@/features/ficha/utils/dosFuentes'

const t = (slope_per_decade: number, ci_low: number, ci_high: number, status = 'real') => ({
  slope_per_decade,
  ci_low,
  ci_high,
  status,
})

describe('veredictoDosFuentes («¿Coinciden dos fuentes de NASA?»)', () => {
  it('Puno: sentidos contrarios y rangos que no se tocan -> no coinciden', () => {
    expect(veredictoDosFuentes(t(141, 60, 220), t(-91, -150, -30, 'posible_casualidad'))).toBe(
      'noCoinciden',
    )
  })

  it('+1 mm frente a −0,5 mm con rangos solapados -> dudoso, no «no coinciden»', () => {
    expect(veredictoDosFuentes(t(1, -20, 22), t(-0.5, -18, 17))).toBe('dudoso')
  })

  it('mismo sentido con al menos un rango que no cruza el cero -> coinciden', () => {
    expect(veredictoDosFuentes(t(-319, -400, -240), t(-112, -200, 5))).toBe('coinciden')
  })

  it('mismo sentido pero ninguna segura -> coincidenDebil', () => {
    expect(veredictoDosFuentes(t(10, -5, 25), t(4, -8, 15))).toBe('coincidenDebil')
  })

  it('con pocos datos en alguna fuente no se compara', () => {
    expect(veredictoDosFuentes(t(10, 1, 20, 'pocos_datos'), t(-10, -20, -1))).toBe('pocos')
  })
})
