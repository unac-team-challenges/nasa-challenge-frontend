import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { anomaliasAnio, DEPARTAMENTOS, NOMBRE } from '../data/datos'
import { TEXTOS } from '../i18n/textos'
import { colorAnomalia } from '../lib/color'
import { claveMapa } from '../lib/direccion'
import { fmtAnomalia, fmtValor } from '../lib/formato'
import { useRango, useZonas } from '../lib/useZonas'
import { useBusqueda } from '../lib/busqueda'
import { useApp } from '../store'
import { CAJA_SUELO, pintarSuelo2D } from './suelo2d'

const LON0 = -75.0
const LAT0 = -9.2
const COSLAT = Math.cos((LAT0 * Math.PI) / 180)
const proyectar = ([lon, lat]: number[]): [number, number] => [(lon - LON0) * COSLAT, -(lat - LAT0)]

/** Zonas con etiqueta fija, las mismas que en el 3D. */
const CLAVE = ['24', '20', '15', '21', '16', '08']
/** Tumbes queda pegado a Piura: su etiqueta se corre hacia el mar (en px). */
const CORRE: Record<string, [number, number]> = { '24': [-34, -10], '20': [-6, 4] }

/** Nombres de países vecinos y del océano (texto tenue, como en el 3D). */
const PAISES = [
  { es: 'Ecuador', en: 'Ecuador', lon: -78.6, lat: -1.4 },
  { es: 'Colombia', en: 'Colombia', lon: -73.6, lat: 2.2 },
  { es: 'Brasil', en: 'Brazil', lon: -66.5, lat: -7.5 },
  { es: 'Bolivia', en: 'Bolivia', lon: -65.6, lat: -16.2 },
  { es: 'Chile', en: 'Chile', lon: -69.3, lat: -19.9 },
]
const OCEANO = { lon: -82.4, lat: -8.4 } // al norte, para no quedar bajo la leyenda

// Las formas no cambian: se calculan una sola vez al cargar el módulo
const RUTAS = DEPARTAMENTOS.map((z) => ({
  id: z.id,
  d: z.polys
    .map((poly) =>
      poly
        .map(
          (ring) =>
            ring
              .map((p, i) => {
                const [x, y] = proyectar(p)
                return (i ? 'L' : 'M') + x.toFixed(3) + ' ' + y.toFixed(3)
              })
              .join('') + 'Z',
        )
        .join(''),
    )
    .join(''),
}))

/** Centro de cada departamento (centroide de su anillo más grande), para las etiquetas. */
const CENTRO: Record<string, [number, number]> = Object.fromEntries(
  DEPARTAMENTOS.map((z) => {
    let mejor: [number, number] = [0, 0]
    let mayor = 0
    for (const poly of z.polys) {
      const r = poly[0].map(proyectar)
      let a = 0
      let cx = 0
      let cy = 0
      for (let i = 0; i < r.length; i++) {
        const [x0, y0] = r[i]
        const [x1, y1] = r[(i + 1) % r.length]
        const f = x0 * y1 - x1 * y0
        a += f
        cx += (x0 + x1) * f
        cy += (y0 + y1) * f
      }
      if (Math.abs(a) > mayor) {
        mayor = Math.abs(a)
        mejor = [cx / (3 * a), cy / (3 * a)]
      }
    }
    return [z.id, mejor]
  }),
)

