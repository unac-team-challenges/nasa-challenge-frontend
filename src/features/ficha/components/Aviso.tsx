import { TEXTOS, type Idioma } from '@/i18n/textos'

/**
 * Aviso de una zona del Caso 2 o de la selva (`stats.aviso` del backend): por qué leer la cifra con
 * cuidado (Olmos: caja movida y El Niño; La Pampa: el quiebre de 2009). Siempre a la vista, no en un
 * desplegable, para que el número no se lea sin su advertencia.
 */
export function Aviso({ texto, idioma }: { texto: string | null | undefined; idioma: Idioma }) {
  if (!texto) return null
  return (
    <p className="m-0 rounded-m bg-panel-2 p-2.5 text-xs">
      <b className="font-semibold">{TEXTOS[idioma].cuidado}:</b> {texto}
    </p>
  )
}
