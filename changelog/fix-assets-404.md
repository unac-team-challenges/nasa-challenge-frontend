# fix/assets-404

## Corregido
- `vercel.json`: un archivo que no existe bajo `/assets/` ya no cae en el rewrite de la SPA → `/index.html`. Antes devolvía el `index.html` con `Cache-Control: immutable` (1 año): una pestaña vieja que pidiera un chunk de un despliegue anterior podía dejar ese HTML guardado en la caché bajo la URL del chunk.
- El rewrite de la SPA ahora excluye `/assets/` con un lookahead negativo (`/((?!assets/).*)`), así ninguna regla atrapa `/assets/<falta>` y Vercel responde su 404.
- Primer intento (rewrite previo de `/assets/(.*)` hacia una ruta inexistente) no servía: Vercel encadena los rewrites y esa ruta volvía a caer en `/(.*)` → `/index.html`. Comprobado en preview.
- Los archivos que sí existen no cambian: Vercel sirve primero los archivos reales y solo después aplica los rewrites.
