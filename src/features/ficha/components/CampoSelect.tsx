import { ChevronDown } from 'lucide-react'

/** Lista desplegable con su etiqueta visible, con el mismo estilo que el selector de departamento. */
export function CampoSelect({
  etiqueta,
  valor,
  opciones,
  onCambio,
}: {
  etiqueta: string
  valor: string | number
  opciones: { valor: string | number; texto: string }[]
  onCambio: (valor: string) => void
}) {
  return (
    <label className="flex min-w-28 flex-col gap-1 text-xs text-muted">
      {etiqueta}
      <span className="relative flex items-center">
        <select
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          className="min-h-10 w-full cursor-pointer appearance-none rounded-s border border-line-2 bg-panel py-0 pr-8 pl-3 text-sm font-medium text-fg hover:border-fg"
        >
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 size-4 text-muted"
          aria-hidden="true"
        />
      </span>
    </label>
  )
}
