import type { Zona } from '@/data/datos'
import type { TendenciaImerg } from '@/api/consultas'
import { TEXTOS, type Idioma, type Perfil } from '@/i18n/textos'
import { colorDireccion } from '@/utils/direccion'
import { fmtValor } from '@/utils/formato'

interface Props {
  /** La zona con la lluvia principal (NASA POWER). */
  power: Zona
  /** La misma zona en la segunda fuente (GPM IMERG). */
  imerg: TendenciaImerg
  idioma: Idioma
  perfil: Perfil
}

/**
 * «¿Coinciden dos fuentes de NASA?» (idea del prototipo v4): la lluvia del modelo (POWER, la que
 * muestra el mapa) frente a la de los satélites (IMERG). Si no coinciden, lo dice y explica por qué
 * el mapa usa POWER: en vez de esconder el desacuerdo, se muestra.
 */
export function DosFuentes({ power, imerg, idioma, perfil }: Props) {
  const t = TEXTOS[idioma]
  const fmt = (v: number) => fmtValor(v, 'lluvia', idioma)
  const filas = [
    { clave: 'power', ...t.dosFuente.power, d: power },
    { clave: 'imerg', ...t.dosFuente.imerg, d: imerg },
  ]
  // Las dos barras usan la misma escala, para que se puedan comparar a simple vista
  const max = Math.max(...filas.map((f) => Math.abs(f.d.slope_per_decade)), 1e-9)
  const pocos = power.status === 'pocos_datos' || imerg.status === 'pocos_datos'
  const sube = power.slope_per_decade >= 0
  const coinciden = sube === imerg.slope_per_decade >= 0

  return (
    <section
      aria-labelledby="dos-fuentes-h"
      className="flex flex-col gap-3 rounded-m border border-line p-3.5"
    >
      <h3 id="dos-fuentes-h" className="m-0 text-sm font-semibold">
        {t.dosH}
      </h3>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {filas.map(({ clave, nombre, tipo, d }) => {
          const color =
            d.status === 'pocos_datos' ? '--muted' : colorDireccion(d.slope_per_decade, 'lluvia')
          const ancho = (Math.abs(d.slope_per_decade) / max) * 50
          return (
            <li key={clave} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>
                  <b className="font-semibold">{nombre}</b>{' '}
                  <span className="text-muted">· {tipo}</span>
                </span>
                <b className="whitespace-nowrap tabular-nums" style={{ color: `var(${color})` }}>
                  {d.status === 'pocos_datos' ? '—' : fmt(d.slope_per_decade)}
                </b>
              </div>
              {/* Barra desde el cero (al centro): a la derecha, más lluvia; a la izquierda, menos */}
              <div className="relative h-2 rounded-full bg-line" aria-hidden="true">
                <span className="absolute inset-y-[-3px] left-1/2 w-px bg-muted" />
                {d.status !== 'pocos_datos' && (
                  <span
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      background: `var(${color})`,
                      width: `${ancho}%`,
                      left: d.slope_per_decade >= 0 ? '50%' : `${50 - ancho}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-xs text-muted">
                {t.status[d.status]}
                {perfil === 'estudiante' &&
                  d.status !== 'pocos_datos' &&
                  ` · ${t.range(fmt(d.ci_low), fmt(d.ci_high))}`}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="m-0 text-sm">
        {pocos ? t.dosPocos : coinciden ? t.dosSi(sube) : t.dosNo(sube)}
      </p>
      {!pocos && !coinciden && <p className="m-0 text-xs text-muted">{t.dosPorQue}</p>}
    </section>
  )
}
