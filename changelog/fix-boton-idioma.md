# fix/boton-idioma

## Corregido
- El idioma ya queda en la URL. `lang` entra al esquema de búsqueda (`lib/busqueda.ts`) y `setIdioma` (ahora en `useBusqueda`) escribe `?lang=en` para inglés y quita el parámetro para español. Antes `?lang=en` se leía al entrar pero nunca se escribía: un enlace compartido en inglés se abría en español. Un valor inválido se ignora.
- El logo de la cabecera conserva `lang` al volver al inicio.

## Notas
- Esta PR **no cambia cómo se ve** el botón de idioma. El interruptor `ES | EN` (que muestra el idioma actual) lo trae #36 (rediseño del navbar); aquí solo se conecta con la URL. `Cabecera.tsx` cambia en dos líneas.
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e `enlaces` y `recorrido` actualizados.

## Pendiente
- Si #36 se mergea antes, su `onClick` debe llamar a `setIdioma` de `useBusqueda` (no al del store) para que el cambio llegue a la URL. Si se mergea después, es un cambio de una línea.
- A 320 px, `ES | EN` junto al tema cae a una tercera fila en la cabecera actual (159 px de alto). Se midió con el interruptor de dos partes; conviene revisarlo en #36.
- Orden: mergear antes #35, o rebasar: las dos tocan `poner()` en `lib/busqueda.ts` (sin #35, cambiar de idioma en celular sube la página).
