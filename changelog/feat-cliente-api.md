# feat/cliente-api

PR: #11 se unió a `feat/caso2-antes-despues` cuando esa rama ya estaba en `developer`, así que el cambio no llegó. Se rescata con un PR nuevo hacia `developer`.

## Añadido
- Cliente `openapi-fetch` con tipos generados desde el `openapi.json` del backend (`pnpm gen` → `src/api/schema.d.ts`). URL en `VITE_API_URL` (`.env.example`).
- Respaldo (plan B): si la API no está configurada, no responde en 4 s o todavía no trae `stats` en las 25 zonas, se usa la copia local de datos reales (`power.json`). Con `stats`, la lluvia en mm/día pasa a mm/año.
- TanStack Query en `main.tsx`; `useZonas`, `useSerie` y `useFuente` en `src/lib/useZonas.ts`. La ficha dice qué fuente sirvió los datos.
- 5 pruebas de Vitest (`src/api/consultas.test.ts`).

## Pendiente
- Revisado el 2026-11-14: el backend en Render responde las 25 zonas pero con `stats: null`, así que la web llama a la API y sigue usando la copia local.
- Probar contra el backend real cuando `/api/zonas` traiga `stats` (cálculo de Josue).
