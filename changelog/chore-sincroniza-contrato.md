# chore/sincroniza-contrato

Copia el contrato del backend tras su PR #83 (`fix/openapi-description`), para que la copia del frontend quede igual a la última versión.

## Cambiado
- `src/api/openapi.json`: copiado de `nasa-challenge-backend` (`developer`). Las 10 respuestas de `/api/*` pasan de `"description": ""` a su descripción (200: qué devuelve; 400: falta `variable` o no es válida; 404: la zona no existe).
- `src/api/schema.d.ts`: regenerado con `pnpm gen`. Solo añade 10 comentarios `@description`; ningún tipo cambia.

## Notas
- Sin cambios de código ni de datos. Los PR #79–#82 del backend (docs, Rust 2024, utoipa 6, logs) no tocan el contrato.

## Pendiente
- Nada.
