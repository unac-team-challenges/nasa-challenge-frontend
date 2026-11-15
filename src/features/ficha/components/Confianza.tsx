import { CircleCheck, CircleDashed, CircleQuestionMark } from 'lucide-react'
import { NOMBRE, zonasProbadas, type Estado, type Zona } from '@/data/datos'
import { FRASES, TEXTOS, type Perfil } from '@/i18n/textos'
import { useBusqueda } from '@/lib/busqueda'
import { colorDireccion } from '@/utils/direccion'
import { fmtP, fmtValor } from '@/utils/formato'
import { useZonas } from '@/hooks/useZonas'
import { useApp } from '@/stores/app'
import { pocasCeldas } from '@/features/ficha/utils/campo'

const ESTADOS = ['real', 'posible_casualidad', 'pocos_datos'] as const

const ICONO: Record<Estado, typeof CircleCheck> = {
  real: CircleCheck,
  posible_casualidad: CircleQuestionMark,
  pocos_datos: CircleDashed,
}

const INSIGNIA: Record<Estado, string> = {
  real: 'bg-fg text-bg',
  pocos_datos: 'border-[1.5px] border-dashed border-muted text-muted',
  posible_casualidad:
    'border border-fg [background-image:repeating-linear-gradient(135deg,var(--line)_0_3px,transparent_3px_7px)]',
}

/**
 * Qué tan seguro es el cambio (el estado de la zona). Agricultor: un ícono y una frase llana.
 * Estudiante: el semáforo y la prueba (p, q y cuántas zonas se corrigieron).
 */
export function Confianza({ zona: d, perfil }: { zona: Zona; perfil: Perfil }) {
  const idioma = useApp((s) => s.idioma)
  const { variable } = useBusqueda()
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const st = d.status
  const color = st === 'pocos_datos' ? '--muted' : colorDireccion(d.slope_per_decade, variable)
  const borde = { borderLeftColor: `var(${color})` }

  if (perfil === 'agricultor') {
    const Icono = ICONO[st]
    const [titulo, texto] = t.confCampo[st]
    return (
      <div className="flex items-start gap-3 rounded-m border-l-4 bg-panel-2 p-3.5" style={borde}>
        <Icono className="mt-0.5 size-6 flex-none" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{titulo}</span>
          <span>{texto}</span>
        </div>
      </div>
    )
  }

  const P = FRASES[idioma]
  const m = zonasProbadas(zonas)
  const frase =
    st === 'pocos_datos'
      ? pocasCeldas(d)
        ? P.few(NOMBRE[d.id])
        : P.fewAnios(NOMBRE[d.id], d.n_years)
      : st === 'real'
        ? P.estudianteUp(
            fmtP(d.p_value, idioma),
            fmtP(d.q_value, idioma),
            m,
            fmtValor(d.slope_per_decade, variable, idioma),
          )
        : P.estudianteCas(fmtP(d.p_value, idioma), fmtP(d.q_value, idioma), m)

  return (
    <div className="flex flex-col gap-2 rounded-m border-l-4 bg-panel-2 p-3.5" style={borde}>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex gap-[5px]" aria-hidden="true">
          {ESTADOS.map((s) => (
            <i key={s} className={`block size-3 rounded-full ${s === st ? 'bg-fg' : 'bg-line'}`} />
          ))}
        </span>
        <span className={`rounded-full px-2.5 py-[3px] text-sm font-semibold ${INSIGNIA[st]}`}>
          {t.status[st]}
        </span>
      </div>
      <p className="m-0 text-base">{frase}</p>
    </div>
  )
}
