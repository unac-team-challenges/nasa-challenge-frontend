/** Margen común de los gráficos de la ficha (deja sitio a la unidad del eje arriba a la izquierda). */
export const MARGEN = { top: 18, right: 10, bottom: 0, left: 0 }

const tick = { fill: 'var(--muted)', fontSize: 11 }

/** Eje de años: numérico, de punta a punta, con marcas cada 5 o 10 años. */
export function ejeX(y0: number, y1: number) {
  const paso = y1 - y0 > 30 ? 10 : 5
  const ticks: number[] = []
  for (let y = Math.ceil(y0 / 5) * 5; y <= y1; y += paso) ticks.push(y)
  return {
    type: 'number' as const,
    domain: [y0 - 0.5, y1 + 0.5],
    ticks,
    tick,
    tickLine: false,
    axisLine: { stroke: 'var(--line)' },
    allowDecimals: false,
  }
}

/** Eje de valores, discreto, con la unidad escrita encima. */
export function ejeY(unidad: string) {
  return {
    width: 42,
    tick,
    tickLine: false,
    axisLine: false,
    tickCount: 5,
    label: {
      value: unidad,
      position: 'top' as const,
      offset: 6,
      dx: 12,
      ...tick,
      textAnchor: 'start' as const,
    },
  }
}
