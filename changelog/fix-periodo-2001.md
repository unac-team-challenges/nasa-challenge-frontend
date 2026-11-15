# fix/periodo-2001

El front arrancaba en 1981–2024 aunque se decidió 2001–2024 (backend `docs/tendencias.md`, 14 nov).

## Cambiado
- `store.ts`: `periodo` arranca en `reciente` (2001–2024).
- `useZonas.ts`: la API se usa con `reciente` (antes exigía `largo`, que ya no es el valor por defecto).
- README: la copia local de respaldo también muestra 2001–2024.
