# feat/carga-rapida-portada

PR: base `developer`. Carga más rápida del mapa 3D, portada más liviana visualmente e inglés por defecto.

## Rendimiento (medido con 4G simulado, caché vacía, GPU real)
- Relieve completo del mapa: ~12,7 s → ~9,1 s.
- `public/mapa/mundo*.png` → `mundo*.webp` **sin pérdida** (píxeles idénticos, 1,44 MB → 0,99 MB). Tienen que ser sin pérdida: los canales son datos (profundidad, ríos, fronteras, altitud). `scripts/generar_mundo.py` ya escribe `.webp`.
- `escena.ts`: las texturas empiezan a bajar al evaluar el módulo, no ~1 s después al armar la escena; el `TextureLoader` y el 2D reutilizan la misma descarga (mismo modo CORS).
- `escena.ts`: el canvas de la sombra del Perú usa `willReadFrequently` (el `getImageData` ya no espera a la GPU) y `checkShaderErrors` solo en desarrollo.
- `App.tsx`: el chunk de three.js empieza a bajar al cargar `App`, sin esperar al primer render.
- `vercel.json`: `Cache-Control` inmutable para `/assets/*` (con hash) y de un día para `/mapa/*`.
- Descartado: precargar las texturas en `index.html` compite con el JS y retrasa three.js ~2,6 s.

## Interfaz
- Portada: paneles más transparentes (`.vidrio-suave`) en claro y oscuro; bloque del botón rediseñado (botón grande con flecha, fuente con icono y enlace a la metodología debajo).
- Metodología: sale de la cabecera; ahora es un botón flotante con icono de libro (abajo a la derecha en escritorio, arriba a la derecha del mapa en celular) con el mismo menú.
- Ayuda «Tendencia / Año a año»: tono neutro (icono de info, sin borde de alerta) y se cierra sola a los 9 s con una barra de cuenta atrás.
- Idioma por defecto: inglés. `?lang=es` abre en español; solo el español queda en la URL. `index.html` en inglés (lang, título, descripción, OG).

## Pruebas
- `e2e/apoyo/espanol.ts`: `page.goto` agrega `?lang=es` si la URL no elige idioma (las pruebas se escribieron con los textos en español).
- Ajustadas las pruebas que miraban `lang` en la URL y la de metodología desde la cabecera.
