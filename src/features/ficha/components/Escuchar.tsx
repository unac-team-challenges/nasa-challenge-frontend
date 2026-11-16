import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { TEXTOS } from '@/i18n/textos'
import { useApp } from '@/stores/app'
import { Button } from '@/components/ui/button'

/**
 * Agricultor: lee la ficha en voz alta con la voz del navegador (Web Speech API), para quien lee
 * con dificultad o está con las manos ocupadas. Lee, en orden, lo marcado con `data-leer` dentro
 * de la ficha (`[data-ficha]`): titulares y frases, no las casillas ni los gráficos.
 * Si el navegador no tiene voz, el botón no aparece. Al desmontarse (otra zona, otra variable u
 * otro idioma: la ficha le cambia la `key`) deja de hablar.
 */
export function Escuchar() {
  const idioma = useApp((s) => s.idioma)
  const t = TEXTOS[idioma]
  const boton = useRef<HTMLButtonElement>(null)
  // La frase que se está leyendo. Guardarla evita que Chrome la recolecte a mitad de lectura (y
  // entonces onend no llega y el botón queda en «Parar»), y deja ignorar los avisos de una frase
  // vieja: cancel() dispara su onerror, que no debe apagar a la nueva
  const actual = useRef<SpeechSynthesisUtterance | null>(null)
  const [hablando, setHablando] = useState(false)
  const voz = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (!voz) return null

  const alternar = () => {
    const habla = window.speechSynthesis
    if (hablando) {
      actual.current = null
      habla.cancel()
      setHablando(false)
      return
    }
    const ficha = boton.current?.closest('[data-ficha]')
    const partes = [...(ficha?.querySelectorAll<HTMLElement>('[data-leer]') ?? [])]
      // innerText respeta los saltos de línea (cada línea, una pausa); jsdom no lo tiene
      .map((e) =>
        (e.innerText ?? e.textContent ?? '')
          .split(/\n+/)
          .map((l) => l.replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .join(', '),
      )
      .filter(Boolean)
      // Una pausa entre partes: punto si la frase no termina ya en signo
      .map((p) => (/[.?!:]$/.test(p) ? p : `${p}.`))
    if (!partes.length) return
    const frase = new SpeechSynthesisUtterance(partes.join(' '))
    frase.lang = idioma === 'es' ? 'es-PE' : 'en-US'
    frase.rate = 0.95
    frase.onend = frase.onerror = () => {
      if (actual.current !== frase) return
      actual.current = null
      setHablando(false)
    }
    actual.current = frase
    habla.cancel()
    habla.speak(frase)
    setHablando(true)
  }

  return (
    <Button
      ref={boton}
      size="sm"
      className="self-start"
      // Sin aria-pressed: el nombre ya dice la acción de cada estado («Parar la lectura…»)
      aria-label={hablando ? t.escucharPararAria : t.escucharAria}
      onClick={alternar}
    >
      {hablando ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
      {hablando ? t.escucharParar : t.escuchar}
    </Button>
  )
}
