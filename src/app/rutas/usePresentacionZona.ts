import { useEffect, useState } from 'react'

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches
/** Presentación del departamento elegido: entra, se queda y sale (ms, igual que en index.css). */
const PRESENTACION_MS = 1900
/** La información aparece cuando la presentación ya se está yendo. */
export const RETRASO_INFO_S = 1.3

/**
 * Presentación breve del departamento elegido en el mapa; luego aparece su información. Se decide
 * al renderizar (patrón «ajustar estado cuando cambia una prop»), no en un efecto.
 * `intro` es la presentación en curso y `abrirTarde`, que el informe estaba cerrado y se abre
 * cuando ella termina.
 */
export function usePresentacionZona(
  sel: string | null,
  informeMin: boolean,
  zonaDesdeMapa: boolean,
) {
  const [intro, setIntro] = useState<{ id: string; n: number } | null>(null)
  const [abrirTarde, setAbrirTarde] = useState(false)
  const [previa, setPrevia] = useState({ sel, informeMin })
  if (sel !== previa.sel || informeMin !== previa.informeMin) {
    setPrevia({ sel, informeMin })
    if (sel !== previa.sel) {
      const animar = !!sel && zonaDesdeMapa && !reducido()
      setIntro(animar && sel ? { id: sel, n: (intro?.n ?? 0) + 1 } : null)
      // si el informe estaba cerrado, se abre cuando la presentación termina
      setAbrirTarde(animar && previa.informeMin)
    }
  }
  useEffect(() => {
    if (!intro) return
    const fin = setTimeout(() => setIntro(null), PRESENTACION_MS)
    return () => clearTimeout(fin)
  }, [intro])
  return { intro, abrirTarde }
}
