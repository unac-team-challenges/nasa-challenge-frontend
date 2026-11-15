import { useEffect, useRef, type RefObject } from 'react'
import { TEXTOS } from '@/i18n/textos'
import { useRango, useZonas } from '@/lib/useZonas'
import { anomaliasAnio } from '@/data/datos'
import { useBusqueda } from '@/lib/busqueda'
import { useApp } from '@/store'
import { EscenaPeru, type ModoMapa } from '@/mapa/escena'
import { Mapa2D } from '@/mapa/Mapa2D'

interface Props {
  modo: ModoMapa
  /** Para que los botones del explorador puedan girar o recentrar el mapa. */
  controlRef?: RefObject<EscenaPeru | null>
  /** Avisa cuando el giro automático se activa o se pausa. */
  alGirar?: (girando: boolean) => void
}

/** Mapa del Perú en 3D. Si no hay WebGL, muestra el mapa 2D con los mismos datos. */
export function Mapa3D({ modo, controlRef, alGirar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const escena = useRef<EscenaPeru | null>(null)
  const { idioma, tema, conWebgl, periodo } = useApp()
  const busqueda = useBusqueda()
  const { variable, sel, anio } = busqueda
  // La escena se crea una sola vez: ve la URL y las funciones más recientes por esta referencia
  const busquedaRef = useRef(busqueda)
  useEffect(() => {
    busquedaRef.current = busqueda
  })
  const t = TEXTOS[idioma]
  const zonas = useZonas()
  const rango = useRango()
  const alGirarRef = useRef(alGirar)
  useEffect(() => {
    alGirarRef.current = alGirar
  })

  // Crear y destruir la escena cuando cambia el modo
  useEffect(() => {
    if (!conWebgl || !contenedor.current || !capa.current) return
    const e = new EscenaPeru(contenedor.current, capa.current, {
      oceano: TEXTOS[useApp.getState().idioma].ocean,
      modo,
      alElegir: (id) => busquedaRef.current.seleccionar(id),
      alGirar: (g) => alGirarRef.current?.(g),
    })
    escena.current = e
    if (controlRef) controlRef.current = e
    e.aplicarTema()
    e.setIdioma(useApp.getState().idioma)
    const { variable: v, sel: s } = busquedaRef.current
    e.setDatos(zonas, v, true)
    if (modo === 'explorar' && s) e.seleccionar(s, true)
    alGirarRef.current?.(modo === 'inicio' || !s)
    const sistema = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => e.aplicarTema()
    sistema.addEventListener('change', alCambiar)
    return () => {
      sistema.removeEventListener('change', alCambiar)
      e.destruir()
      escena.current = null
      if (controlRef) controlRef.current = null
    }
    // zonas y controlRef se leen solo al crear; los cambios llegan por los efectos de abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conWebgl, modo])

  useEffect(() => {
    escena.current?.setDatos(zonas, variable)
  }, [zonas, variable])

  useEffect(() => {
    if (modo === 'explorar') escena.current?.seleccionar(sel, true)
  }, [sel, modo])

  useEffect(() => {
    escena.current?.aplicarTema()
  }, [tema])

  // Máquina del tiempo
  useEffect(() => {
    if (anio == null) {
      escena.current?.setAnio(null)
      return
    }
    const an = anomaliasAnio(variable, periodo, rango)
    const valores: Record<string, number> = {}
    for (const [id, porAnio] of Object.entries(an.porId))
      if (porAnio[anio] != null) valores[id] = porAnio[anio]
    escena.current?.setAnio({ valores, max: an.max })
    // tema: los colores del año se releen del tema
  }, [anio, variable, periodo, rango, tema])

  useEffect(() => {
    escena.current?.setTextoOceano(t.ocean)
    escena.current?.setIdioma(idioma)
  }, [t.ocean, idioma])

  if (!conWebgl) return <Mapa2D interactivo={modo === 'explorar'} />
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
