# feat/base-frontend

PR: base `developer`.

## Añadido

- Base del frontend con Vite 8 + React 19 + TypeScript, gestionada con **pnpm** (`packageManager: pnpm@10.34.9`, `pnpm-lock.yaml`).
- Dependencias del stack: three.js (en lugar de Leaflet), TanStack Query y Router, Zod, Zustand, Recharts, react-compare-slider, lucide-react, Tailwind v4 y las fuentes Newsreader + Public Sans.
- `src/index.css`: tokens de color del prototipo v2 (Humboldt oscuro, Garúa claro, colores del mapa y acento) expuestos como clases de Tailwind.
- Alias `@/` → `src/`, **ESLint** (config plana, typescript-eslint, react-hooks), Prettier y Vitest (`pnpm lint`, `pnpm format`, `pnpm test`). Así lo dice `07-stack-decidido`.
- **shadcn/ui**: `components.json` (new-york), `cn()` en `src/lib/utils.ts` y `src/shadcn.css`, que conecta los tokens de shadcn con los colores del prototipo. Los componentes se añaden uno por uno.
- TypeScript fijado en `~6.0.3`: typescript-eslint no soporta TS 7 (`typescript-eslint does not support TS 7.0`).
- `pnpm test` pasa sin pruebas (`--passWithNoTests`).

## Cambiado

- `index.html`: ahora es la entrada de Vite (antes era la página de prueba de Vercel).
- `README.md`: uso con pnpm, stack y aviso sobre la red del evento.

## Pendiente

- Portar el prototipo v2 (portada, explorador, Mapa3D, Mapa2D en SVG, ficha).
- Las otras 3 paletas (Andes, Amazonía, Nazca) y los colores del mapa en oscuro.
- Componentes de shadcn/ui, según se necesiten.
- Cliente `openapi-*`: PR aparte (el backend ya tiene `openapi.json`).
- Revisar en Vercel que use pnpm (lo detecta por `pnpm-lock.yaml`).
