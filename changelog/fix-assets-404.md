# fix/assets-404

## Corregido
- `vercel.json`: un archivo que no existe bajo `/assets/` ya no cae en el rewrite `/(.*)` → `/index.html`. Antes devolvía el `index.html` con `Cache-Control: immutable` (1 año): una pestaña vieja que pidiera un chunk de un despliegue anterior podía dejar ese HTML guardado en la caché bajo la URL del chunk. Ahora un rewrite previo, solo para `/assets/(.*)`, lo manda a una ruta que no existe.
- Los archivos que sí existen no cambian: Vercel sirve primero los archivos reales y solo después aplica los rewrites.

## Sin probar
- No se puede comprobar desde aquí: hay que mirar el despliegue de preview.
  - `curl -I <preview>/assets/no-existe.js` → debe dar 404.
  - `curl -I <preview>/assets/<un archivo real>` → 200 con `cache-control: public, max-age=31536000, immutable`.
  - `curl -I <preview>/explorar` → 200 (la SPA sigue funcionando).
- Duda abierta: si Vercel aplica el `Cache-Control` inmutable también a esa respuesta 404, un 404 se guardaría un año. Si el `curl -I` del primer punto muestra ese header en el 404, hay que restringir el header de `/assets/` a nombres con hash.
