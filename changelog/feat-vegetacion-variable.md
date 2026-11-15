# feat/vegetacion-variable

PR: base `developer`. La vegetación (NDVI de MODIS) pasa a ser también una **variable** del selector, junto a lluvia y temperatura, con las tendencias de los 25 departamentos que sirve el backend (#70 y #73: `/api/zonas?variable=vegetacion`).

El modo «Vegetación» sigue (#53, #69): su botón pasa a llamarse **«Lugares medidos»** (los 5 recuadros del Caso 2 y la selva) para no confundirse con la variable.

## Qué cambia
- `Variable` y `VARIABLES` incluyen `vegetacion`. La ficha, el semáforo, el medidor, la serie, el ranking y el CSV salen de las 25 zonas, con NDVI como unidad (`+0,004 NDVI` por década).
- Copia local `src/data/vegetacion.json` (zonas y series 2001–2024, copia de `data/zonas/vegetacion*` del backend) para el plan B sin API.
- `useVista`: el NDVI no depende del periodo ni de El Niño, así que sigue viniendo de la API con cualquiera de ellos.
- Mapa: la variable Vegetación pinta la misma malla de NDVI por celda que el modo (`useCalor`).
- Agricultor: «años de poco verdor» (NDVI 0,01 o más por debajo de lo normal de la primera mitad; con 0,02 solo 10 de 25 departamentos tenían algún año). No se muestran «qué trae El Niño» ni «un año normal» (no aplican al NDVI).
- Textos es/en de todas las variables; fuente local MODIS; el aviso de saturación de la selva ya viene del backend.

## Notas
- Callao sale `pocos_datos` (1 celda), como en el backend.
- `tsc`, `eslint` y `pnpm test` pasan (142). Comprobado en pantalla contra el backend de `developer` (es, en, agricultor y estudiante) sin errores de consola.
- Puede chocar con #72 (`useCalor`, textos del modo).
