# feat/cliente-api

PR: #11 se unió a `feat/caso2-antes-despues` cuando esa rama ya estaba en `developer`, así que el cambio no llegó. Se rescata con un PR nuevo hacia `developer`.

## Añadido
- Cliente `openapi-fetch` con tipos generados desde el `openapi.json` del backend (`pnpm gen` → `src/api/schema.d.ts`). URL en `VITE_API_URL` (`.env.example`).
- Respaldo (plan B): si la API no está configurada, no responde en 4 s o todavía no trae `stats` en las 25 zonas, se usa la copia local de datos reales (`power.json`). Con `stats`, la lluvia en mm/día pasa a mm/año.
- TanStack Query en `main.tsx` y hooks en `src/lib/useZonas.ts`. La ficha dice qué fuente sirvió los datos.

## Revisión del #13 (leandro291)
- Contrato sincronizado con `openapi.json` del backend (`developer`) y `pnpm gen`: llega `nota` en `/api/zonas/{id}`. La ficha la muestra bajo la fuente (en inglés, con un texto fijo: `notaFija`).
- Rótulos de años y fuente según quién sirve los datos: con la API salen de `anio_inicio`/`anio_fin` y `fuente` de `/api/variables` (hoy 2001–2024); con la copia local, 1981–2024 y NASA POWER (MERRA-2). Aplica a portada, franjas, explorador, leyenda, ficha y gráfico. Las franjas calculan el promedio dentro de ese rango.
- Sin salto de fuente: al abrir la web se piden las dos variables a la vez (`datosDeApi`). La fuente se fija una sola vez por sesión (`decidirFuente`, en `App.tsx`) con lo primero que pase: la API contesta (`api`, o `local` si falla o viene incompleta), o se entra a `#explorar` (`local` toda la sesión). Mientras, la portada muestra la copia local.
- En modo API, la ficha espera la serie de la API (no mezcla con la local). Una variable sin `anio_inicio`/`anio_fin` va con la copia local.
- La máquina del tiempo ajusta el año al rango si cambia la variable o El Niño.
- La lógica de respaldo local no cambia.
- Compatible con `stats` del backend (PR #41 de `nasa-challenge-backend`): `celdas` se lee de la zona (no de `stats`) y `aviso` se muestra como motivo. Los textos de celdas usan la fuente de la API. Probado con ese backend en local: la portada dice 2001–2024 y GPM IMERG v07, Piura usa 291 celdas y Callao muestra su nota.
- Pruebas: 16 en Vitest (`consultas`, `datos` y `decidirFuente`); e2e 4 de 4. Probado en el navegador con una API simulada: con respuesta rápida la portada dice 2001–2024 y GPM, y Callao muestra la nota; con 3 s de demora entrando a `#explorar`, se queda en 1981–2024.

## Pendiente
- El backend en Render devuelve las 25 zonas **sin el campo `stats`**, así que la web llama a la API y sigue usando la copia local.
- Cuando el backend publique `stats` en `Zona`: `pnpm gen` y quitar los `as unknown` y la validación manual de `consultas.ts`.
- Probar contra el backend real cuando `/api/zonas` traiga `stats`.
- Después de unir: pasar `developer` a `main` y volver a publicar en Vercel (`VITE_API_URL` ya está puesta y el CORS deja entrar a la URL de Vercel).
