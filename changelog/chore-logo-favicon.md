# chore/logo-favicon

Mejora 9 del documento de UX (arreglar el fondo del logo). Casi todo ya estaba en `developer`; esta PR cierra los dos huecos que quedaban.

## Ya estaba (revisado, sin cambios)
- `public/logo.png`: RGBA con fondo transparente de verdad (esquinas con alfa 0; el centro, opaco).
- `public/favicon.ico`: 16, 32 y 48 px con alfa; `public/favicon.svg` con `prefers-color-scheme: dark` interno (mango más claro) y el trazo del contorno y la órbita engrosados para que se lea a 16 px.
- La cabecera usa `logo.png` y el favicon es una versión simplificada del mismo logo del equipo (`scripts/logo.py`, `scripts/favicon.py`), con colores fijos.

## Cambiado
- **`index.html`: el `.ico` ya no lleva `sizes="any"`** (ahora `sizes="32x32"`) y el SVG queda al final. Con `sizes="any"`, Chrome elige el `.ico` y nunca usa el SVG que cambia con el tema oscuro. El snippet del documento tenía el mismo problema.
- **`public/og.png` lleva el logo**, arriba a la derecha (160 px, margen de 70 px, con un contorno claro de 1 px al 50 % para despegar el aro azul del fondo oscuro, igual que la cabecera en tema oscuro). El documento pide que el logo se vea igual en la pestaña, la cabecera y `og.png`; antes `og.png` no tenía logo. Se compuso una sola vez con Pillow sobre el `og.png` anterior (queda en el historial de git); no hay script que lo regenere.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; el e2e `logo-favicon` (nuevo) pasa y el de los `<link>` falla sin el cambio.
- Revisado el SVG a 16 y 32 px sobre pestaña clara y oscura: se reconoce la lupa con el Perú rosa y verde. Fue una captura chica, no una pestaña real de Chrome.

## Pendiente
- **Colores fijos para video y Canva (punto 5 del documento):** `logo.png` ya tiene colores fijos, pero mide 160 px; para video hace falta una versión grande, y el original (`logo.jpeg`, de 2048 px) no está en el repo. Si el equipo lo pasa, se exporta con `scripts/logo.py` a otro tamaño.
- Verificar el favicon en una pestaña real (Chrome, Firefox, Safari) y en el tema oscuro del sistema.
- `og:image` sigue con URL relativa (`/og.png`): los rastreadores piden una absoluta, pendiente de que haya dominio (ya anotado en el README).
