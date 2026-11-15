import type { ReactNode } from 'react'

/** Globo del puntero de los gráficos (colores del tema, no los de Recharts). */
export function Globo({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-m border border-line bg-panel px-2.5 py-1.5 text-xs shadow-sm">
      {children}
    </div>
  )
}
