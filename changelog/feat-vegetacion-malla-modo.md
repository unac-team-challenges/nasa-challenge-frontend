# feat/vegetacion-malla-modo

El modo «Vegetación» (#53) pinta de fondo el **verdor (NDVI) de todo el Perú**, celda por celda, debajo de los 5
recuadros. Reemplaza a #66, que hacía de la vegetación una tercera variable: se respeta la decisión del equipo (la
vegetación es un modo) y se suma la malla nacional que ya sirve el backend (#70 y #73).

## Por qué
El modo se pensó con solo 5 recuadros porque no había datos del resto del país; los departamentos quedaban apagados.
El backend ya tiene la malla de NDVI de MODIS a 0,25° (~27 km) para las 25 regiones, 2001–2024: con ella el mapa se ve
verde donde hay vegetación (selva), paja en la sierra y ocre en la costa y el sur.

## Qué cambia
- `useCalor`: en el modo devuelve la malla de vegetación (antes `null`), de `/api/celdas?variable=vegetacion` o de la
  copia local `src/data/celdas_vegetacion.json` (chunk aparte, copia de `data/celdas/vegetacion.json` del backend).
- 3D (`escena.ts`) y 2D (`Mapa2D.tsx`): en el modo, las tapas muestran el NDVI pleno (la tendencia va solo en los 5
  recuadros, que siguen encima con su color). Sin malla, quedan como antes (apagados).
- Rampa `--veg-0..4` (ocre → paja → verde claro → verde → selva) y `PARADAS_VEG`.
- `prepararCalor` lee `t2m` (temperatura) o `valor` (mallas nuevas), como en el contrato del backend.
- Leyenda del modo: rampa del NDVI con su escala y la nota (6 meses sin nubes, saturación en la selva).
- Textos: la intro del modo ya no dice que no hay datos de los 25 departamentos; subtítulo «todo el Perú y 5 lugares».
- `openapi.json` y `schema.d.ts` regenerados con el contrato del backend (`Celda` admite `valor`).

## Actualizar la copia local
```bash
cp ../nasa-challenge-backend/data/celdas/vegetacion.json src/data/celdas_vegetacion.json
```
