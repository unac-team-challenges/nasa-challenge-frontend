# fix/periodo-2001

El front arrancaba en 1981–2024 aunque se decidió 2001–2024 (backend `docs/tendencias.md`, 14 nov).

## Cambiado
- `store.ts`: `periodo` arranca en `reciente` (2001–2024).
- `useZonas.ts`: la API se usa con `reciente` (antes exigía `largo`, que ya no es el valor por defecto).
- README: la copia local de respaldo también muestra 2001–2024.
- Los años ya no están escritos a mano: la tabla de fuentes de `/metodologia` y la descripción de la portada (`META`, `{desde}`) toman `anio_inicio`/`anio_fin` de la API, o de la copia local si no responde.
- Se quitan las etiquetas `periodos` («Desde 1981/2001») de `textos.ts`: no se usaban desde que se quitó el selector.
- Sin cambio: `index.html` (lo leen los rastreadores sin JS) y las imágenes del Caso 2 (2001 y 2024 son archivos fijos).
