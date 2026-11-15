# fix/sincroniza-contrato

## Corregido
- `src/api/openapi.json` y `schema.d.ts` sincronizados con el `openapi.json` del backend en `developer` (PR #41): ahora traen `Stats`, `Status`, `celdas`, `nota`, y `anio_inicio`/`anio_fin` obligatorios en `VariableInfo`.
- Antes el front tipaba contra el contrato viejo (sin `stats`), aunque el cliente ya leía esos campos.

## Notas
- Solo contrato y tipos generados (`pnpm gen`); sin cambios de código. `tsc`, `lint`, `build` y `test` pasan.
- Trabajo previo sin enviar (rama local `feat/conectar-stats`) queda aparte: #13 ya cubre el cliente.

## Pendiente
- Test de integración contra la API real (siguiente PR).
