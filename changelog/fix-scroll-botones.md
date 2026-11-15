# fix/scroll-botones

## Corregido
- Pista ("Ir a …"), Lluvia/Temperatura y Estudiante/Agricultor ya no llevan la página al mapa: las llamadas a `navigate` de `useBusqueda` pasan `resetScroll: false`.
- El informe ya no se destruye al cambiar de zona (se quitó `key={sel}` en `Explorador`). Cambia en su lugar con el fundido de 220 ms de `Ficha`.
- La presentación del departamento solo sale si la zona se eligió tocando el mapa (3D o 2D). Desde la Pista, un enlace o la URL, el cambio es directo. `seleccionar(zona, desdeMapa)` guarda esto en `zonaDesdeMapa` (store).
- Si el informe nuevo es más corto y el navegador baja la página, la vista va al principio del informe, nunca al mapa.
- El gráfico conserva los datos anteriores de la misma zona mientras llegan los de otra variable (`placeholderData` en `['detalle', variable, id]`), en vez de volver al esqueleto.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan.
- Comprobado a mano con Playwright en 390 × 844: la Pista y el cambio de variable no mueven `window.scrollY`, y tocar el mapa sí muestra la presentación. Ese chequeo no se incluye como prueba; va con el proyecto de celular de la mejora 11.
- Al cambiar de variable, durante unos instantes se ve el gráfico de la variable anterior (con su escala) hasta que llega el nuevo.

## Pendiente
- Prueba e2e de celular que fije `scrollY` tras la Pista (mejora 11).
