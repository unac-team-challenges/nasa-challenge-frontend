import { ArrowRight } from 'lucide-react'
import { ninoEn } from '@/data/datos'
import { TEXTOS } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { num } from '@/utils/formato'
import { useDetalle, useVista, useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import {
  anioParaRecordar,
  aniosMalosPorMitad,
  compararMalos,
  cuantoFalto,
  frecuencia,
  respuestaMalos,
  tendenciaSinMasMalos,
} from '@/features/ficha/utils/serie'

/**
 * Agricultor: «¿ahora hay más años de seca?» (o de calor fuerte). Primero la respuesta en una
 * frase, que solo dice «sí» o «no» si la tendencia es un cambio claro: si no, no contradice a la
 * tarjeta de confianza. Luego cada cuánto venían antes y cada cuánto vienen ahora («uno cada 5
 * años»), un año malo que el agricultor recuerde y cada año como una casilla con su número, como
 * un calendario. «Lo de siempre» es un año típico de la primera mitad, sin los años de El Niño.
 */
export function CampoAniosMalos() {
  const idioma = useApp((s) => s.idioma)
  const { variable, sel } = useBusqueda()
  const t = TEXTOS[idioma]
  const { rango } = useVista()
  const zonas = useZonas()
  const { serie: pts } = useDetalle(sel)
  const mitades = pts ? aniosMalosPorMitad(pts, variable, ninoEn(rango)) : null
  // Sin la zona (todavía no llegó o no existe) no hay tendencia con qué responder: no se dibuja,
  // en vez de romper toda la ficha al leer su estado
  const zona = sel ? zonas[sel] : undefined
  if (!mitades || !sel || !zona) return null
  const { antes, ahora } = mitades
  const lluvia = variable === 'lluvia'
  const respuesta = respuestaMalos(compararMalos(antes, ahora), zona, variable)
  const recordar = anioParaRecordar(mitades, variable)
  // Lo malo: el año seco (lluvia), el de verdor flojo (vegetación) o el caluroso (temperatura).
  // Todos salen en el color de «lo malo» de su variable.
  const color = `var(${colorDireccion(variable === 'temperatura' ? 1 : -1, variable)})`
  const tipo = t.malosPunto[variable]

  return (
    <section aria-labelledby="malos-h" className="flex flex-col gap-3.5 bloque-ficha">
      <h3 id="malos-h" className="m-0 text-sm font-semibold">
        {t.malosH[variable]}
      </h3>

      {/* La respuesta, en una frase */}
      <p className="m-0 font-semibold">{t.malosRespuesta[variable][respuesta]}</p>
      {/* Tendencia clara hacia lo malo sin más años malos (Loreto): que no parezca contradicción */}
      {tendenciaSinMasMalos(respuesta, zona, variable) && (
        <p className="m-0">{t.malosAclara[variable]}</p>
      )}

      {/* Cada cuánto venía un año malo antes y cada cuánto viene ahora */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        {[antes, ahora].map((m, i) => (
          <div key={m.desde} className={`flex flex-col gap-1 ${i ? 'col-start-3' : ''}`}>
            <span className="text-xs text-muted">
              {i ? t.malosAhora : t.malosAntes} · {m.desde}–{m.hasta}
            </span>
            {/* En celular a 19 px: a 22 px «Uno cada 2 o 3 años» se partía en 3 líneas */}
            <span className="font-display text-[19px] leading-[1.1] font-[750] tracking-[-0.01em] text-balance min-[420px]:text-[22px]">
              {t.malosFrec(frecuencia(m.malos, m.anios.length))}
            </span>
            <span className="text-xs text-muted tabular-nums">
              {t.malosCuenta(m.malos, m.anios.length)}
            </span>
          </div>
        ))}
        <ArrowRight className="col-start-2 row-start-1 size-5 text-muted" aria-hidden="true" />
      </div>

      {/* Un año malo para ubicarse: el peor de los recientes */}
      {recordar && (
        <p className="m-0">
          {lluvia
            ? t.malosRecuerdaLluvia(recordar.y, cuantoFalto(recordar.a))
            : variable === 'vegetacion'
              ? t.malosRecuerdaVerde(recordar.y)
              : t.malosRecuerdaCalor(recordar.y, `${num(Math.abs(recordar.a), 1, idioma)} °C`)}
        </p>
      )}

      {/* Cada año, una casilla con su número */}
      <div className="flex flex-col gap-2">
        {[antes, ahora].map((m, i) => (
          <div key={m.desde} className="flex flex-col gap-1">
            <span className="text-xs text-muted">{i ? t.malosAhora : t.malosAntes}</span>
            <ol
              className="m-0 grid list-none grid-cols-6 gap-1 p-0 min-[400px]:grid-cols-12"
              aria-label={`${m.desde}–${m.hasta}`}
            >
              {m.anios.map((a) => (
                <li
                  key={a.y}
                  className="flex h-7 items-center justify-center rounded-[4px] border text-[11px] font-semibold tabular-nums"
                  style={
                    a.malo
                      ? { background: color, borderColor: color, color: 'var(--panel)' }
                      : { borderColor: 'var(--line)', color: 'var(--muted)' }
                  }
                >
                  <span aria-hidden="true">{String(a.y).slice(2)}</span>
                  <span className="sr-only">
                    {a.y}
                    {a.malo ? `: ${tipo}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={{ background: color }} />
          {t.malosDef[variable]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] border border-line" />
          {t.malosOtro[variable]}
        </span>
      </div>
      <p className="m-0 text-xs text-muted">
        {t.malosBase(antes.desde, antes.hasta)} {t.malosLeer}
      </p>
    </section>
  )
}
