# feat/cabecera-oculta

Mejora 7, punto 4 del documento de UX: en celular la cabecera se oculta al bajar y vuelve al subir. Segunda de dos PRs de la mejora 7 (la primera, #56, pasó el perfil a interruptor con íconos).

## Añadido
- **La cabecera se esconde al bajar y vuelve al subir**, solo con la pantalla de 900 px o menos. Hoy es `sticky` y le resta unos 110 px de alto a la lectura del informe y de la metodología. Esconderla es un `transform: translateY(-100%)` con 200 ms de transición (no recalcula la página), y se quita la transición con «reducir movimiento».
- **Hook `useOcultarAlBajar`** (`src/hooks/`): un `scroll` pasivo, una lectura por cuadro (`requestAnimationFrame`). CSS puro (`animation-timeline: scroll()`) no distingue subir de bajar, y la alternativa del documento (`IntersectionObserver`) tampoco, por eso se usa el evento de desplazamiento. La decisión está en la función pura `ocultaDespues`, con test.
- **Reglas.** Cerca del tope (lo que mide la cabecera) siempre se ve. Un movimiento de menos de 8 px no cambia nada, y los movimientos chicos se acumulan, así que un dedo que tiembla no la hace parpadear. Con el foco dentro de la cabecera (teclado, lector de pantalla) no se oculta: `focus-within`. Si la ventana pasa de celular a escritorio (se gira, se redimensiona), se vuelve a mostrar.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/cabecera-oculta.spec.ts` (nuevo, 390 × 844): se oculta al bajar, vuelve con un poco de subida, no se oculta cerca del tope, no se oculta con el foco dentro, y en escritorio no se oculta. Los dos primeros fallan sin el cambio; el de escritorio es el control.
- En el explorador de celular el informe va debajo del mapa y la página sí se desplaza, así que también se oculta ahí. En escritorio el explorador no se desplaza, y la metodología no se oculta (el documento pide solo celular).

## Pendiente
- Verificar en un celular real: la sensación del umbral de 8 px y que la barra del navegador (que también se encoge al bajar) no se combine mal con esta.
- Hallazgo ajeno a esta PR: en la metodología, la tabla de fuentes se corta por la derecha en 390 px («≈ 10», «1 km»). Va como PR aparte.
- Con la cabecera escondida, el menú de metodología (en la cabecera) queda a un movimiento hacia arriba.
