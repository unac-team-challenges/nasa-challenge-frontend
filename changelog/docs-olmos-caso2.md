# docs/olmos-caso2

PR: base `developer`. Autor: Leandro. Solo documentación.

## Añadido
- `docs/olmos-caso2.md`: tarea para integrar Olmos en el Caso 2 con su aviso visible. Viene de las PR #56 y #58 del backend, que ya sirven Olmos en `GET /api/vegetacion`.
  - Estado de hoy: el contrato ya está (PR #28), pero `vegetacionDeApi` descarta `aviso`, `tipo` y `unidad_geografica`, y `AntesDespues` devuelve `null` si el departamento no está en `VALLES`, así que Lambayeque no muestra nada.
  - Qué hacer: conservar esos campos, mostrar Olmos desde la API, mostrar `stats.aviso` sin interacción y también en inglés, no usar deslizador (no hay imagen) y no presentar el «×10».
  - Criterio de «hecho» con los tests que deben fallar si el aviso desaparece.

## Pendiente
- Hacer la tarea del documento (otro PR, de quien tome el frontend).
