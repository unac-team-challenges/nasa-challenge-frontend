# feat/leyenda-compacta

«Cómo leer el mapa» más clara y más chica, y que no estorbe al elegir un departamento.

## Qué cambia
- **Empieza minimizada siempre** (celular y escritorio): una franja de una línea. Ya no recuerda la elección entre
  visitas (`localStorage` `leyenda-abierta` se deja de usar).
- **Un solo control**: la flecha va a la derecha, donde estaba la ✕, y la ✕ se quita. Cerrada apunta arriba (se abre
  hacia arriba); abierta, abajo.
- **Se minimiza sola al elegir un departamento**: el informe y la ficha del puntero necesitan el espacio (en 1024 px la
  leyenda abierta tapaba casi la mitad del mapa y chocaba con la ficha).
- **Jerarquía de letra**:
  - títulos de cada parte en negrita;
  - cifras (5 °C, 28 °C, máx. 0,77 °C, 0,07 NDVI) en una etiqueta propia, con números tabulares;
  - explicaciones en viñetas, más chicas y apagadas.
- **Partes**:
  - «Altura» con el máximo a la derecha (antes era una línea suelta: «Columna más alta…»);
  - «Qué tan seguro es» (pleno, rayado, contorno: la palabra en negrita y su significado debajo);
  - «Color» con la escala;
  - notas en viñetas.
- **El gráfico se adapta a lo que se ve**:
  - con mapa de color, las columnas van neutras, porque el color ya es el valor de la celda (antes salían con los
    colores de sube/baja y confundían);
  - rótulos según el perfil: el agricultor ve «más calor / llueve menos»; el estudiante, «pendiente > 0 / anomalía < 0»;
  - en «año a año», los rótulos largos van en dos líneas y ya no se pisan;
  - idioma (es/en) y tema (claro/oscuro) por tokens.
- **Más chica**: 300 px de ancho (antes 340) y alto máximo `min(52vh, 400px)` con desplazamiento interno; en celular,
  hoja de 70 % del mapa como mucho.
- **Modo Vegetación**: la misma estructura (escala del NDVI con sus cifras, notas y los 5 cuadros).

## Textos
- Nuevos: `legAltura`, `legColsEst`, `legMax`, `legSeguro`, `legCuadros`.
- `calorNota` y `legVegMallaNota` pasan a listas (una viñeta por idea).
- Se quitan `legMin`, `scaleTrend` y `scaleTime`.

## Pruebas
- `e2e/leyenda.spec.ts` reescrito:
  - empieza minimizada en celular y escritorio;
  - una sola flecha abre y cierra;
  - al recargar vuelve minimizada;
  - los rótulos dependen del perfil;
  - al elegir un departamento se minimiza.
- `e2e/mapa-limpio.spec.ts`: en escritorio se abre antes de medirla (≤ 300 px).
- `e2e/toque-44.spec.ts`: se quita la prueba de la ✕.
- `pnpm e2e` completo en local: 52 pasan. `pnpm test`: 137 pasan.
