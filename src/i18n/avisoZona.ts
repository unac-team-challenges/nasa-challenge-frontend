/**
 * Avisos propios de una zona que el backend manda en español (`stats.aviso`) y que la ficha en inglés
 * traduce. Los números del texto salen de la serie, así que se leen del texto y no se escriben aquí.
 * Si el backend cambia la redacción y ya no coincide, devuelve '' y la ficha muestra el español.
 */
const dec = (n: string) => n.replace(',', '.')

// Ucayali, temperatura (backend: `aviso_ucayali` en pipeline/tendencias.py)
const UCAYALI =
  /La subida depende del final de la serie: (\d{4}) y (\d{4}) salieron mucho más calientes \((\d+,\d) y (\d+,\d) °C, frente a (\d+,\d)–(\d+,\d) °C en los años anteriores\)\. Sin esos dos años la subida baja de (\d+,\d+) a (\d+,\d+) °C por década\./

export function avisoZonaEn(motivo: string): string {
  const m = UCAYALI.exec(motivo)
  if (!m) return ''
  const [, a, b, va, vb, lo, hi, antes, despues] = m.map(dec)
  return (
    `The rise depends on the end of the series: ${a} and ${b} were much hotter (${va} and ${vb} °C, versus ${lo}–${hi} °C in the earlier years). ` +
    `Without those two years the rise drops from ${antes} to ${despues} °C per decade. ` +
    'These data cannot separate real warming, extreme heat in those years and a change in the reanalysis.'
  )
}
