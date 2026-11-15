export interface Entrada {
  texto: string
  /** Token de color, p. ej. --up */
  color: string
  forma: 'barra' | 'punto' | 'linea' | 'franja'
}

/** Leyenda de los gráficos de la ficha: la forma de cada marca con su nombre, en una fila. */
export function LeyendaGrafico({ entradas }: { entradas: Entrada[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-3.5 gap-y-1 p-0 text-xs text-muted">
      {entradas.map(({ texto, color, forma }) => (
        <li key={texto} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={
              forma === 'punto'
                ? 'size-2 rounded-full'
                : forma === 'linea'
                  ? 'h-[3px] w-3.5 rounded-full'
                  : forma === 'franja'
                    ? 'h-3 w-2.5 rounded-[2px]'
                    : 'size-2.5 rounded-[2px]'
            }
            style={{ background: `var(${color})`, opacity: forma === 'franja' ? 1 : undefined }}
          />
          {texto}
        </li>
      ))}
    </ul>
  )
}
