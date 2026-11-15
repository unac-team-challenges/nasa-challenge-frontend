# feat/leyenda-minimizable

## Añadido
- «Cómo leer el mapa» muestra que es plegable: un ícono «?» y una **flecha** que gira al abrir y cerrar. Antes no se veía ningún indicio: el `summary` tenía `display: flex`, que elimina el triángulo nativo del `<details>`.
- Una **✕** visible arriba a la derecha cuando está abierta (`Minimizar la leyenda`).
- Minimizada es una franja de una línea («? Cómo leer el mapa ▾») que casi no tapa el mapa.
- La elección se recuerda en `localStorage` (`leyenda-abierta`) dentro de un `try/catch`: en modo privado vuelve al valor por defecto. Mientras el usuario no elija, no se guarda nada y el valor por defecto sigue siendo el de antes (abierta en escritorio, cerrada en celular).

## Notas
- Se mantiene el `<details>` nativo: sigue siendo accesible con teclado y lector de pantalla.
- Textos nuevos: `legMin` en español e inglés.
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; `e2e/leyenda.spec.ts` (nuevo) pasa en 390 × 844.

## Pendiente
- En celular la leyenda abierta sigue flotando sobre el mapa. Pasa a ser una hoja desde abajo en la mejora 3.
