# chore/cache-assets

## Cambiado
- `vercel.json`: los archivos de `/assets/` (JS, CSS y fuentes, todos con el hash del contenido en el nombre) se sirven con `Cache-Control: public, max-age=31536000, immutable`. Si el contenido cambia, cambia el nombre, así que el navegador nunca ve una versión vieja bajo el mismo nombre.

## Notas
- `index.html` y los archivos de `public/` (`og.png`, `mapa/*.webp`, `favicon`…) no llevan hash y se quedan con la caché por defecto de Vercel: no se les pone `immutable` para no dejar texturas viejas si se regeneran.
- No se pudo probar contra Vercel desde aquí: se comprobó que el JSON es válido y que `vite build` deja todo lo hasheado en `dist/assets/`. Hay que mirar la cabecera en el despliegue de preview.