const VB = (() => {
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (const z of DEPARTAMENTOS)
    for (const poly of z.polys)
      for (const p of poly[0]) {
        const [x, y] = proyectar(p)
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
  const pad = 0.6
  return { x: x0 - pad, y: y0 - pad - 1.5, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 + 3 }
})()

/** Dónde va la imagen del suelo, en las mismas coordenadas que los departamentos. */
const SUELO = (() => {
  const [x, y] = proyectar([CAJA_SUELO.lon0, CAJA_SUELO.lat1])
  const [x1, y1] = proyectar([CAJA_SUELO.lon1, CAJA_SUELO.lat0])
  return { x, y, w: x1 - x, h: y1 - y }
})()

/** Meridianos y paralelos cada 5° (retícula tenue, como en un atlas). */
const RETICULA = {
  lon: [-85, -80, -75, -70, -65],
  lat: [5, 0, -5, -10, -15, -20],
}

/** Silueta del Perú en el lienzo del suelo, para la sombra suave. */
function siluetaPeru(
  ctx: CanvasRenderingContext2D,
  aPx: (lon: number, lat: number) => [number, number],
) {
  for (const z of DEPARTAMENTOS)
    for (const poly of z.polys)
      for (const ring of poly)
        ring.forEach(([lon, lat], i) => {
          const [x, y] = aPx(lon, lat)
          if (i) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        })
}

interface Props {
  /** En la portada el mapa solo se mira; en el explorador se toca. */
  interactivo?: boolean
}

/**
 * Mapa 2D en SVG: respaldo cuando no hay WebGL y vista alternativa del explorador.
 * Mismo suelo real que el 3D (mar, relieve, ríos y fronteras) y el mismo semáforo por forma:
 * color pleno, rayado o contorno punteado.
 */
export function Mapa2D({ interactivo = true }: Props) {
  const { idioma, periodo } = useApp()
  const { variable, sel, seleccionar, anio } = useBusqueda()
  const tema = useApp((s) => s.tema) // el suelo y los colores del año se leen del tema
  const rango = useRango()
  const an = anio == null ? null : anomaliasAnio(variable, periodo, rango)
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null)
  const [encima, setEncima] = useState<string | null>(null)
  const [conSuelo, setConSuelo] = useState(false)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const caja = useRef<HTMLDivElement>(null)
  const [tam, setTam] = useState({ w: 0, h: 0 })

  // El suelo se pinta una vez por tema (también si cambia el tema del sistema)
  const [esquema, setEsquema] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const cambio = () => setEsquema(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])
  useEffect(() => {
    if (!lienzo.current) return
    pintarSuelo2D(lienzo.current, siluetaPeru)
      .then(() => setConSuelo(true))
      .catch(() => {}) // sin suelo, el mapa sigue funcionando sobre el fondo liso
  }, [tema, esquema])

  // Tamaño del mapa, para ubicar las etiquetas (HTML, nítidas a cualquier tamaño)
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setTam({ w: e.contentRect.width, h: e.contentRect.height }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const s = Math.min(tam.w / VB.w, tam.h / VB.h) || 0
  const oX = (tam.w - VB.w * s) / 2
  const oY = (tam.h - VB.h * s) / 2
  const aPantalla = ([x, y]: [number, number]) => [oX + (x - VB.x) * s, oY + (y - VB.y) * s]
  const celular = tam.w > 0 && tam.w < 600

  const valor = (id: string) => {
    const d = zonas[id]
    const valorAnio = an?.porId[id]?.[anio ?? 0]
    if (d.status === 'pocos_datos') return '—'
    if (anio != null && valorAnio != null) return fmtAnomalia(valorAnio, variable, idioma)
    return fmtValor(d.slope_per_decade, variable, idioma)
  }

  const etiqueta = (id: string) => {
    const d = zonas[id]
    const valorAnio = an?.porId[id]?.[anio ?? 0]
    if (d.status !== 'pocos_datos' && anio != null && valorAnio != null)
      return t.tipTime(NOMBRE[id], fmtAnomalia(valorAnio, variable, idioma), anio)
    return d.status === 'pocos_datos'
      ? `${NOMBRE[id]}, ${t.status.pocos_datos}`
      : t.tipVal(
          NOMBRE[id],
          fmtValor(d.slope_per_decade, variable, idioma),
          t.perDecade,
          t.status[d.status],
        )
  }

  // La zona elegida y la que está bajo el puntero se dibujan al final, para que su borde no quede tapado
  const marcada = interactivo ? sel : null
  const peso = (id: string) => Number(id === marcada) * 2 + Number(id === encima)
  const orden = [...RUTAS].sort((a, b) => peso(a.id) - peso(b.id))
  const conEtiqueta = [...CLAVE]
  if (marcada && !CLAVE.includes(marcada)) conEtiqueta.push(marcada)

  return (
    <div ref={caja} className="absolute inset-0 overflow-hidden">
      {/* Suelo real: mar con profundidad y espuma, relieve, ríos, fronteras y sombra del Perú */}
      <canvas
        ref={lienzo}
        data-suelo2d
        aria-hidden
        className="absolute transition-opacity duration-300"
        style={{
          left: oX + (SUELO.x - VB.x) * s,
          top: oY + (SUELO.y - VB.y) * s,
          width: SUELO.w * s,
          height: SUELO.h * s,
          opacity: conSuelo && tam.w > 0 ? 1 : 0,
        }}
      />
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
        role="group"
        aria-label={t.mapa2dAria}
      >
        <defs>
          {(['up', 'down', 'green'] as const).map((k) => (
            <pattern
              key={k}
              id={`rayado-${k}`}
              width={0.24}
              height={0.24}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width={0.24} height={0.24} style={{ fill: 'var(--panel)' }} />
              <rect width={0.12} height={0.24} style={{ fill: `var(--map-${k})` }} />
            </pattern>
          ))}
        </defs>

        {/* Retícula cada 5° */}
        <g aria-hidden style={{ stroke: 'var(--fg)', opacity: 0.09 }}>
          {RETICULA.lon.map((lon) => {
            const [x] = proyectar([lon, 0])
            return (
              <line
                key={lon}
                x1={x}
                x2={x}
                y1={SUELO.y}
                y2={SUELO.y + SUELO.h}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="2 4"
              />
            )
          })}
          {RETICULA.lat.map((lat) => {
            const [, y] = proyectar([0, lat])
            return (
              <line
                key={lat}
                x1={SUELO.x}
                x2={SUELO.x + SUELO.w}
                y1={y}
                y2={y}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="2 4"
              />
            )
          })}
        </g>

        {/* Frontera del Perú: un trazo grueso debajo; los rellenos tapan su mitad interior */}
        <g aria-hidden style={{ fill: 'none', stroke: 'var(--fg)', opacity: 0.55 }}>
          {RUTAS.map(({ id, d }) => (
            <path key={id} d={d} vectorEffect="non-scaling-stroke" strokeWidth={3} />
          ))}
        </g>

        {orden.map(({ id, d: ruta }) => {
          const d = zonas[id]
          const clave = claveMapa(d.slope_per_decade, variable)
          let relleno = `var(--map-${clave})`
          let trazo = 'var(--bg)'
          let grosor = 0.9
          let guiones = ''
          let opacidadTrazo = 0.7
          const valorAnio = an?.porId[id]?.[anio ?? 0]
          if (an && valorAnio != null) relleno = colorAnomalia(valorAnio, an.max, variable)
          else if (d.status === 'posible_casualidad') relleno = `url(#rayado-${clave})`
          if (d.status === 'pocos_datos') {
            relleno = 'color-mix(in srgb, var(--panel) 55%, transparent)'
            trazo = 'var(--muted)'
            grosor = 1.5
            guiones = '4 3'
            opacidadTrazo = 1
          }
          if (interactivo && id === encima && id !== marcada) {
            trazo = 'var(--fg)'
            grosor = 2
            guiones = ''
            opacidadTrazo = 0.9
          }
          // En la portada no se marca la zona elegida en el explorador
          if (id === marcada) {
            trazo = 'var(--accent)'
            grosor = 3
            guiones = ''
            opacidadTrazo = 1
          }
          return (
            <path
              key={id}
              d={ruta}
              fillRule="evenodd"
              vectorEffect="non-scaling-stroke"
              style={{
                fill: relleno,
                stroke: trazo,
                strokeWidth: grosor,
                strokeDasharray: guiones,
                strokeOpacity: opacidadTrazo,
                strokeLinejoin: 'round',
              }}
              className={
                interactivo
                  ? 'cursor-pointer outline-none focus-visible:[stroke:var(--accent)] focus-visible:[stroke-width:3]'
                  : undefined
              }
              {...(interactivo
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': etiqueta(id),
                    'aria-pressed': id === sel,
                    onClick: () => seleccionar(id),
                    onKeyDown: (e: KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        seleccionar(id)
                      }
                    },
                    onPointerEnter: () => setEncima(id),
                    onPointerMove: (e: PointerEvent) => setTip({ id, x: e.clientX, y: e.clientY }),
                    onPointerLeave: () => {
                      setTip(null)
                      setEncima((x) => (x === id ? null : x))
                    },
                  }
                : {})}
            />
          )
        })}
      </svg>

      {/* Etiquetas: mismo estilo que las del 3D */}
      {tam.w > 0 && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {!celular &&
            PAISES.map((p) => {
              const [x, y] = aPantalla(proyectar([p.lon, p.lat]))
              return (
                <span
                  key={p.es}
                  className="lbl3d country"
                  style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
                >
                  {p[idioma]}
                </span>
              )
            })}
          {(() => {
            const [x, y] = aPantalla(proyectar([OCEANO.lon, OCEANO.lat]))
            // En mapas angostos (portada, celular) no queda mar a la vista: mejor no mostrarlo cortado
            if (x < 70) return null
            return (
              <span
                className="lbl3d ocean"
                style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
              >
                {t.ocean}
              </span>
            )
          })()}
          {interactivo &&
            conEtiqueta
              // En celular solo la zona elegida, para no tapar el mapa
              .filter((id) => !celular || id === marcada)
              .map((id) => {
                const [x, y] = aPantalla(CENTRO[id])
                const [dx, dy] = CORRE[id] ?? [0, 0]
                return (
                  <span
                    key={id}
                    className={'lbl3d' + (id === marcada ? ' sel' : '')}
                    style={{
                      transform: `translate(${x + dx}px, ${y + dy}px) translate(-50%, -50%)`,
                    }}
                  >
                    {NOMBRE[id]}
                    <small>{valor(id)}</small>
                  </span>
                )
              })}
        </div>
      )}

      {tip && (
        <div
          className="pointer-events-none fixed z-[4] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-s bg-fg px-2.5 py-1.5 text-[13px] whitespace-nowrap text-bg shadow-[0_4px_14px_var(--shadow)]"
          style={{ left: tip.x, top: tip.y }}
        >
          {etiqueta(tip.id)}
        </div>
      )}
    </div>
  )
}
