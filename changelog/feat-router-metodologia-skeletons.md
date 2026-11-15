# feat/router-metodologia-skeletons

Rutas con TanStack Router + Zod, página de metodología, esqueletos y errores, metadatos, carga diferida, shadcn real y pruebas con Testing Library. Sale de `fix/aviso-en-ingles`.

## Añadido

- **Rutas con enlaces compartibles** (`src/router.tsx`, `src/lib/busqueda.ts`): `/`, `/explorar`, `/zona/:id` (ubigeo `01`–`25`; otro id muestra «no existe») y `/metodologia`. `variable`, `perfil` y `anio` van en la URL, validados con Zod (un valor inválido se ignora). La URL usa texto plano (`?anio=2017`, no `?anio=%222017%22`). `/explorar` y `/zona/:id` comparten el mismo diseño: al elegir una zona el mapa 3D no se recrea. Sigue la URL definida en `07-stack-decidido` del Drive.
- **Metodología, fuentes y créditos** (`/metodologia`, `src/components/Metodologia.tsx`): fuentes con resolución y años, cómo se calcula la tendencia, cómo leer el semáforo, límites y créditos. En español e inglés, dentro de `src/i18n/textos.ts` (un solo archivo de textos, como decide el Drive). Enlazada desde la cabecera y la portada.
- **Esqueletos y pantalla de error** (`Esperas.tsx`, `Errores.tsx`): con la forma de mapa, gráfico, ficha y explorador. Error de pantalla con «Reintentar», ruta inexistente y aviso cuando la serie de una zona no llega de la API (antes el gráfico desaparecía sin decir nada).
- **Metadatos**: título, descripción, Open Graph, Twitter y `theme-color` para tema claro/oscuro en `index.html`; `src/lib/meta.ts` los actualiza por pantalla, idioma y tema. Favicon propio que cambia con el tema (era el logo de Vite) e imagen `public/og.png`.
- **shadcn/ui de verdad**: `Button`, `Alert` y `Skeleton` en `src/components/ui`. `Button` tiene las variantes del proyecto (`default`, `outline`, `toggle`, `ghost`) y reemplaza los botones con clases repetidas.
- **Pruebas**: Testing Library + jsdom (`src/test/`), pruebas de la URL, las pantallas, los esqueletos y los errores; e2e de enlaces compartidos (`e2e/enlaces.spec.ts`).
- `vercel.json` con _rewrite_ para que recargar en `/zona/20` funcione.
- `docs/para-favio.md`: lo que depende de producto, diseño o datos (expedientes, buscador, fuentes mezcladas, NDVI, compartir, persistencia, carpetas).

## Cambiado

- **Zustand** queda solo para estado global (idioma, tema, fuente, vista 3D/2D, informe, Play, «sin El Niño»). `variable`, `perfil`, zona y año pasan a la URL (`useBusqueda()`).
- **React.lazy**: el 3D (three.js), el gráfico, el explorador y la metodología se descargan aparte. El JavaScript inicial baja de ~1,1 MB a ~0,58 MB; three.js (~0,64 MB) llega al abrir el mapa.
- `src/shadcn.css` apuntaba a tokens que no existen (`--text`, `--floor`): ahora usa `--fg` y `--line`.
- README: rutas, esperas, metadatos, datos y periodo (API 2001–2024, copia local 1981–2024), shadcn, pruebas.
- `playwright.config.ts`: puerto configurable con `E2E_PORT` (si el 4173 está ocupado, Playwright reutilizaba otro servidor sin avisar).
- Los enlaces antiguos con `#explorar` ya no funcionan.

## Pendiente

- `og:image` necesita URL absoluta cuando haya dominio.
- Estructura de carpetas del frontend: no encontré un árbol acordado en el Drive (ver `docs/para-favio.md`, punto 7).
- Plan B `public/data/` con la forma de la API (`07-stack-decidido`): no se hizo aquí.
