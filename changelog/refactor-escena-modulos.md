# refactor/escena-modulos

## Cambiado
- `escena/escena.ts` pierde ~460 líneas (2.351 → 1.891) que pasan, movidas tal cual, a tres módulos nuevos de `src/features/mapa/escena/`:
  - `constantes.ts`: `LON0`, `LAT0`, `K`, `COSLAT`, `LUZ`, `DIR_LUZ`, `DIR_ASTRO`, `SOMBRA`, `ALTO_NUBE`, `N_NUBES`, `glsl`, `proyectar`, `MUNDO`, `RELIEVE`, `DPR_RELIEVE`.
  - `shaders.ts`: `PARTICULAS_VS/FS`, `NUBE_VS/FS`, `SUELO_VS/FS`.
  - `texturas.ts`: `conSombraDeContacto`, `texturaSombraPeru`, `pixel`, `texturaCielo`, `texturaAstro`, `texturaNube`, `texturaPunteada` y sus tipos (`RelieveTapa`, `Previo`).
- La precarga de las texturas del mundo (`TEXTURAS_MUNDO` y su bucle con `Image`) se queda en `escena.ts`: es un efecto al cargar el módulo y no es una constante.

## Notas
- Solo movimiento de código: se comprobó comparando las líneas del archivo original con la suma de los cuatro (solo cambian los `import`/`export`, las cabeceras y tres líneas que Prettier reparte distinto por el `export`). Prettier también reformateó una línea suelta de la clase (`const anio = …`).
- **No** se partió la clase `EscenaPeru` (~1.650 líneas): separar cielo, relieve, calor, interacción y cámara exige tocar su estado compartido y es un cambio con riesgo distinto; queda como un PR aparte.
- Cuidado al mover: un primer intento puso `export` delante de líneas GLSL dentro de las plantillas (`const vec3 LUZ …`) y rompía la compilación de los shaders. Lo detectó el e2e `recorrido` (el 3D real) y no `tsc` ni `eslint`.
- `pnpm lint`, `pnpm build` y `pnpm test` (190 pasan); e2e `recorrido`, `leyenda` y `tiempo-caso2` pasan con 3D real. `mapa-limpio › en el 3D solo quedan 4 etiquetas de referencia en celular` falla, pero también falla en `developer` sin estos cambios.
