# feat/agricultor-resumen

PR: base `developer`. La ficha del **agricultor** pasa de palabras de estadística («Cambio claro», «Puede ser casualidad») a palabras de chacra, y la tarjeta de años secos deja de dar cifras engañosas en la costa norte. Tres bloques (A, B, C) más la integración con la vegetación como variable (#75).

## A · Años de seca
- «Lo de siempre» es la **mediana de la primera mitad sin los años de El Niño** (`aniosMalosPorMitad`), no el promedio: el Niño de 1983 y 1998 lo inflaba y en Lambayeque un año típico salía «seco». La vegetación mantiene su umbral propio (#75).
- El titular solo dice «sí» o «no» si la tendencia es un cambio real y va hacia ese lado (`respuestaMalos`); si no, no la llama costumbre. Antes contradecía a la tarjeta de confianza (Huánuco).
- Cada cuánto viene un año malo (`frecuencia`): «uno cada 4 años», «uno cada 2 o 3 años», «ni uno». Y un año para recordar (`anioParaRecordar`): «¿Te acuerdas de 2024? Ese año faltó como un tercio de la lluvia de siempre».
- Si la tendencia es clara hacia lo malo pero no hay más años malos (Loreto), lo aclara (`tendenciaSinMasMalos`).

## B · La tendencia en palabras de chacra
- La confianza va dentro de la tarjeta de la tendencia: «Esto ya viene pasando», «Por ahora, sube y baja nomás», «Aquí no lo podemos medir».
- Cambio en todo el periodo y en fracciones (`fraccion`, `cambioEnPeriodo`, `titularCampo`): «Desde 2001, llueve como un quinto menos que antes». El calor, también en metros (`metrosEquivalentes`, 6,5 °C por km): «Es como tener la chacra unos 180 m más abajo en el cerro». El verdor, en «apenas / un poco / bastante» frente a su promedio (`nivelVerdor`).
- El Niño en palabras: «Casi el doble de lluvia» (+90 %).

## C · Más para el agricultor
- `CampoOtraVariable`: «¿Y el calor?» / «¿Y la lluvia?» (viendo vegetación, las dos), con botón para verla. Si llueve menos y hace más calor, lo junta.
- «Un año normal aquí» suma el último año (`comoFue`).
- Vegetación de los valles en **hectáreas** con barras 2001 y 2024. No en niveles de NDVI: el promedio del recuadro mezcla campo y desierto (Ica: 0,14 → 0,20).
- `Escuchar`: lee la ficha en voz alta (Web Speech API, es-PE), solo lo marcado con `data-leer`.
- `miles()` usa `es` y no `es-PE` («2,263 mm» se leía como dos coma algo).
- `useZonasDe(variable)` en `hooks/useZonas.ts`.

## Notas
- `tsc`, `eslint`, `pnpm test` (168) y `pnpm build` pasan. Comprobado en pantalla contra la API (es y en) en Huánuco, Arequipa, Loreto, Ucayali, Apurímac, La Libertad y Piura.
- La voz solo se probó interceptando `speechSynthesis`, sin oír el audio.
