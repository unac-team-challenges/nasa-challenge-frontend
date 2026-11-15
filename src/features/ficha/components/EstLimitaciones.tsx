import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'

/** Estudiante: las limitaciones del dato, cortas y listas para la sección de limitaciones. */
export function EstLimitaciones({ anios }: { anios: number }) {
  const t = TEXTOS[useApp((s) => s.idioma)]
  return (
    <section
      aria-labelledby="lim-h"
      className="flex flex-col gap-2 rounded-m border border-line p-3.5"
    >
      <h3 id="lim-h" className="m-0 text-sm font-semibold">
        {t.limH}
      </h3>
      <ul className="m-0 flex flex-col gap-1.5 pl-5 text-sm">
        {t.lim(anios).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </section>
  )
}
