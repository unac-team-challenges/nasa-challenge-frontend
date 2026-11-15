# feat/conectar-stats

Conecta el front con el contrato de la PR #41 del backend (`/api/zonas` con `stats`). Se apila sobre `fix/rescata-cliente-api` (#13).

## Cambiado
- `src/api/openapi.json` y `schema.d.ts` regenerados con el contrato de la PR #41 (`Stats`, `Status`; `Zona` y `ZonaDetalle` con `celdas`, `nota?` y `stats`).
- `celdas` y `nota` se leen de la **zona**, no de `stats`. `stats.motivo` no existe: `Zona.motivo` pasa a `nota` (aviso de la fuente: pocas celdas) y se añade `aviso` (`stats.aviso`: IMERG 2014 o `lag1 > 0.5`). La ficha muestra las dos cosas por separado.
- El periodo es **2001–2024**: es el que sirve la API. `periodo` arranca en `reciente` y la API se usa con ese periodo (antes `largo`). Texto de la portada: «de 2001 a 2024». La copia local sigue como respaldo.
- `consultas.test.ts` con la forma real del contrato; pruebas nuevas de `celdas`/`nota`/`aviso`.

## Pendiente
- El `aviso` llega en español: en inglés se ve en español.
- No se corrieron `pnpm build`, `test`, `lint` ni `e2e` (sin acceso a npm); `schema.d.ts` se regeneró con `openapi-typescript`.
- Unir primero la PR #13 del front y la PR #41 del back.
