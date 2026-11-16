# fix/responsive-zoom

## Corregido

- Con zoom del navegador (Ctrl +/-) la página se deformaba: el diseño de escritorio se elegía solo por ancho (`min-[901px]`). Una laptop 1366×768 al 150 % ve 910×438 px CSS: quedaba en escritorio con la cabecera en 3 filas, la barra de tiempo cortada y 731 px de alto en una pantalla de 438.
- Nuevas variantes `escritorio:` / `celular:` en `src/index.css` (ancho ≥ 901 px **y** alto ≥ 560 px). Reemplazan `min-[901px]:` / `max-[900px]:` en todo `src/`. El mismo valor en JS es `MQ_CELULAR` (`src/utils/disposicion.ts`), que usan la escena 3D y la cabecera.
- Mapa 3D: la resolución del lienzo sigue a `devicePixelRatio` al hacer zoom. Antes se fijaba al cargar: borroso con Ctrl +, sobrecargado con Ctrl −.
- Leyenda y botón «⋯» (celular) se ubican con `--alto-barra`, el alto real de `BarraTiempo`, en vez de `bottom-[66px]` / `bottom-[86px]`.
- Títulos con `clamp(rem, rem + vw, rem)`: crecen con el zoom (WCAG 1.4.4). El ancho del informe pasa a `rem`.
- Celular acostado (740×360): el mapa baja de 320 px a lo que entra, para que se vea con su barra de tiempo sin desplazarse.

## Pruebas

- `e2e/zoom.spec.ts`: 100 %, 150 %, 200 %, 50 %, celular vertical y acostado × portada, explorador (tendencia y año) y metodología. Sin scroll horizontal, sin paneles encimados y con la barra de tiempo entera a la vista.
- Local: lint, tsc, 190 unitarios y 95/95 e2e.
