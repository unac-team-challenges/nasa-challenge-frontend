# feat/linea-tiempo-horizontal

## Cambiado
- Por debajo de 900 px, la máquina del tiempo (`BarraTiempo`) va **acostada**, pegada al borde de abajo del mapa y de 64 px de alto. Antes era una columna vertical de 68 px que tapaba todo el lado derecho y se movía con el mismo gesto que usa la página para desplazarse.
- Es el **mismo componente** con otras clases según el ancho (`min-[901px]:`), no uno nuevo. En escritorio sigue vertical, sin cambios.
- Fila de arriba: `Tendencia`, el año elegido (o el rango) y Play. Fila de abajo: `2001`, el riel de franjas con el año más antiguo a la izquierda, y `2024`.
- El deslizador es un `input type="range"` normal (sin `writing-mode`) **encima del riel**: su pista es transparente y solo se ve el control (clase `deslizador-riel` en `index.css`, solo bajo 900 px). El dedo se mueve de lado.
- Para dejarle sitio a la barra, en celular el título del mapa usa todo el ancho y la leyenda y los botones del mapa (3D/2D, girar, recentrar) suben a `bottom-[86px]`; los botones quedan en columna a la derecha.

## Notas
- Sin dependencias nuevas. `pnpm lint` y `pnpm test` pasan; `pnpm build` también. E2E: `linea-tiempo.spec.ts` (nuevo), `tiempo-caso2.spec.ts` y `enlaces.spec.ts` pasan.
- `linea-tiempo.spec.ts` comprueba a 390 × 844 que la barra es horizontal (más de 4 veces más ancha que alta), que 2001 queda a la izquierda, que el deslizador es horizontal y que tocar el medio da un año del medio. También que la barra no tapa la leyenda ni los botones, y que en escritorio sigue vertical.
- El documento pide «unos 56 px»: queda en 64 px para que quepan los dos renglones sin bajar de 32 px los botones.

## Pendiente
- Que arrastrar con el dedo por la página sobre el mapa no cambie el año (criterio de la mejora 4): el deslizador solo responde dentro de su franja, pero no hay una prueba automática de gesto táctil. Falta probarlo en un celular real.
- Esta rama sale de `developer` sin #38, que reescribió `BarraTiempo` para el interruptor Tendencia | Año a año. Al mergear la segunda habrá conflicto en ese archivo y se rehace sobre la barra nueva (el botón «Tendencia» pasa a ser el interruptor).
