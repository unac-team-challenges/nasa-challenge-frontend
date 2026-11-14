import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** Respuesta JSON simulada de la API. */
const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const ids = Array.from({ length: 25 }, (_, i) => String(i + 1).padStart(2, '0'))
const zonaSinStats = (id: string) => ({ id, nombre: id, lat: -10, lon: -75 })
const zonaConStats = (id: string) => ({
  ...zonaSinStats(id),
  stats: {
    slope_per_decade: 0.1,
    ci_low: 0.05,
    ci_high: 0.15,
    p_value: 0.01,
    q_value: 0.02,
    n_years: 44,
    status: 'real',
  },
})
const variables = [{ id: 'lluvia', unidad: 'mm/día', fuente: 'GPM', descripcion: '' }]

/** Simula la API: /api/zonas y /api/variables. */
function simularApi(zonas: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (req: Request) => {
      const url = new URL(req.url)
      if (url.pathname === '/api/zonas') return json(zonas)
      if (url.pathname === '/api/variables') return json(variables)
      return json({ error: 'no existe' }, 404)
    }),
  )
}

async function cargar() {
  vi.resetModules()
  return import('./consultas')
}

describe('zonasDeApi (cliente con respaldo)', () => {
  beforeEach(() => vi.stubEnv('VITE_API_URL', 'http://localhost:3000'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sin VITE_API_URL usa la copia local (null) sin llamar a la red', async () => {
    vi.stubEnv('VITE_API_URL', '')
    const espia = vi.fn()
    vi.stubGlobal('fetch', espia)
    const { zonasDeApi } = await cargar()
    expect(await zonasDeApi('lluvia')).toBeNull()
    expect(espia).not.toHaveBeenCalled()
  })

  it('si la API todavía no trae tendencias (stats), usa la copia local', async () => {
    simularApi(ids.map(zonaSinStats))
    const { zonasDeApi } = await cargar()
    expect(await zonasDeApi('lluvia')).toBeNull()
  })

  it('si la API no responde, usa la copia local', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    const { zonasDeApi } = await cargar()
    expect(await zonasDeApi('temperatura')).toBeNull()
  })

  it('si faltan zonas, usa la copia local', async () => {
    simularApi(ids.slice(0, 20).map(zonaConStats))
    const { zonasDeApi } = await cargar()
    expect(await zonasDeApi('lluvia')).toBeNull()
  })

  it('con tendencias completas usa la API y pasa la lluvia de mm/día a mm/año', async () => {
    simularApi(ids.map(zonaConStats))
    const { zonasDeApi } = await cargar()
    const zonas = await zonasDeApi('lluvia')
    expect(zonas).not.toBeNull()
    expect(Object.keys(zonas!)).toHaveLength(25)
    expect(zonas!['20'].status).toBe('real')
    expect(zonas!['20'].slope_per_decade).toBeCloseTo(36.5)
    expect(zonas!['20'].ci_low).toBeCloseTo(18.25)
  })
})
