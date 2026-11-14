# feat/mapa2d-mar-limites

PR: base `developer`. Autor: Favio.

## Resumen

El mapa 2D se veía vacío al lado del 3D: solo los departamentos sobre un fondo liso. Ahora usa **el mismo suelo real que el 3D** del #12 y suma detalles de atlas.

## Cambios

- **Suelo real** (`src/mapa/suelo2d.ts`, nuevo):
  - mar con profundidad, aguas someras y espuma en la costa;
  - relieve, ríos y lagos, y fronteras de los países vecinos;
  - sombra suave del Perú.

  Usa las mismas texturas (`public/mapa/mundo*.png`) y las mismas mezclas de color que el shader del 3D, pintadas una vez en un `<canvas>` detrás del SVG. Los pesos de cada píxel se calculan una sola vez, así que al cambiar de tema solo se mezclan colores, sin codificar imágenes.
- **Límites:**
  - la frontera del Perú lleva un trazo más marcado;
  - los límites entre departamentos son más finos;
  - el departamento bajo el puntero se resalta;
  - la zona elegida se dibuja encima, para que su borde no quede tapado;
  - el rayado de "posible casualidad" es más fino.
- **Etiquetas con el estilo del 3D:**
  - las 6 zonas clave con su valor, más la zona elegida;
  - los nombres de los países vecinos y "Océano Pacífico".

  En celular solo aparece la zona elegida, y el océano se oculta si no hay mar a la vista.
- **Retícula** cada 5°, muy tenue.
- **Tema claro:** `--sea` pasa de gris (`#c7d1d4`) a azul suave (`#a9c3d3`) para que el mar no se confunda con la tierra. Esto también mejora el 3D en claro.

## Medido

En el navegador integrado, con el panel oculto (peor caso), pintar el suelo al cambiar de tema tardaba 1,25 s en la primera versión (se codificaba un JPEG) y ahora tarda unos 190 ms.
