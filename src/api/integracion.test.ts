import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Prueba contra la API real del backend: confirma que el contrato que el front espera
 * es el que el backend sirve de verdad (si no, la app cae en silencio a la copia local).
 * Se salta sin API:
 *   (en nasa-challenge-backend)  cargo run
 *   VITE_API_INTEGRACION=http://localhost:3000 pnpm test
 */
const URL_API = import.meta.env.VITE_API_INTEGRACION as string | undefined

describe.skipIf(!URL_API)('integración con la API real', () => {
  beforeEach(() => vi.stubEnv('VITE_API_URL', URL_API!))
  afterEach(() => vi.unstubAllEnvs())

  async function cargar() {
    vi.resetModules()
    return import('./consultas')
  }

  it('datosDeApi trae lluvia y temperatura con las 25 zonas y sus tendencias', async () => {
    const { datosDeApi } = await cargar()
    const datos = await datosDeApi()
    expect(datos, 'la API no cumple el contrato: el front usaría la copia local').not.toBeNull()
    for (const v of ['lluvia', 'temperatura'] as const) {
      const d = datos![v]
      expect(d, `sin datos de ${v}`).not.toBeNull()
      expect(Object.keys(d!.zonas)).toHaveLength(25)
      expect(d!.rango.year_end).toBeGreaterThan(d!.rango.year_start)
      expect(d!.fuente).toBeTruthy()
    }
  })

  it('la lluvia llega en mm/año (la API la da en mm/día)', async () => {
    const { detalleDeApi } = await cargar()
    const lluvia = await detalleDeApi('15', 'lluvia')
    expect(lluvia?.serie.length).toBeGreaterThan(20)
    // Lima ronda 1 mm/día: en mm/año son cientos; en mm/día no pasaría de unidades
    expect(lluvia!.serie[0].v).toBeGreaterThan(50)
  })

  it('la temperatura llega en °C sin conversión', async () => {
    const { detalleDeApi } = await cargar()
    const temp = await detalleDeApi('15', 'temperatura')
    expect(temp?.serie.length).toBeGreaterThan(20)
    expect(temp!.serie[0].v).toBeLessThan(40)
  })
})
