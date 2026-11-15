# feat/linea-tiempo-horizontal

## Cambiado
- Por debajo de 900 px, la máquina del tiempo (`BarraTiempo`) va **acostada**, pegada al borde de abajo del mapa y de 64 px de alto. Antes era una columna vertical de 68 px que tapaba todo el lado derecho y se movía con el mismo gesto que usa la página para desplazarse.
- Es el **mismo componente** con otras clases según el ancho (`min-[901px]:`), no uno nuevo. En escritorio sigue vertical, sin cambios.
- Modo **Tendencia**: una sola fila de unos 44 px con el interruptor `Tendencia | Año a año` (lado a lado) y el rango `2001–2024`. Sin riel ni Play.
- Modo **Año a año**: fila de arriba con el interruptor, el año elegido y Play; fila de abajo con `2001`, el riel de franjas (año más antiguo a la izquierda) y `2024`.
- El deslizador es un `input type="range"` normal (sin `writing-mode`) **encima del riel**: su pista es transparente y solo se ve el control (clase `deslizador-riel` en `index.css`, solo bajo 900 px). El dedo se mueve de lado.
- Para dejarle sitio a la barra, en celular el título del mapa usa todo el ancho y la leyenda y los botones del mapa (3D/2D, girar, recentrar) suben a `bottom-[86px]`; los botones quedan en columna a la derecha.

## Notas
- Sin dependencias nuevas. `pnpm lint` y `pnpm test` pasan; `pnpm build` también. E2E: `linea-tiempo.spec.ts` (nuevo), `tiempo-caso2.spec.ts`, `enlaces.spec.ts` y `leyenda.spec.ts` pasan.
- `linea-tiempo.spec.ts` comprueba a 390 × 844 que la barra es horizontal (más de 4 veces más ancha que alta), que 2001 queda a la izquierda, que el deslizador es horizontal y que tocar el medio da un año del medio. También que la barra no tapa la leyenda ni los botones, y que en escritorio sigue vertical.
- El documento pide «unos 56 px»: en Año a año queda en 64 px para que quepan los dos renglones sin bajar de 32 px los botones.
- Rehecha sobre `developer` después de que se mergeara #38: el interruptor Tendencia | Año a año va de lado a lado en celular y apilado en escritorio (como lo dejó #38). Se resolvieron los conflictos en `BarraTiempo.tsx` y `Leyenda.tsx` (de #39 se conserva la flecha, la ✕ y el recuerdo; de esta PR, solo la posición `bottom-[86px]`).

## Pendiente
- Que arrastrar con el dedo por la página sobre el mapa no cambie el año (criterio de la mejora 4): el deslizador solo responde dentro de su franja, pero no hay una prueba automática de gesto táctil. Falta probarlo en un celular real.
- En modo Tendencia la barra mide ~44 px y la leyenda y los botones del mapa siguen a `bottom-[86px]`: queda un hueco de ~40 px. Se ajusta en la mejora 3 (mapa limpio).
