# fix/boton-idioma

## Corregido
- El botón de idioma ya no está "al revés": ahora es un interruptor de dos partes `ES | EN` (mismo patrón `Button variant="toggle"` + `aria-pressed` que Lluvia/Temperatura). La parte activa se ve resaltada, así que muestra el idioma actual y la otra opción a la vez.
- `lang` entra al esquema de búsqueda (`lib/busqueda.ts`) y `setIdioma` (ahora en `useBusqueda`) lo escribe en la URL: `?lang=en` para inglés, sin parámetro para español. Un enlace compartido en inglés se abre en inglés. Un valor inválido se ignora.
- El logo de la cabecera conserva `lang` al volver al inicio.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; `pnpm e2e` (recorrido y enlaces) también.
- `e2e/recorrido.spec.ts` usa el nuevo grupo en vez del botón único. `e2e/enlaces.spec.ts` suma una prueba del enlace en inglés y de que cambiar a español quita `lang` de la URL.
- Cada botón lleva su propio atributo `lang` (`es` / `en`) para lectores de pantalla.

- Por debajo de 360 px el interruptor se cambia por un solo botón con globo y el idioma **actual** (`🌐 ES`); al tocarlo pasa al otro. Antes, a 320 px `ES | EN` y el tema caían a una tercera fila (cabecera de 159 px); ahora queda en 2 filas (117 px), sin scroll horizontal. A 360 px o más se mantiene el interruptor de dos partes. Con ese ancho el hueco del botón compacto es justo (unos 8 px de margen); la cabecera compacta (mejora 7) lo reorganiza.
- El espacio entre elementos de la cabecera baja de 18 a 12 px por debajo de 360 px para que quepa.

## Orden de merge
- Esta rama sale de `developer` sin el `resetScroll: false` de #35, y las dos tocan `poner()` en `lib/busqueda.ts`. Mergear primero #35: sin ella, cambiar de idioma en celular sube la página al mapa. El conflicto del segundo merge es pequeño.

## Pendiente
- Nada propio. La cabecera en una sola fila y el menú "⋯" van en la mejora 7.
