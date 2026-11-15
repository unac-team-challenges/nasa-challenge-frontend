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
  // Como el backend (#41): celdas fuera de stats y aviso en vez de motivo
  celdas: 9,
  stats: {
    slope_per_decade: 0.1,
    ci_low: 0.05,
    ci_high: 0.15,
    p_value: 0.01,
    q_value: 0.02,
    n_years: 44,
    status: 'real',
    aviso: 'IMERG cambia de satélites en 2014',
  },
})
const variables = [
  {
    id: 'lluvia',
    unidad: 'mm/día',
    fuente: 'GPM IMERG',
    descripcion: '',
    anio_inicio: 2001,
    anio_fin: 2024,
  },
  {
    id: 'temperatura',
    unidad: '°C',
    fuente: 'MODIS',
    descripcion: '',
    anio_inicio: 2001,
    anio_fin: 2024,
  },
]

/** Simula la API: /api/variables, /api/zonas (por variable) y /api/zonas/{id}. */
function simularApi(zonas: unknown, vars: unknown = variables) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (req: Request) => {
      const url = new URL(req.url)
      if (url.pathname === '/api/zonas') return json(zonas)
      if (url.pathname === '/api/variables') return json(vars)
      if (url.pathname === '/api/zonas/07')
        return json({
          id: '07',
          nombre: 'Callao',
          lat: -12,
          lon: -77,
          variable: 'lluvia',
          unidad: 'mm/día',
          fuente: 'GPM IMERG',
          nota: 'Promedio de solo 1 celda(s): dato poco confiable',
          serie: [
            { anio: 2001, valor: 0.1 },
            { anio: 2002, valor: 0.2 },
          ],
        })
      return json({ error: 'no existe' }, 404)
    }),
  )
}

async function cargar() {
  vi.resetModules()
  return import('@/api/consultas')
}

describe('datosDeApi (cliente con respaldo)', () => {
  beforeEach(() => vi.stubEnv('VITE_API_URL', 'http://localhost:3000'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sin VITE_API_URL usa la copia local (null) sin llamar a la red', async () => {
    vi.stubEnv('VITE_API_URL', '')
    const espia = vi.fn()
    vi.stubGlobal('fetch', espia)
    const { datosDeApi } = await cargar()
    expect(await datosDeApi()).toBeNull()
    expect(espia).not.toHaveBeenCalled()
  })

  it('si la API no trae el campo stats, usa la copia local', async () => {
    simularApi(ids.map(zonaSinStats))
    const { datosDeApi } = await cargar()
    expect(await datosDeApi()).toBeNull()
  })

  it('si la API no responde, usa la copia local', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    const { datosDeApi } = await cargar()
    expect(await datosDeApi()).toBeNull()
  })

  it('si faltan zonas, usa la copia local', async () => {
    simularApi(ids.slice(0, 20).map(zonaConStats))
    const { datosDeApi } = await cargar()
    expect(await datosDeApi()).toBeNull()
  })

  it('trae las dos variables con su rango y fuente, y pasa la lluvia de mm/día a mm/año', async () => {
    simularApi(ids.map(zonaConStats))
    const { datosDeApi } = await cargar()
    const datos = await datosDeApi()
    expect(datos).not.toBeNull()
    const lluvia = datos!.lluvia!
    expect(Object.keys(lluvia.zonas)).toHaveLength(25)
    expect(lluvia.zonas['20'].status).toBe('real')
    expect(lluvia.zonas['20'].slope_per_decade).toBeCloseTo(36.5)
    expect(lluvia.zonas['20'].ci_low).toBeCloseTo(18.25)
    expect(lluvia.zonas['20'].celdas).toBe(9)
    expect(lluvia.zonas['20'].motivo).toBe('IMERG cambia de satélites en 2014')
    expect(lluvia.rango).toEqual({ year_start: 2001, year_end: 2024 })
    expect(lluvia.fuente).toBe('GPM IMERG')
    // La temperatura no cambia de unidad
    expect(datos!.temperatura!.zonas['20'].slope_per_decade).toBeCloseTo(0.1)
    expect(datos!.temperatura!.fuente).toBe('MODIS')
  })

  it('una variable sin anio_inicio/anio_fin va con la copia local', async () => {
    simularApi(ids.map(zonaConStats), [variables[0], { ...variables[1], anio_inicio: null }])
    const { datosDeApi } = await cargar()
    const datos = await datosDeApi()
    expect(datos!.lluvia).not.toBeNull()
    expect(datos!.temperatura).toBeNull()
  })
})

describe('detalleDeApi', () => {
  beforeEach(() => vi.stubEnv('VITE_API_URL', 'http://localhost:3000'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('trae la serie en mm/año y la nota de la zona', async () => {
    simularApi([])
    const { detalleDeApi } = await cargar()
    const d = await detalleDeApi('07', 'lluvia')
    expect(d!.serie).toEqual([
      { y: 2001, v: expect.closeTo(36.5) },
      { y: 2002, v: expect.closeTo(73) },
    ])
    expect(d!.nota).toBe('Promedio de solo 1 celda(s): dato poco confiable')
  })

  it('si la zona no existe, devuelve null', async () => {
    simularApi([])
    const { detalleDeApi } = await cargar()
    expect(await detalleDeApi('99', 'lluvia')).toBeNull()
  })
})

describe('imergDeApi (segunda fuente de lluvia)', () => {
  beforeEach(() => vi.stubEnv('VITE_API_URL', 'http://localhost:3000'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('pide lluvia_imerg y pasa de mm/día a mm/año', async () => {
    const pedidas: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (req: Request) => {
        pedidas.push(new URL(req.url).searchParams.get('variable') ?? '')
        return json(ids.map(zonaConStats))
      }),
    )
    const { imergDeApi } = await cargar()
    const imerg = await imergDeApi()
    expect(pedidas).toEqual(['lluvia_imerg'])
    expect(Object.keys(imerg!)).toHaveLength(25)
    expect(imerg!['21'].slope_per_decade).toBeCloseTo(36.5)
    expect(imerg!['21'].status).toBe('real')
  })

  it('si la API no la tiene (backend viejo) devuelve null y la ficha usa la copia local', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ error: 'variable no existe' }, 400)),
    )
    const { imergDeApi } = await cargar()
    expect(await imergDeApi()).toBeNull()
  })
})
