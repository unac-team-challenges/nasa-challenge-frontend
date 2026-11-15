# feat/mapa-limpio-celular

Mejora 3 de `mejoras-ux-detective.md`: en celular el mapa queda libre y los controles van en los bordes. Medido a 390 × 844 con todo cerrado: los paneles tapan el **14 %** del mapa (antes de esta PR, 29 % con la tarjeta de ayuda de la primera visita; meta del documento: menos de 25 %).

## Cambiado (solo celular, < 900 px)
- **Título en una píldora de una línea.** «Lluvia anual · tendencia 2001–2024» en `text-sm`. El subtítulo («Cambio por década» / «Cada departamento frente a su propio promedio») pasa a la leyenda. En escritorio no cambia nada.
- **Leyenda abierta = hoja desde abajo.** Pegada al borde inferior del mapa, ancho completo, hasta el 70 % de alto con scroll. Tocar el mapa la cierra (además de la ✕ y la flecha de #39). Cerrada sigue siendo el chip de una línea.
- **Controles del mapa detrás de «⋯».** 3D/2D, girar y recentrar van en un `Popover` de `radix-ui` (ya instalado; cierra con Escape o tocando fuera). En escritorio siguen a la vista. Los tres controles están definidos una sola vez (`controles` en `Explorador.tsx`).
- **La tarjeta de ayuda de la primera visita** (de #38) ya no sale sobre el mapa en celular: su texto está en la hoja de la leyenda. En escritorio sigue igual, con su ✕.
- **3D: menos etiquetas.** En celular quedan 4 de referencia (Lima, Puno, Loreto, Cusco) más la zona elegida, que siempre tiene la suya. Tumbes y Piura, que quedaban bajo los paneles, ya no tienen etiqueta fija en celular.
- **Alto del mapa con `svh`** (`60svh` en vez de `60vh`): en celular `vh` no descuenta la barra del navegador y el mapa quedaba cortado o saltaba al desplazarse.

## Textos
- `mapaControles` en español e inglés.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; toda la suite e2e (21) pasa.
- `e2e/mapa-limpio.spec.ts` (nuevo, 390 × 844): título de una línea, leyenda como hoja y que tocar el mapa la cierra, 4 etiquetas en el 3D, cobertura de paneles < 25 %, menú «⋯» (y escritorio sin él) y la ayuda fuera del mapa. Seis de las siete fallan sin el cambio; la séptima es el control de escritorio.
- El diff de `Leyenda.tsx` parece grande porque el componente ahora devuelve un fragmento (hoja + fondo táctil) y cambió la sangría. Con `git diff -w` son ~40 líneas.

## Integración con #41, #46 y #36 (`developer`)
- #41 (línea de tiempo acostada) ya está en `developer`: el botón «⋯» y el chip de la leyenda van sobre la barra. Sobre la barra de **Tendencia** (~44 px) quedan a `bottom-[66px]` y sobre la de **Año a año** (64 px) a `bottom-[86px]`: se cierra el hueco de ~40 px que dejaba #41. Los botones en columna de #41 desaparecen: están dentro de «⋯».
- La prueba de #41 «no tapa la leyenda ni los botones del mapa» mide ahora el botón «⋯» en lugar de «Volver a la vista inicial».
- #46 (mapa de calor): la hoja de la leyenda conserva la rampa de °C y su nota de resolución.

## Pendiente
- «Ninguna etiqueta de departamento queda cortada por un panel» del documento: se cumple para el 3D (Tumbes y Piura ya no tienen etiqueta fija) pero no hay una prueba automática. Falta revisarlo en un celular real.
- Un menú «⋯» esconde el 3D/2D: quien busque cambiar de vista tiene que abrirlo. Si en las pruebas con usuarios se pierde, se puede dejar 3D/2D a la vista y esconder solo girar y recentrar.
