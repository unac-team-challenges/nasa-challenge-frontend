# fix/quitar-selector-departamento

La lista desplegable de departamentos (la flecha) ya no se ve en la ficha: cambiar de zona se hace tocando el mapa. La lista sigue ahí para teclado y lector de pantalla, oculta hasta que recibe el foco.

## Cambiado
- **`SelectorZona`** (`features/ficha/components/`): oculto a la vista (`sr-only`) y visible solo con el foco (`focus-within:not-sr-only`), como «Saltar al contenido». Sigue en los mismos dos lugares: a la derecha de «Departamento de la …» con zona elegida, y bajo «Toca un departamento» sin zona.
- `e2e/selector-zona.spec.ts`: además de elegir con la lista, prueba que sin foco no se ve (1 px) y que con foco aparece y cabe en celular.

## Por qué no se quitó del todo
- En la vista 3D (la de siempre) el mapa es un lienzo `role="img"` sin teclado, y `Mapa2D` (con un botón por departamento) solo se monta en 2D. Sin la lista, quien navega con teclado o lector de pantalla no tenía cómo elegir un departamento. `feat/saltar-contenido` (#86) también cuenta con esta lista como la vía de teclado del 3D.

## Notas
- Reemplaza lo añadido en `feat/selector-departamento` (su changelog se queda como historia).
- Los textos `zonaLbl` / `zonaElegir` (es/en) se quedan: los lee el lector de pantalla.
