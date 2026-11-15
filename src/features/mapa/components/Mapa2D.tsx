import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { anomaliasAnio, DEPARTAMENTOS, NOMBRE } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { colorAnomalia } from '@/utils/color'
import { claveMapa } from '@/utils/direccion'
import { fmtAnomalia, fmtValor } from '@/utils/formato'
import { datosTarjeta } from '@/features/mapa/utils/tarjeta'
import { useRango, useZonas } from '@/hooks/useZonas'
import { useAnio, useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/stores/app'
import { CAJA_SUELO, pintarSuelo2D } from '@/features/mapa/utils/suelo2d'
import { dibujarCalor, tieneAnio } from '@/features/mapa/utils/calor'
import { useCalor } from '@/features/mapa/hooks/useCalor'

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
/** Caja (x0, y0, x1, y1) de cada departamento: para el zoom suave al elegirlo. */
const CAJAS: Record<string, number[]> = Object.fromEntries(
  DEPARTAMENTOS.map((z) => {
    const c = [Infinity, Infinity, -Infinity, -Infinity]
    for (const poly of z.polys)
      for (const p of poly[0]) {
        const [x, y] = proyectar(p)
        c[0] = Math.min(c[0], x)
        c[1] = Math.min(c[1], y)
        c[2] = Math.max(c[2], x)
        c[3] = Math.max(c[3], y)
      }
    return [z.id, c]
  }),
)

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
const { x: VX, y: VY, w: VW, h: VH } = VB

/**
 * Zoom a la zona elegida: la centra y la agranda hasta ~55 % de la vista, entre 1 y 2,6 veces.
 * Sin zona, la vista completa. Devuelve k y el desplazamiento en px de pantalla; el suelo y el SVG
 * lo aplican con CSS (se deslizan) y las etiquetas lo usan para moverse con ellos.
 */
function zoomA(id: string | null, oX: number, oY: number, s: number) {
  if (!id) return { k: 1, tx: 0, ty: 0 }
  const [x0, y0, x1, y1] = CAJAS[id]
  const k = Math.min(2.6, Math.max(1, 0.55 * Math.min(VW / (x1 - x0), VH / (y1 - y0))))
  // en unidades del SVG: el centro de la zona va al centro de la vista
  const cx = VX + VW / 2 - ((x0 + x1) / 2) * k
  const cy = VY + VH / 2 - ((y0 + y1) / 2) * k
  return { k, tx: oX * (1 - k) + (cx - VX + k * VX) * s, ty: oY * (1 - k) + (cy - VY + k * VY) * s }
}

/** Zoom máximo con los dedos (veces el tamaño inicial) y desplazamiento mínimo para que un toque cuente como arrastre (px). */
const K_MAX = 6
const UMBRAL_ARRASTRE = 8

interface Vista {
  k: number
  tx: number
  ty: number
}

/** Mantiene el mapa cubriendo la caja: ni se pasa del zoom máximo ni deja huecos en los bordes. */
function limitar(v: Vista, w: number, h: number): Vista {
  const k = Math.min(K_MAX, Math.max(1, v.k))
  return {
    k,
    tx: Math.min(0, Math.max(w * (1 - k), v.tx)),
    ty: Math.min(0, Math.max(h * (1 - k), v.ty)),
  }
}

/** Lado mínimo de un objetivo táctil (px): por debajo, la zona recibe un borde invisible que se toca. */
const TOQUE_MIN = 44
/** Cuánto puede crecer ese borde (px de trazo): Callao es de ~11 km y a veces mide 3 px. */
const TOQUE_MAX = 40

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
  const { variable, sel, seleccionar } = useBusqueda()
  const anio = useAnio()
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
  const calor = useCalor()
  // Zoom y desplazamiento hechos con los dedos; null = sigue el zoom automático a la zona elegida
  const [manual, setManual] = useState<Vista | null>(null)
  const [gestando, setGestando] = useState(false)
  const dedos = useRef(new Map<number, { x: number; y: number }>())
  const inicio = useRef<{ v: Vista; mx: number; my: number; d: number } | null>(null)
  const arrastrado = useRef(false)
  const reinicio2d = useApp((x) => x.reinicio2d)

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
  // Mapa de calor (temperatura): la malla como imagen de 1 px por celda; el navegador la suaviza
  const conCalor = !!calor && tieneAnio(calor, anio)
  const urlCalor = useMemo(() => {
    if (!calor || !conCalor) return null
    const cv = document.createElement('canvas')
    dibujarCalor(cv, calor, anio ?? null)
    return cv.toDataURL()
    // tema y esquema: los colores se leen del tema
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calor, conCalor, anio, tema, esquema])

  const s = Math.min(tam.w / VB.w, tam.h / VB.h) || 0
  const oX = (tam.w - VB.w * s) / 2
  const oY = (tam.h - VB.h * s) / 2
  // Una zona que no existe (p. ej. /zona/99) no se marca ni se acerca
  const marcada = interactivo && sel && sel in CAJAS ? sel : null
  // Elegir otra zona o pedir la vista inicial deshace el zoom manual (patrón «ajustar estado al renderizar»)
  const [previa, setPrevia] = useState({ marcada, reinicio2d })
  if (previa.marcada !== marcada || previa.reinicio2d !== reinicio2d) {
    setPrevia({ marcada, reinicio2d })
    setManual(null)
  }
  const zm = manual ?? zoomA(marcada, oX, oY, s)
  // Posición en pantalla ya con el zoom: las etiquetas se mueven con el mapa sin agrandarse
  const aPantalla = ([x, y]: [number, number]) => [
    zm.k * (oX + (x - VB.x) * s) + zm.tx,
    zm.k * (oY + (y - VB.y) * s) + zm.ty,
  ]
  const celular = tam.w > 0 && tam.w < 600
  // Zonas demasiado pequeñas para el dedo (Callao, Tumbes…): su área de toque crece con un borde invisible
  const aToque =
    celular && interactivo
      ? RUTAS.map(({ id, d }) => {
          const [x0, y0, x1, y1] = CAJAS[id]
          const lado = Math.min((x1 - x0) * s * zm.k, (y1 - y0) * s * zm.k)
          return { id, d, trazo: Math.min(TOQUE_MAX, Math.round(TOQUE_MIN - lado)) }
        }).filter((z) => z.trazo > 0)
      : []

  // Gestos táctiles: un dedo arrastra, dos dedos pellizcan. El centro de los dedos es el ancla:
  // el punto del mapa que estaba bajo ellos sigue bajo ellos. Con ratón no cambia nada.
  const anclar = () => {
    const ps = [...dedos.current.values()]
    if (!ps.length) return (inicio.current = null)
    const mx = ps.reduce((a, p) => a + p.x, 0) / ps.length
    const my = ps.reduce((a, p) => a + p.y, 0) / ps.length
    const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0
    inicio.current = { v: manual ?? zm, mx, my, d }
  }
  const aCaja = (e: PointerEvent) => {
    const r = caja.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const terminarDedo = (e: PointerEvent) => {
    if (!dedos.current.delete(e.pointerId)) return
    anclar()
    if (!dedos.current.size && gestando) setGestando(false)
  }
  const gestos = interactivo
    ? {
        onPointerDown: (e: PointerEvent) => {
          if (e.pointerType !== 'touch') return
          if (!dedos.current.size) arrastrado.current = false
          dedos.current.set(e.pointerId, aCaja(e))
          if (dedos.current.size > 1) arrastrado.current = true
          anclar()
        },
        onPointerMove: (e: PointerEvent) => {
          if (!dedos.current.has(e.pointerId) || !inicio.current) return
          dedos.current.set(e.pointerId, aCaja(e))
          const ps = [...dedos.current.values()]
          const mx = ps.reduce((a, p) => a + p.x, 0) / ps.length
          const my = ps.reduce((a, p) => a + p.y, 0) / ps.length
          const i = inicio.current
          if (!arrastrado.current && Math.hypot(mx - i.mx, my - i.my) < UMBRAL_ARRASTRE) return
          arrastrado.current = true
          setGestando(true)
          const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0
          const k = i.d && d ? i.v.k * (d / i.d) : i.v.k
          const kk = Math.min(K_MAX, Math.max(1, k))
          // el punto del mapa que estaba bajo el ancla sigue bajo el ancla
          setManual(
            limitar(
              {
                k: kk,
                tx: mx - (kk * (i.mx - i.v.tx)) / i.v.k,
                ty: my - (kk * (i.my - i.v.ty)) / i.v.k,
              },
              tam.w,
              tam.h,
            ),
          )
        },
        // Solo los dedos del gesto hacen algo aquí: un toque suelto o el ratón no cambian ningún
        // estado, así un render no reordena la zona entre «pointerdown» y el «click».
        onPointerUp: (e: PointerEvent) => terminarDedo(e),
        onPointerCancel: (e: PointerEvent) => terminarDedo(e),
        // Si el dedo arrastró, el toque que sigue no elige zona
        onClickCapture: (e: MouseEvent) => {
          if (!arrastrado.current) return
          e.stopPropagation()
          e.preventDefault()
          arrastrado.current = false
        },
      }
    : {}

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
  const peso = (id: string) => Number(id === marcada) * 2 + Number(id === encima)
  const orden = [...RUTAS].sort((a, b) => peso(a.id) - peso(b.id))
  const conEtiqueta = [...CLAVE]
  if (marcada && !CLAVE.includes(marcada)) conEtiqueta.push(marcada)

  return (
    <div
      ref={caja}
      className="absolute inset-0 overflow-hidden"
      // touch-action: none solo dentro del mapa interactivo: los gestos son del mapa, no de la página
      style={interactivo ? { touchAction: 'none' } : undefined}
      {...gestos}
    >
      {/* Suelo real: mar con profundidad y espuma, relieve, ríos, fronteras y sombra del Perú */}
      <div
        className={`zoom2d absolute inset-0 ${gestando ? 'gestando' : ''}`}
        style={{
          transform: `translate(${zm.tx}px, ${zm.ty}px) scale(${zm.k})`,
          transformOrigin: '0 0',
        }}
      >
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
            {/* Sobre el calor: rayas del fondo, translúcidas, para «posible casualidad» */}
            <pattern
              id="rayado-calor"
              width={0.24}
              height={0.24}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect
                width={0.12}
                height={0.24}
                style={{ fill: 'var(--panel)', fillOpacity: 0.45 }}
              />
            </pattern>
            <clipPath id="silueta-peru">
              {RUTAS.map(({ id, d }) => (
                <path key={id} d={d} clipRule="evenodd" />
              ))}
            </clipPath>
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

          {calor && urlCalor && (
            <image
              href={urlCalor}
              x={(calor.lonMin - LON0) * COSLAT}
              y={-(calor.latMin + calor.spanLat - LAT0)}
              width={calor.spanLon * COSLAT}
              height={calor.spanLat}
              preserveAspectRatio="none"
              clipPath="url(#silueta-peru)"
              aria-hidden
            />
          )}

          {orden.map(({ id, d: ruta }) => {
            const d = zonas[id]
            const clave = claveMapa(d.slope_per_decade, variable)
            let relleno = `var(--map-${clave})`
            let trazo = 'var(--bg)'
            let grosor = 0.9
            let guiones = ''
            let opacidadTrazo = 0.7
            const valorAnio = an?.porId[id]?.[anio ?? 0]
            if (urlCalor)
              relleno = d.status === 'posible_casualidad' ? 'url(#rayado-calor)' : 'transparent'
            else if (an && valorAnio != null) relleno = colorAnomalia(valorAnio, an.max, variable)
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
                    ? `zona2d cursor-pointer outline-none focus-visible:[stroke:var(--accent)] focus-visible:[stroke-width:3] ${id === encima ? 'encima' : ''}`
                    : 'zona2d'
                }
                {...(interactivo
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      'aria-label': etiqueta(id),
                      'aria-pressed': id === sel,
                      onClick: () => seleccionar(id, true),
                      onKeyDown: (e: KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          seleccionar(id, true)
                        }
                      },
                      // Con el dedo no hay «pasar por encima»: la ficha flotante tapaba el mapa y
                      // desaparecía al soltar. El resumen sale en el informe, que se abre al tocar.
                      onPointerEnter: (e: PointerEvent) =>
                        e.pointerType !== 'touch' && setEncima(id),
                      onPointerMove: (e: PointerEvent) =>
                        e.pointerType !== 'touch' && setTip({ id, x: e.clientX, y: e.clientY }),
                      onPointerLeave: () => {
                        setTip(null)
                        setEncima((x) => (x === id ? null : x))
                      },
                    }
                  : {})}
              />
            )
          })}

          {/* Borde invisible de las zonas pequeñas: más área para el dedo. El teclado usa el trazo de arriba. */}
          {aToque.map(({ id, d: ruta, trazo }) => (
            <path
              key={id}
              d={ruta}
              aria-hidden
              data-toque={id}
              vectorEffect="non-scaling-stroke"
              style={{
                fill: 'none',
                stroke: 'transparent',
                strokeWidth: trazo,
                strokeLinejoin: 'round',
                pointerEvents: 'stroke',
              }}
              onClick={() => seleccionar(id, true)}
            />
          ))}
        </svg>
      </div>

      {/* Etiquetas: mismo estilo que las del 3D */}
      {tam.w > 0 && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {!celular &&
            PAISES.map((p) => {
              const [x, y] = aPantalla(proyectar([p.lon, p.lat]))
              return (
                <span
                  key={p.es}
                  className="lbl3d lbl2d country"
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
                className="lbl3d lbl2d ocean"
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
                    className={
                      'lbl3d lbl2d' + (id === marcada ? ' sel' : '') + (gestando ? ' gestando' : '')
                    }
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

      {/* La misma ficha técnica del 3D (features/mapa/utils/tarjeta.ts), junto al puntero */}
      {tip &&
        (() => {
          const c = datosTarjeta(zonas[tip.id], variable, idioma, an?.porId[tip.id]?.[anio ?? 0])
          return (
            <div
              className="ficha3d on"
              data-estado={c.datos.estado}
              data-clave={c.datos.clave}
              style={{
                position: 'fixed',
                zIndex: 4,
                transform: `translate(${tip.x}px, ${tip.y}px) translate(-50%, calc(-100% - 16px))`,
              }}
            >
              <div className="ficha3d-caja entrada">
                <div className="ficha3d-nombre">{c.nombre}</div>
                <div className="ficha3d-valor">
                  <strong>{c.valor}</strong>
                  <small>{c.unidad}</small>
                </div>
                <div className="ficha3d-estado">{c.estado}</div>
                {c.ic && (
                  <div className="ficha3d-ic">
                    <span
                      className="ficha3d-rango"
                      style={{ left: c.ic.left, width: c.ic.width }}
                    />
                    <span className="ficha3d-punto" style={{ left: c.ic.punto }} />
                  </div>
                )}
                <div className="ficha3d-meta">{c.meta}</div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
