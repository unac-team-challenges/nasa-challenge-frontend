# feat/mapa2d-encuadre

Tercera parte de la mejora 8 (mapa 2D en celular): el encuadre respeta los paneles. El toque (8a) y los gestos (8b) van en PRs aparte.

## Añadido
- **El Perú se encuadra en lo que dejan libre los paneles.** Antes el mapa se centraba en toda la caja y el título, los avisos y los botones tapaban el norte (en la captura a 390 × 844, Loreto y Tumbes quedaban debajo del título). Ahora, en celular (mapa de menos de 600 px), el mapa se dibuja en el alto que queda entre los paneles de arriba y los de abajo.
- **Cómo se mide.** Los paneles que tapan el mapa llevan `data-cubre-mapa` (el bloque del título con sus avisos, la barra del tiempo, los botones de vista y la leyenda «Cómo leer el mapa»). El hook `useMargenMapa`, en `Explorador`, mide su posición con `ResizeObserver` y deja en el store (`margenMapa`) cuánto tapan arriba y abajo. `Mapa2D` lo lee de ahí, porque sin WebGL el mapa 2D lo monta `Mapa3D` desde `App` y no pasa por `Explorador`. La función pura es `utils/margenMapa.ts`, con test unitario.
- **Reglas del margen.** Solo cuentan los paneles que caen en la franja central del 40 % del ancho, donde queda el Perú (que es angosto): la barra del tiempo pegada al borde derecho no encoge el mapa. Se suma 8 px de aire. La leyenda cuenta solo mientras está cerrada: abierta es una hoja que la persona abrió a propósito y no encoge el mapa. Nunca se deja menos del 55 % del alto para el mapa. Si los paneles piden más, el margen se reparte en proporción.
- **Se adapta solo.** Si un aviso se cierra (la ayuda del modo) o aparece otro, o el panel cambia de tamaño o de lado, el margen se vuelve a medir. No hay medidas fijas en píxeles.

## Cambiado
- `Mapa2D`: el SVG ya no ocupa toda la caja sino el área libre, y la escala `s` y los desplazamientos `oX`/`oY` se calculan sobre ella. El suelo (canvas), las etiquetas, el zoom a una zona y las áreas de toque ya usaban esos valores, así que siguen alineados.
- En escritorio no cambia nada: el margen solo se aplica con el mapa en celular y en el explorador (la portada no lo usa).

## Costo: el Perú se ve más chico
- A 390 × 844 con los paneles de hoy, el Perú pasa de ocupar ~506 px de alto (centrado, con el norte tapado) a ~225 px (~155 px de ancho). Es el precio de que nada quede debajo de los paneles; baja si los paneles ocupan menos, y por eso conviene medir otra vez cuando entre #47 (título en una línea, botones en «⋯»).
- Hallazgo: con el encuadre anterior, Callao quedaba justo bajo la leyenda cerrada. Con este se puede tocar sin abrirla.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan.
- `mapa2d-toque.spec.ts`: el segundo test hace clic sobre la zona misma (`dispatchEvent('click')`) en lugar de tocar el centro de su caja; con el mapa más chico ese punto cae en el borde de toque de Apurímac, que 8a dibuja encima de sus vecinas.
- `mapa2d-encuadre.spec.ts` (nuevo): a 390 × 844 ningún panel marcado se cruza con el rectángulo que ocupa el Perú (con la ayuda del modo abierta lo roza hasta 40 px, ver Pendiente); elegir una zona sigue acercando el mapa; en escritorio el SVG sigue ocupando toda la caja. El primer test falla sin el margen y pasa con él.
- Al cerrar la ayuda del modo, el mapa crece de golpe (no hay transición).

## Pendiente
- **Peor caso:** sin WebGL y con la ayuda del modo abierta hay dos avisos apilados bajo el título; el tope del 55 % impide evitarlos del todo y parte del norte queda bajo el aviso. Con solo la ayuda abierta (primera visita) el roce es de ~28 px; con los dos avisos es mayor.
- Medir de nuevo cuando entren #41 (línea de tiempo horizontal abajo), #45 (gestos) y #47 (mapa limpio): el margen debería adaptarse solo, pero hay que revisar las capturas. En #47 el título pasa a una línea y los botones van en «⋯».
- Verificar en un celular real. Con el mapa más chico algunas zonas pequeñas reciben un borde de toque más grueso (8a), que puede quitar toques cerca de las fronteras a sus vecinas grandes; es el comportamiento previsto de 8a.
