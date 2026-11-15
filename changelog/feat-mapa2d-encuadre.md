# feat/mapa2d-encuadre

Tercera parte de la mejora 8 (mapa 2D en celular): el encuadre respeta los paneles. El toque (8a) y los gestos (8b) ya están en `developer`.

## Añadido
- **El Perú se encuadra en lo que dejan libre los paneles.** Antes el mapa se centraba en toda la caja y los paneles tapaban el norte o Callao (bajo la leyenda). Ahora, en celular (mapa de menos de 600 px) y en el explorador, el mapa se dibuja en el alto que queda entre los paneles de arriba y los de abajo.
- **Cómo se mide.** Los paneles que tapan el mapa llevan `data-cubre-mapa`: el bloque del título con sus avisos, la barra del tiempo y la leyenda «Cómo leer el mapa». El hook `useMargenMapa`, en `Explorador`, mide su posición con `ResizeObserver` y deja en el store (`margenMapa`) cuánto tapan arriba y abajo. `Mapa2D` lo lee de ahí, porque sin WebGL el mapa 2D lo monta `Mapa3D` desde `App` y no pasa por `Explorador`. La función pura es `utils/margenMapa.ts`, con test unitario.
- **Reglas del margen.** Solo cuentan los paneles que caen en la franja central del 40 % del ancho, donde queda el Perú (que es angosto). Se suma 8 px de aire. Nunca se deja menos del 55 % del alto para el mapa; si los paneles piden más, el margen se reparte en proporción.
- **Leyenda abierta.** Mientras la leyenda esté abierta (hoja que la persona abrió a propósito) se conserva la última medida: el mapa no se mueve al abrirla ni al cerrarla.
- **Se adapta solo.** Si un aviso aparece o se va, o un panel cambia de tamaño o de lado, el margen se vuelve a medir. No hay medidas fijas en píxeles: por eso sobrevivió al rediseño del celular de #41 y #47.

## Cambiado
- `Mapa2D`: la escala `s` y los desplazamientos `oX`/`oY` se calculan sobre el área libre. El SVG sigue ocupando toda la caja; el encuadre va en su `viewBox` (con los mismos `oX`, `oY`, `s`), así que el suelo (canvas), las etiquetas, el zoom a una zona, los gestos y las áreas de toque siguen alineados.
- **El borde invisible de toque (8a) va debajo de las zonas**, no encima. Con el mapa más chico, esos bordes (hasta 40 px de trazo) se tragaban el interior de departamentos grandes: en Cusco, 41 de 100 puntos de su caja los recibía el borde de una vecina (Junín, Ayacucho, Apurímac, Puno…), y tocar el medio de Cusco elegía otra zona. Debajo de las zonas, el borde solo gana en el mar y fuera de la frontera, que es donde están las zonas chicas del documento (Callao, Tumbes, Tacna, Moquegua), y no le quita terreno a ninguna vecina. Una zona chica rodeada de tierra (sin costa ni frontera) ya no recibe el borde: se acerca con el pellizco (8b).
- En escritorio no cambia nada, y la portada no usa el margen.

## Costo: el Perú se ve más chico
- A 390 × 844, con el celular de `developer`, el Perú pasa de ocupar ~506 px de alto (centrado y con Callao bajo la leyenda) a ~267 px (~190 px de ancho). Se ve entero y sin nada encima.
- Sin WebGL el aviso «Tu navegador no muestra 3D» sigue siendo un panel más y encoge el mapa; es el peor caso (raro).
- Al cerrar un aviso el mapa crece de golpe (no hay transición).

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/mapa2d-encuadre.spec.ts` (nuevo, 390 × 844): ningún panel marcado se cruza con el rectángulo que ocupa el Perú; abrir la leyenda no mueve el mapa; elegir una zona sigue acercando; en escritorio el SVG ocupa toda la caja. El primero falla sin el margen.
- `e2e/mapa2d-toque.spec.ts`: test nuevo, «el borde de toque de una zona chica no le quita terreno a una vecina grande» (falla con el orden anterior: 41 puntos robados, y pasa con 0). El segundo test hace clic sobre la zona misma, porque el centro de la caja de Cusco no siempre cae dentro de Cusco.
- `e2e/mapa2d-gestos.spec.ts`: el toque simple busca un punto que reciba Cusco (o su propia área de toque) en lugar de tocar el centro de su caja.

## Pendiente
- Verificar en un celular real (ver las dudas de gestos y de toque en #45 y #43).
- Con zonas chicas rodeadas de tierra, el toque depende del pellizco; si se quiere ayudar también a esas, haría falta una lista corta para elegir (la otra opción del documento), en otra PR.
