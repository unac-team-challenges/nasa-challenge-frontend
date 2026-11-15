# chore/contrato-vegetacion

PR: base `developer`. Autor: Favio.

## Cambiado
- `src/api/openapi.json`: copiado del backend, PR #50 (`feat/ndvi-api`). Suma `GET /api/vegetacion` y los esquemas `ZonaVegetacion` y `AnioVegetacion` (NDVI de Chavimochic e Ica-Villacurí para el Caso 2). Solo se agregan cosas; las rutas que ya existían no cambian.
- `src/api/schema.d.ts`: regenerado con `pnpm gen` (+91 líneas, sin cambios en los tipos que ya existían).

## Pendiente
- El endpoint existe cuando se mezcle el PR #50 del backend y se despliegue en Render. Mientras tanto, estos tipos no se usan en ninguna parte y no cambian nada de lo que se ve.
- Usar `/api/vegetacion` en el Caso 2 (`AntesDespues`/ficha), con su `unidad_geografica`. Va en otro PR.
- Cuando entre `/api/cobertura-arboles` (selva, MOD44B), repetir `pnpm gen`.
