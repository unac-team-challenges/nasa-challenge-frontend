import { useState, type ReactNode } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { anomaliasAnio, FUENTE_LOCAL } from '@/data/datos'
import { claveMapa } from '@/utils/direccion'
import { useAnio, useBusqueda, usePeriodo } from '@/lib/busqueda'
import { fmtAnomalia, fmtValor, num } from '@/utils/formato'
import { useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { useCalor } from '@/features/mapa/hooks/useCalor'
import { tieneAnio, type Calor } from '@/features/mapa/utils/calor'
import { COLOR_TENDENCIA, type TendenciaVegetacion } from '@/features/mapa/utils/vegetacion'

/** Degradado con los mismos tokens que pinta el mapa de color de la variable (`calor.paradas`). */
const rampa = (paradas: string[]) =>
  `linear-gradient(to right, ${paradas.map((v) => `var(${v})`).join(', ')})`

/** Una cifra de la leyenda (extremos de la escala, máximo): se distingue del texto que la explica. */
function Cifra({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[4px] bg-panel-2 px-1.5 py-px text-[11px] font-semibold whitespace-nowrap text-fg tabular-nums">
      {children}
    </span>
  )
}

/** Título de cada parte de la leyenda. */
function Titulo({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-fg">
      <span>{children}</span>
      {extra}
    </div>
  )
}

/** Explicaciones: una idea por viñeta, en letra chica y apagada. */
function Notas({ items }: { items: string[] }) {
  return (
    <ul className="m-0 grid list-disc gap-0.5 pl-4 text-[11.5px] leading-snug text-muted marker:text-line">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  )
}

/** Barra de color de la malla con sus dos extremos. */
function Escala({ calor, extremo }: { calor: Calor; extremo: (x: number) => string }) {
  return (
    <>
      <span
        className="block h-2.5 rounded-[3px] border border-line"
        style={{ background: rampa(calor.paradas) }}
        aria-hidden
      />
      <span className="flex justify-between">
        <Cifra>{extremo(calor.min)}</Cifra>
        <Cifra>{extremo(calor.max)}</Cifra>
      </span>
    </>
  )
}

/**
 * Leyenda plegable del mapa. Empieza minimizada (una franja de una línea) y se abre con la flecha.
 * Lo que explica depende de lo que se ve: variable o modo Vegetación, tendencia o año, con o sin
 * mapa de color, el perfil (agricultor o estudiante), el idioma y el tema (colores por token).
 */
export function Leyenda() {
  const { idioma } = useApp()
  const periodo = usePeriodo()
  const { variable, vegetacion, perfil, sel } = useBusqueda()
  const anio = useAnio()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const { rango, fuente } = useVista()
  const [abierta, setAbierta] = useState(false)
  // Al elegir un departamento se minimiza: el informe y la ficha del puntero necesitan el espacio
  const [selPrevia, setSelPrevia] = useState(sel)
  if (sel !== selPrevia) {
    setSelPrevia(sel)
    if (sel) setAbierta(false)
  }
  const calor = useCalor()
  const conCalor = !!calor && tieneAnio(calor, anio)
  const anual = anio != null

  // Con mapa de color, el color es el valor de cada celda y la altura, el cambio: las columnas van
  // neutras para no sugerir otro significado. Sin él, el color dice si sube o baja.
  const sube = conCalor ? 'var(--muted)' : `var(--map-${claveMapa(1, variable)})`
  const baja = conCalor ? 'var(--muted)' : `var(--map-${claveMapa(-1, variable)})`
  const cols =
    perfil === 'estudiante' ? t.legColsEst[anual ? 1 : 0] : anual ? t.legColsT : t.legCols[variable]
  const maxima = anual
    ? anomaliasAnio(variable, periodo, rango).max
    : // 0 si ninguna zona tiene tendencia (todas pocos_datos): sin el 0 saldría −Infinity
      Math.max(
        0,
        ...Object.values(zonas)
          .filter((d) => d.status !== 'pocos_datos')
          .map((d) => Math.abs(d.slope_per_decade)),
      )
  const maxTexto = (anual ? fmtAnomalia : fmtValor)(maxima, variable, idioma).replace('+', '')
  const extremo = (x: number) =>
    calor?.unidad === 'NDVI'
      ? `${num(x, 2, idioma)} NDVI`
      : `${Math.round(x)} ${calor?.unidad ?? ''}`.trim()

  const columna = (x: number, arriba: number, abajo: number, relleno: string) => {
    const w = 38
    const d = 10
    const h = abajo - arriba
    return (
      <g style={{ fill: relleno }}>
        <polygon
          points={`${x},${arriba} ${x + d},${arriba - 6} ${x + w + d},${arriba - 6} ${x + w},${arriba}`}
          fillOpacity={0.75}
        />
        <rect x={x} y={arriba} width={w} height={Math.max(h, 2)} />
        <polygon
          points={`${x + w},${arriba} ${x + w + d},${arriba - 6} ${x + w + d},${abajo - 6} ${x + w},${abajo}`}
          fillOpacity={0.55}
        />
      </g>
    )
  }
  // Rótulo de 2 líneas como mucho (~16 letras cada una): los largos no se pisan con el vecino
  const lineas = (x: string) => {
    if (x.length <= 16) return [x]
    const corte = x.lastIndexOf(' ', 16)
    return corte > 0 ? [x.slice(0, corte), x.slice(corte + 1)] : [x]
  }
  const dosLineas = cols.some(([, b]) => lineas(b).length > 1)
  const rotulo = (cx: number, [a, b]: [string, string]) => (
    <>
      <text
        x={cx}
        y={87}
        textAnchor="middle"
        fontSize={13}
        fontWeight={650}
        style={{ fill: 'var(--fg)' }}
      >
        {a}
      </text>
      <text x={cx} y={101} textAnchor="middle" fontSize={11.5} style={{ fill: 'var(--muted)' }}>
        {lineas(b).map((l, i) => (
          <tspan key={i} x={cx} dy={i ? 13 : 0}>
            {l}
          </tspan>
        ))}
      </text>
    </>
  )
  const muestra = 'h-3 w-4 flex-none rounded-[3px] box-border'
  // «Pleno: cambio real» → la palabra (cómo se ve) y su significado, con distinto peso
  const textura = (muestraEl: ReactNode, texto: string) => {
    const [como, que] = texto.split(': ')
    return (
      <span className="flex items-start gap-1.5 leading-tight">
        {muestraEl}
        <span>
          <span className="font-semibold text-fg">{como}</span>
          <span className="block text-[11px] text-muted">{que}</span>
        </span>
      </span>
    )
  }

  const contenidoVariable = (
    <>
      {/* En celular el título del mapa va en una línea; lo que se pinta se dice aquí */}
      <div className="grid gap-0.5 text-xs min-[901px]:hidden">
        <span className="font-semibold text-fg">{anual ? t.mapSubAnio : t.mapSub}</span>
        <span className="text-muted">{t.timeHelp(rango.year_end - rango.year_start + 1)}</span>
      </div>
      <section className="grid gap-1">
        <Titulo extra={<Cifra>{t.legMax(maxTexto)}</Cifra>}>
          {t.legAltura[perfil][anual ? 1 : 0]}
        </Titulo>
        <svg
          viewBox={`0 0 330 ${dosLineas ? 120 : 107}`}
          className="block h-auto w-full max-w-[220px]"
          role="img"
          aria-label={cols.map((c) => c.join(': ')).join('. ')}
        >
          <line
            x1={4}
            y1={46}
            x2={326}
            y2={46}
            style={{ stroke: 'var(--muted)' }}
            strokeDasharray="4 4"
          />
          {columna(36, 12, 46, sube)}
          {columna(146, 42, 46, 'var(--muted)')}
          {columna(256, 58, 70, baja)}
          {rotulo(60, cols[0])}
          {rotulo(170, cols[1])}
          {rotulo(280, cols[2])}
        </svg>
      </section>
      <section className="grid gap-1">
        <Titulo>{t.legSeguro}</Titulo>
        <div className="grid grid-cols-3 gap-x-2 text-xs">
          {/* En modo año el color es la anomalía: pleno y punteado no aplican */}
          {!anual &&
            textura(
              <span
                className={`${muestra} mt-px`}
                style={{ background: calor && conCalor ? rampa(calor.paradas) : sube }}
              />,
              t.texReal,
            )}
          {!anual &&
            textura(
              <span
                className={`${muestra} mt-px`}
                style={{
                  background:
                    calor && conCalor
                      ? // Mismo punteado que el mapa: puntos al tresbolillo sobre el color lavado
                        `radial-gradient(circle, color-mix(in srgb, var(--panel) 60%, transparent) 1.1px, transparent 1.5px) 0 0 / 5px 5px, radial-gradient(circle, color-mix(in srgb, var(--panel) 60%, transparent) 1.1px, transparent 1.5px) 2.5px 2.5px / 5px 5px, linear-gradient(color-mix(in srgb, var(--panel) 25%, transparent), color-mix(in srgb, var(--panel) 25%, transparent)), ${rampa(calor.paradas)}`
                      : `radial-gradient(circle, ${sube} 1.1px, transparent 1.5px) 0 0 / 5px 5px, radial-gradient(circle, ${sube} 1.1px, transparent 1.5px) 2.5px 2.5px / 5px 5px, color-mix(in srgb, ${sube} 50%, var(--panel))`,
                  border: `1px solid ${conCalor ? 'var(--line)' : sube}`,
                  opacity: 0.85,
                }}
              />,
              t.texCas,
            )}
          {textura(
            <span className={`${muestra} mt-px border-2 border-dashed border-muted`} />,
            t.texFew,
          )}
        </div>
      </section>
      {calor && conCalor && (
        <section className="grid gap-1">
          <Titulo>
            {anual
              ? t.calorAnio(t.calorCosa[variable], anio)
              : t.calorMedia(t.calorCosa[variable], calor.anio0, calor.anio0 + calor.anios - 1)}
          </Titulo>
          <Escala calor={calor} extremo={extremo} />
        </section>
      )}
      <Notas
        items={[
          ...(calor && conCalor ? t.calorNota[variable] : []),
          // La máquina del tiempo usa la copia local
          t.varDef[variable](anual ? FUENTE_LOCAL : fuente),
        ]}
      />
    </>
  )

  // Modo Vegetación: el NDVI de fondo y los colores de los 5 recuadros
  const tendencias: [TendenciaVegetacion, string][] = [
    ['sube', t.vegSube],
    ['baja', t.vegBaja],
    ['igual', t.vegIgual],
  ]
  const contenidoVegetacion = (
    <>
      {calor && (
        <section className="grid gap-1">
          <Titulo>{t.legVegMalla(calor.anio0, calor.anio0 + calor.anios - 1)}</Titulo>
          <Escala calor={calor} extremo={extremo} />
          <Notas items={t.legVegMallaNota} />
        </section>
      )}
      <section className="grid gap-1">
        <Titulo>{t.legCuadros}</Titulo>
        <div className="grid grid-cols-3 gap-x-2 text-xs">
          {tendencias.map(([k, texto]) => (
            <span key={k} className="flex items-center gap-1.5 leading-tight text-fg">
              <span
                className={`${muestra} border border-fg`}
                style={{ background: `var(${COLOR_TENDENCIA[k]})` }}
              />
              {texto}
            </span>
          ))}
        </div>
        <Notas items={[t.legVegNota]} />
      </section>
    </>
  )

  // En celular, abierta es una hoja pegada al borde de abajo del mapa; tocar el mapa la cierra
  const hoja = abierta
    ? 'max-[900px]:inset-x-0 max-[900px]:bottom-0 max-[900px]:z-[5] max-[900px]:w-auto max-[900px]:max-h-[70%] max-[900px]:overflow-y-auto max-[900px]:rounded-b-none max-[900px]:border-x-0 max-[900px]:border-b-0'
    : ''

  return (
    <>
      {abierta && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setAbierta(false)}
          className="absolute inset-0 z-[4] cursor-default border-0 bg-fg/10 min-[901px]:hidden"
        />
      )}
      <div
        data-cubre-mapa
        className={`absolute left-3 z-[3] rounded-m border border-line bg-panel/92 text-[13px] shadow-[0_8px_24px_-16px_var(--shadow)] backdrop-blur-sm min-[901px]:bottom-3.5 ${
          abierta ? 'w-[min(300px,calc(100%-24px))]' : 'w-max'
        } ${anual ? 'bottom-[86px]' : 'bottom-[66px]'} ${hoja}`}
      >
        <details
          className="group"
          open={abierta}
          // Al montar, el navegador avisa con el mismo valor: solo cuenta si cambió
          onToggle={(e) => e.currentTarget.open !== abierta && setAbierta(e.currentTarget.open)}
        >
          <summary className="toque44 flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-m px-3 py-1 text-sm font-semibold hover:bg-line/40 [&::-webkit-details-marker]:hidden">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="flex-none"
            >
              <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 16.6v.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {t.legSum}
            {/* Un solo control: cerrada apunta arriba (se abre hacia arriba), abierta apunta abajo */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="ml-auto flex-none rotate-180 transition-transform group-open:rotate-0 motion-reduce:transition-none"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <div className="grid max-h-[min(52vh,400px)] gap-2.5 overflow-y-auto overscroll-contain px-3 pt-0.5 pb-3 max-[900px]:max-h-none">
            {vegetacion ? contenidoVegetacion : contenidoVariable}
          </div>
        </details>
      </div>
    </>
  )
}
