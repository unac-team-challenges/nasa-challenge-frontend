# feat/contrato-celdas-vegetacion

PR: base `developer`. Alinea el front con el contrato de `/api/celdas` del backend (#70 y #73).

## Cambiado
- `src/api/openapi.json` y `schema.d.ts`: `Celda` con `t2m` opcional y `valor` (lluvia y vegetación), regenerados del backend.
- `src/api/consultas.ts`: `celdasDeApi` acepta `temperatura`, `lluvia` o `vegetacion`.
- `src/features/mapa/hooks/useCalor.ts`: la lluvia sale de `/api/celdas?variable=lluvia` si la sesión usa API; si no, de la copia local (mismas celdas, mm/año).

## Notas
- La copia local `celdas_lluvia.json` sigue como respaldo sin API.
- Probado contra el backend de `feat/vegetacion-2001-2024` (NDVI 2001–2024). `tsc`, `eslint` y `pnpm test` pasan; el e2e de Playwright lo corre el CI.
