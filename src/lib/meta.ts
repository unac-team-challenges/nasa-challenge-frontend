import { useEffect } from 'react'
import { META } from '../i18n/textos'
import { useApp } from '../store'
import { useRango } from './useZonas'
import type { Ruta } from './ruta'

/** Fondo de cada tema (--bg de src/index.css): el color de la barra del navegador en el celular. */
const COLOR = { claro: '#dce2e3', oscuro: '#0f1c26' }

const poner = (selector: string, valor: string) =>
  document.querySelector(selector)?.setAttribute('content', valor)

/**
 * Etiquetas para buscadores y redes según la pantalla, el idioma y el tema.
 * index.html trae las de español (las únicas que leen los rastreadores que no ejecutan JS);
 * aquí se actualizan para quien navega.
 */
export function useMeta(ruta: Ruta) {
  const idioma = useApp((s) => s.idioma)
  const tema = useApp((s) => s.tema)
  const desde = useRango('lluvia').year_start
  useEffect(() => {
    const { titulo } = META[idioma][ruta]
    const descripcion = META[idioma][ruta].descripcion.replace('{desde}', String(desde))
    document.title = titulo
    poner('meta[name="description"]', descripcion)
    poner('meta[property="og:title"]', titulo)
    poner('meta[property="og:description"]', descripcion)
    poner('meta[property="og:locale"]', idioma === 'es' ? 'es_PE' : 'en_US')
    poner('meta[name="twitter:title"]', titulo)
    poner('meta[name="twitter:description"]', descripcion)
  }, [ruta, idioma, desde])
  useEffect(() => {
    // Sin tema elegido, cada etiqueta sigue al sistema (su `media`); con tema elegido, ambas valen lo mismo
    poner('meta[name="theme-color"][media*="light"]', COLOR[tema ?? 'claro'])
    poner('meta[name="theme-color"][media*="dark"]', COLOR[tema ?? 'oscuro'])
  }, [tema])
}
