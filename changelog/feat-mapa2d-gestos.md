# feat/mapa2d-gestos

Segunda parte de la mejora 8 (mapa 2D en celular): pellizcar para acercar y arrastrar para mover.

## Añadido
- **Pellizcar y arrastrar** en el mapa 2D con el dedo. Antes el zoom solo ocurría al elegir una zona. Un dedo arrastra, dos dedos acercan o alejan; el punto del mapa que estaba bajo los dedos sigue bajo ellos. Zoom de 1× a 6×; el mapa no deja huecos en los bordes.
- `touch-action: none` solo dentro del mapa 2D interactivo, para que el navegador no robe los gestos.
- Un arrastre no elige una zona: el `click` que sigue a un gesto se descarta.
- Elegir otra zona deshace el zoom manual y vuelve al zoom automático a esa zona. El botón «Volver a la vista inicial» también lo deshace (contador `reinicio2d` en el store).
- Mientras los dedos mueven el mapa no hay animación (`.gestando`), para que lo siga al instante; las animaciones de elegir zona no cambian.

## Notas
- Solo con dedo (`pointerType: 'touch'`). Con ratón o lápiz no cambia nada.
- Como `touch-action: none` cubre el mapa, en celular no se puede desplazar la página arrastrando sobre el mapa: hay que hacerlo desde el informe de abajo. Es lo que pide el documento; conviene revisarlo con el diseño final de la mejora 3.
- Un `pointerup` o `pointercancel` de un puntero que no es un dedo del gesto no cambia ningún estado. Antes de esto, un render entre `pointerdown` y `click` reordenaba la zona y el navegador perdía el clic con ratón (lo detectó `enlaces.spec.ts`).
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e `recorrido`, `enlaces`, `tiempo-caso2` y `mapa2d-gestos` (nuevo) pasan.
- `mapa2d-gestos.spec.ts` (390 × 844) emite eventos de puntero táctil porque Playwright no trae pellizco. Comprueba: el pellizco acerca a 3× y no baja de 1×; el arrastre mueve 40 px, no se sale de los bordes y no elige zona; un toque simple sigue eligiendo; recentrar deshace el zoom; con ratón no hay gestos. Tres de los cuatro fallan sin el cambio; el cuarto es el control del ratón.

## Integración con `developer`
- #43 (8a), #46 (mapa de calor) y #47 (mapa limpio) ya están en `developer`. En `Mapa2D.tsx` los gestos conviven con la imagen del calor (`useCalor`), que va dentro del contenedor `.zoom2d` y por eso se acerca y se mueve con el mapa.
- En celular «Volver a la vista inicial» está detrás del botón «⋯» (#47): la prueba lo abre antes de pulsarlo.

## Pendiente
- Probar pellizco y arrastre con dedos reales en un celular.
- 8c: encuadre que respete los paneles, ahora que las demás PRs de celular están mezcladas.
