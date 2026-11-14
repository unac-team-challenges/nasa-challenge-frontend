import { useEffect, useMemo, useRef, useState } from 'react'
import { calcularZonas } from '../data/ejemplo'
import { TEXTOS } from '../i18n/textos'
import { useApp } from '../store'
import { EscenaPeru, hayWebgl } from './escena'

/** Mapa del Perú en 3D. Si no hay WebGL, muestra un aviso (el mapa 2D llega en otro PR). */
export function Mapa3D() {
  const contenedor = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const escena = useRef<EscenaPeru | null>(null)
  const [conWebgl] = useState(hayWebgl)
  const { idioma, variable, tema } = useApp()
  const t = TEXTOS[idioma]
  const zonas = useMemo(() => calcularZonas(variable), [variable])

  // Crear y destruir la escena una sola vez
  useEffect(() => {
    if (!conWebgl || !contenedor.current || !capa.current) return
    const e = new EscenaPeru(
      contenedor.current,
      capa.current,
      TEXTOS[useApp.getState().idioma].ocean,
    )
    escena.current = e
    e.aplicarTema()
    const sistema = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => e.aplicarTema()
    sistema.addEventListener('change', alCambiar)
    return () => {
      sistema.removeEventListener('change', alCambiar)
      e.destruir()
      escena.current = null
    }
  }, [conWebgl])

  useEffect(() => {
    escena.current?.setDatos(zonas, variable, true)
  }, [zonas, variable])

  useEffect(() => {
    escena.current?.aplicarTema()
  }, [tema])

  useEffect(() => {
    escena.current?.setTextoOceano(t.ocean)
  }, [t.ocean])

  if (!conWebgl) {
    return (
      <div className="absolute inset-0 grid place-items-center p-6 text-center text-muted">
        <p className="max-w-80">{t.sinWebgl}</p>
      </div>
    )
  }
  return (
    <div ref={contenedor} className="absolute inset-0" role="img" aria-label={t.mapaAria}>
      <div
        ref={capa}
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        aria-hidden="true"
      />
    </div>
  )
}
