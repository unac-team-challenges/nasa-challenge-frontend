/**
 * ¿El navegador puede dibujar 3D?
 * `?sinwebgl` en la URL simula que no (para probar el respaldo 2D, como el prototipo).
 */
export function hayWebgl(): boolean {
  try {
    if (new URLSearchParams(location.search).has('sinwebgl')) return false
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}
