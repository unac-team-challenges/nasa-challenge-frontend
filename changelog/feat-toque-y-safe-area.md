# feat/toque-y-safe-area

Mejora 11, puntos 2 y 3 del documento de UX (áreas de toque y márgenes seguros). Primera de varias PRs de la 11.

## Añadido
- **Áreas de toque de 44 px sin agrandar el control.** La clase `.toque44` (`index.css`) pone, solo en celular (900 px o menos), un `::after` invisible que crece hasta los 44 px de la guía de Apple en el eje donde el control mide menos (`inset: min(0px, calc((100% - 44px) / 2))`); un control de 44 px o más no cambia. Se aplica a los cuatro controles que más se tocan y miden 32–36 px: **Tendencia** y **Año a año** (32 px), el resumen **«Cómo leer el mapa»** (32 px), el **✕ de la leyenda** (32 px) y **«Ocultar el informe»** (36 px). Ninguno cambia de tamaño en pantalla, así que el mapa 2D no pierde espacio (lo que se acaba de ganar en 8c).
- **Por qué no se agrandaron de verdad:** pasar a 44 px hacía crecer la barra del tiempo unos 12 px y le quitaba esa altura al mapa. Se eligió ampliar solo el área de toque.

## Cambiado
- **Grupo Tendencia | Año a año sin `overflow-hidden`.** El recorte habría cortado el borde invisible de sus botones. Las esquinas redondeadas pasan a los propios botones (a la izquierda y la derecha en celular, arriba y abajo en escritorio), con el mismo aspecto.

## Decidido no hacer
- **Márgenes seguros (`env(safe-area-inset-*)`).** Hoy `index.html` no usa `viewport-fit=cover`, y en ese modo iOS ya mantiene el contenido dentro de la muesca y de la barra de gestos. `env()` solo hace falta si la app pasa a pantalla completa. Hacerlo agrega trabajo y riesgo sin ganancia visible, y no se puede probar sin un iPhone real (Playwright no simula las muescas). Si el equipo quiere pantalla completa, se retoma.
- **Todos los controles a 44 px.** Los botones de la cabecera miden 36–40 px (superan el mínimo AA de WCAG 2.5.8, de 24 px) y los enlaces dentro de párrafos están exentos; la cabecera la rediseñó #36 y se tocó en #56.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/toque-44.spec.ts` (nuevo, 390 × 844, táctil): cada control recibe el toque a (44 − alto) / 2 − 1 px de su borde por arriba y por abajo, y no lo recibe 3 px más lejos; ninguno crece; un toque real en el borde invisible de Tendencia la activa; en escritorio no hay `::after`. Los tres de celular fallan sin el CSS.

## Pendiente
- Probar con el dedo en un celular real: un borde invisible de 6 px puede solaparse con el control vecino en barras apretadas; hoy no hay vecinos a menos de 6 px de los cinco controles tocados.
- Los demás controles de 36–40 px (cabecera, «Controles del mapa») quedan como están; si en la prueba real se fallan toques, se amplían igual.
