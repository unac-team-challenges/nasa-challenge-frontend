import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { anomaliasAnio, DEPARTAMENTOS, NOMBRE } from '../data/datos'
import { colorAnomalia } from '../lib/color'
import { TEXTOS } from '../i18n/textos'
import { claveMapa } from '../lib/direccion'
import { fmtAnomalia, fmtValor } from '../lib/formato'
import { datosTarjeta } from '../lib/tarjeta'
import { useRango, useZonas } from '../lib/useZonas'
import { useApp } from '../store'

const LON0 = -75.0
const LAT0 = -9.2
const COSLAT = Math.cos((LAT0 * Math.PI) / 180)
const proyectar = ([lon, lat]: number[]): [number, number] => [(lon - LON0) * COSLAT, -(lat - LAT0)]

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
const CAJA = (() => {
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
  return `${x0 - pad} ${y0 - pad - 1.5} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2 + 3}`
})()
const [VX, VY, VW, VH] = CAJA.split(' ').map(Number)

/**
 * Zoom a la zona elegida (en unidades del SVG): la centra y la agranda hasta ~55 % de la vista,
 * entre 1 y 2,6 veces. Sin zona, la vista completa. La transición la hace el CSS.
 */
function zoomA(id: string | null) {
  if (!id) return 'translate(0px, 0px) scale(1)'
  const [x0, y0, x1, y1] = CAJAS[id]
  const k = Math.min(2.6, Math.max(1, 0.55 * Math.min(VW / (x1 - x0), VH / (y1 - y0))))
  const cx = VX + VW / 2 - ((x0 + x1) / 2) * k
  const cy = VY + VH / 2 - ((y0 + y1) / 2) * k
  return `translate(${cx.toFixed(3)}px, ${cy.toFixed(3)}px) scale(${k.toFixed(3)})`
}

interface Props {
  /** En la portada el mapa solo se mira; en el explorador se toca. */
  interactivo?: boolean
}

/**
 * Mapa 2D en SVG: respaldo cuando no hay WebGL y vista alternativa del explorador.
 * Mismo semáforo por forma que el 3D: color pleno, rayado o contorno punteado.
 */
export function Mapa2D({ interactivo = true }: Props) {
  const { idioma, variable, sel, seleccionar, anio, periodo } = useApp()
  useApp((s) => s.tema) // los colores del año se leen del tema
  const rango = useRango()
  const an = anio == null ? null : anomaliasAnio(variable, periodo, rango)
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null)

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

  return (
    <>
      <svg
        viewBox={CAJA}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="group"
        aria-label={t.mapa2dAria}
      >
        <defs>
          {(['up', 'down', 'green'] as const).map((k) => (
            <pattern
              key={k}
              id={`rayado-${k}`}
              width={0.35}
              height={0.35}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width={0.35} height={0.35} style={{ fill: 'var(--panel)' }} />
              <rect width={0.16} height={0.35} style={{ fill: `var(--map-${k})` }} />
            </pattern>
          ))}
        </defs>
        <g
          className="zoom2d"
          style={{ transform: zoomA(interactivo ? sel : null), transformOrigin: '0 0' }}
        >
          {RUTAS.map(({ id, d: ruta }) => {
            const d = zonas[id]
            const clave = claveMapa(d.slope_per_decade, variable)
            let relleno = `var(--map-${clave})`
            let trazo = 'var(--bg)'
            let grosor = 1.2
            let guiones = ''
            const valorAnio = an?.porId[id]?.[anio ?? 0]
            if (an && valorAnio != null) relleno = colorAnomalia(valorAnio, an.max, variable)
            else if (d.status === 'posible_casualidad') relleno = `url(#rayado-${clave})`
            if (d.status === 'pocos_datos') {
              relleno = 'transparent'
              trazo = 'var(--muted)'
              grosor = 1.5
              guiones = '4 3'
            }
            // Bajo el puntero: borde con el color del texto (la elegida mantiene el acento)
            if (tip?.id === id && id !== sel) {
              trazo = 'var(--fg)'
              grosor = 2.5
              guiones = ''
            }
            // En la portada no se marca la zona elegida en el explorador
            if (interactivo && id === sel) {
              trazo = 'var(--accent)'
              grosor = 3
              guiones = ''
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
                }}
                className={
                  interactivo
                    ? `zona2d cursor-pointer outline-none focus-visible:[stroke:var(--accent)] focus-visible:[stroke-width:3] ${tip?.id === id ? 'encima' : ''}`
                    : 'zona2d'
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
                      onPointerMove: (e: PointerEvent) =>
                        setTip({ id, x: e.clientX, y: e.clientY }),
                      onPointerLeave: () => setTip(null),
                    }
                  : {})}
              />
            )
          })}
        </g>
      </svg>
      {/* La misma ficha técnica del 3D (lib/tarjeta.ts), junto al puntero */}
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
    </>
  )
}
