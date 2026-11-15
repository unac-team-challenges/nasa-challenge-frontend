import { useEffect, useRef } from 'react'
import { TEXTOS } from '../i18n/textos'
import { useRango, useZonas } from '../lib/useZonas'
import { anomaliasAnio } from '../data/datos'
import { esUbigeo, useBusqueda } from '../lib/busqueda'
import { useApp } from '../store'
import { EscenaPeru, escenaActiva, type ModoMapa } from './escena'
import { Mapa2D } from './Mapa2D'

interface Props {
  modo: ModoMapa
}

/**
 * Mapa del Perú en 3D. Si no hay WebGL, muestra el mapa 2D con los mismos datos.
 *
 * La escena se crea una sola vez y sobrevive al paso entre la portada y el explorador: al cambiar
 * `modo` la cámara vuela a la otra vista. Antes se destruía y se volvía a cargar (con parpadeo).
 */
export function Mapa3D({ modo }: Props) {
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
  const modoInicial = useRef(modo)

  // Crear y destruir la escena (solo al montar)
  useEffect(() => {
    if (!conWebgl || !contenedor.current || !capa.current) return
    const e = new EscenaPeru(contenedor.current, capa.current, {
      oceano: TEXTOS[useApp.getState().idioma].ocean,
      modo: modoInicial.current,
      alElegir: (id) => busquedaRef.current.seleccionar(id),
      alGirar: (g) => useApp.getState().setGirando(g),
    })
    escena.current = e
    escenaActiva.current = e
    e.aplicarTema()
    e.setIdioma(useApp.getState().idioma)
    const { variable: v, sel: s0 } = busquedaRef.current
    const s = s0 && esUbigeo(s0) ? s0 : null // /zona/99 no existe: no se marca nada
    e.setDatos(zonas, v, true)
    if (modoInicial.current === 'explorar' && s) e.seleccionar(s, true)
    useApp.getState().setGirando(modoInicial.current === 'inicio' || !s)
    const sistema = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => e.aplicarTema()
    sistema.addEventListener('change', alCambiar)
    return () => {
      sistema.removeEventListener('change', alCambiar)
      e.destruir()
      escena.current = null
      if (escenaActiva.current === e) escenaActiva.current = null
    }
    // zonas se lee solo al crear; los cambios llegan por los efectos de abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conWebgl])

  // Portada ⇄ explorador: la misma escena, la cámara vuela
  useEffect(() => {
    escena.current?.setModo(modo)
  }, [modo])

  useEffect(() => {
    escena.current?.setDatos(zonas, variable)
  }, [zonas, variable])

  useEffect(() => {
    if (modo === 'explorar') escena.current?.seleccionar(sel && esUbigeo(sel) ? sel : null, true)
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
