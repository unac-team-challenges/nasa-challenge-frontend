# feat/vegetacion-mapa

Vegetación (NDVI de MODIS) como tercera variable del mapa, junto a lluvia y temperatura. Va con el PR del backend
`feat/malla-vegetacion` (nasa-challenge-backend #70), que sirve `GET /api/celdas?variable=vegetacion`.

## Añadido
- **Variable `vegetacion`** en la cabecera (icono de hoja), la URL (`?variable=vegetacion`), el mapa 3D y 2D, la leyenda y
  la ficha. Rampa de verdes (`--veg-0..4`): ocre del desierto → paja → verde claro → verde → selva.
- **Malla por celda (0,25°, ~27 km)** de `/api/celdas?variable=vegetacion`; sin API, la copia local
  `src/data/celdas_vegetacion.json`, en un chunk aparte. Tendencias por departamento en `src/data/vegetacion.json`.
  Las dos copias salen de `scripts/copiar_vegetacion.py <ruta al backend>`: los mismos números que la API.
- **Leyenda:** escala del NDVI con 2 decimales y la nota de la selva (el NDVI se satura cerca de 0,85) y de los 6 meses
  sin nubes por año (decisión del backend: con 12 de 12 la selva quedaría vacía).
- `openapi.json` y `schema.d.ts` regenerados (`pnpm gen`) con el contrato del backend: `Celda` admite `valor`.

## Cambiado
- `useCalor`: una tabla `MALLAS` con las tres variables (lluvia, temperatura y vegetación), cada una con su copia local
  y su rampa. Las tres piden primero a la API (`/api/celdas` ya sirve lluvia) y caen a la copia local si falla.
- La unidad de la malla sale de cada respuesta (`calor.unidad`): la lluvia viene en mm/año en `/api/celdas` y en mm/día
  en `/api/zonas`.
- Copia local: la vegetación usa sus propios años (`rangoLocal`), no los de POWER.

## Arreglado
- «Pocos datos» por serie corta: la ficha dice «solo hay N años; necesitamos al menos 20», en vez de «muy pocas celdas»
  (Loreto tiene 490 celdas). La nota de pocas celdas solo sale cuando de verdad hay menos de 4.
- Leyenda: «Columna más alta: −Infinity» cuando ninguna zona tiene tendencia; ahora 0.

## Integración con `developer`
- Fusionado con #51 (`feat/mapa-lluvia`): su malla de lluvia y sus textos por variable (`calorCosa`, `calorNota`) se
  quedan; la vegetación se suma a esa misma forma.

## Pendiente
- Hoy la vegetación cubre **2001–2012** (2 de 4 bloques de AppEEARS). Las 25 zonas salen «pocos datos» (hacen falta 20
  años), por eso el mapa se ve pálido: es el mismo atenuado que cualquier zona con pocos datos. Cuando el backend
  publique 2001–2024 basta correr `scripts/copiar_vegetacion.py` y `pnpm gen`; no hace falta tocar código.
- `pnpm e2e` no se corrió en local: falta el navegador de Playwright de esta versión.
