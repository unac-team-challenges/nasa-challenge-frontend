# feat/mapa2d-toque

Primera parte de la mejora 8 (mapa 2D en celular). Pellizcar/arrastrar y el encuadre van en PRs aparte.

## Añadido
- **Zonas pequeñas fáciles de tocar.** En celular (mapa de menos de 600 px), toda zona cuyo lado menor mida menos de 44 px en pantalla recibe un borde invisible (`pointer-events: stroke`, transparente) que crece su área de toque hasta ~44 px, con un máximo de 40 px de trazo. Callao (~11 km, a veces 3 px) se puede tocar; también Tumbes, Lambayeque, Tacna y Moquegua cuando el mapa es chico. El cálculo usa el zoom actual, así que cuando el mapa se acerca el borde desaparece solo. El teclado y los lectores de pantalla siguen usando el trazo original.

## Cambiado
- **Sin ficha flotante con el dedo.** El «pasar por encima» (resaltado y ficha técnica que sigue al puntero) ahora solo responde a ratón y lápiz. Con el dedo la ficha salía sobre el mapa y desaparecía al soltar. El resumen ya está en el informe, que se abre al tocar la zona. Esto reemplaza la franja inferior que proponía el documento: en celular el informe ya es esa franja.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e `recorrido`, `enlaces` y `mapa2d-toque` (nuevo) pasan.
- `mapa2d-toque.spec.ts` (390 × 844, táctil): tocar 8 px mar adentro de Callao lo selecciona, y los eventos de puntero táctil no muestran la ficha flotante mientras los de ratón sí. Los dos tests fallan sin el cambio y pasan con él.

## Pendiente
- La ficha flotante del **3D** (`ficha3d` desde `escena.ts`) no se tocó: esta PR es solo del mapa 2D.
- 8b: pellizcar y arrastrar. 8c: encuadre que respete los paneles, cuando se mergeen las PRs de celular.
- El criterio «tocar cualquier departamento a 390 px sin acercar» está probado con Callao; falta probar con el dedo en un celular real.
