# feat/interruptor-tendencia

## Añadido
- La máquina del tiempo tiene un interruptor de dos partes, **Tendencia | Año a año**, con el modo activo resaltado (`Button variant="toggle"` + `aria-pressed`, el mismo patrón de Lluvia/Temperatura). El rango completo y la explicación salen en el `title` de cada botón.
- En modo **Tendencia** solo se ve el interruptor y el rango (`2001–2024`): ya no hay deslizador, riel ni Play, y la barra se encoge en vez de ocupar toda la columna. Al elegir **Año a año** aparecen, empezando en el último año. Volver a Tendencia detiene el Play.
- El título del mapa dice el modo: «Lluvia anual · tendencia 2001–2024» o «Lluvia anual · solo 2021». El subtítulo explica qué se pinta («Cambio por década» / «Cada departamento frente a su propio promedio»).
- Una línea de ayuda la primera visita («Tendencia: cuánto cambió en 24 años. Año a año: cómo fue ese año frente a su promedio.»), con ✕. Se recuerda en `localStorage` (`ayuda-modo-tiempo`) dentro de un `try/catch`: en modo privado vuelve a salir. Componente nuevo `AyudaModo`.

## Cambiado
- `mapSub` ya no lleva los años (están en el título) y `timeBackTrend` se reemplaza por `timeTrendTitle`. Textos nuevos en español e inglés (`timeByYear`: «By year»).
- `e2e/tiempo-caso2.spec.ts`: comprueba que en Tendencia no hay deslizador ni Play, que Año a año los muestra y que el título cambia.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; `tiempo-caso2` y `enlaces` (e2e) también.
- Un enlace con `?anio=2010` abre directo en Año a año.
- A 390 px el título del mapa ocupa dos líneas. La mejora 3 lo pasa a una sola.

## Pendiente
- La barra sigue vertical en celular: se acuesta en la mejora 4.
