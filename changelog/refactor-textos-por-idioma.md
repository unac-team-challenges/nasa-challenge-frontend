# refactor/textos-por-idioma

## Cambiado
- El inglés sale de `i18n/textos.ts` y va en `i18n/en.ts`, un chunk aparte (`en-*.js`: 31 KB, 12 KB gz). El chunk de textos que viaja siempre baja de 73 KB (26 KB gz) a 33 KB (13 KB gz): solo queda el español.
- Salen a `en.ts` las seis partes en inglés: `TEXTOS`, `FRASES`, `CAUSAS_TEXTOS`, `FAUNA_TEXTOS`, `META` y `METODOLOGIA` (junto con su uso de `avisoZonaEn`).
- `cargarIdioma(idioma)` (en `textos.ts`) baja el inglés y lo asigna a esos mapas. Los mapas siguen tipados como `Record<Idioma, T>` (`sinEn` agrega el `en` que llega después), así que los ~50 usos de `TEXTOS[idioma]` no cambian.
- Cuándo se carga: `main.tsx` espera `cargarIdioma` con el idioma de la URL (`?lang=en`) antes de dibujar; el botón de idioma (`setIdioma` del store) cambia de idioma recién cuando el inglés ya está cargado. `testing/setup.ts` carga el inglés con `await` antes de reunir las pruebas (algunas leen `TEXTOS.en` al declarar el `describe`).

## Notas
- Rama apilada sobre `refactor/datos-locales-diferidos` (#79): los dos tocan `main.tsx` y `testing/setup.ts`.
- Quien entra en español nunca baja el inglés. Quien cambia a inglés espera una petición pequeña (12 KB gz) antes de ver el cambio; no hay indicador de carga porque es breve.
- Hay que tener en cuenta: leer `TEXTOS.en` (o cualquier mapa `.en`) antes de `cargarIdioma('en')` da `undefined`.
- `pnpm lint`, `pnpm build`, `pnpm test` (144 pasan) y e2e `recorrido`, `enlaces`, `selector-zona`, `cabecera-perfil` pasan.
