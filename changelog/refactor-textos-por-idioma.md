# refactor/textos-por-idioma

## Cambiado

- El español sale de `i18n/textos.ts` y va en `i18n/es.ts`, un chunk aparte (`es-*.js`: 38 KB, 13,5 KB gz). El inglés, que es el idioma por defecto, se queda en `textos.ts` y viaja siempre: la mayoría de las visitas (sin `?lang`) no espera ninguna petición extra antes del primer dibujo.
- Salen a `es.ts` las partes en español: `TEXTOS`, `FRASES`, `CAUSAS_TEXTOS`, `FAUNA_TEXTOS`, `FAUNA_CLIMA`, `META` y `METODOLOGIA`.
- `cargarIdioma(idioma)` baja el español y lo asigna a esos mapas. Siguen tipados como `Record<Idioma, T>` (`sinEs` agrega el `es` que llega después), así que los usos de `TEXTOS[idioma]` no cambian. Los tipos salen de `es.ts` con imports solo de tipos, que no meten ese archivo en el chunk principal.
- `REPOS` pasa a `i18n/repos.ts`: así `es.ts` no importa valores de `textos.ts` (que antes era un import circular).
- Cuándo se carga: `main.tsx` espera `cargarIdioma` con el idioma de la URL (`?lang=es`) antes de dibujar; el botón de idioma (`setIdioma`) cambia recién cuando el español ya está cargado. `testing/setup.ts` carga el español con `await` antes de reunir las pruebas.

## Arreglado (de las revisiones)

- Si el chunk del español no baja, `main.tsx` dibuja en inglés en vez de quedar en blanco, y `setIdioma` no deja un rechazo sin manejar.
- `setIdioma`: si se pide otro idioma antes de que llegue el anterior, gana el último pedido (antes la UI podía quedar en un idioma y la URL en otro).
- Los mapas ya no mienten en el tipo para el idioma por defecto: `en` siempre existe; solo `es` llega después.
- Comentario de `busqueda.ts` corregido: sin `?lang`, inglés.

## Notas

- Quien entra en inglés (la mayoría) no baja el español. Quien cambia a español espera una petición pequeña (13,5 KB gz) antes de ver el cambio; no hay indicador de carga porque es breve.
- Hay que tener en cuenta: leer `TEXTOS.es` (o cualquier mapa `.es`) antes de `cargarIdioma('es')` da `undefined`.
- Chunk principal de textos: 18,5 KB gz (antes del cambio llevaba ambos idiomas).
