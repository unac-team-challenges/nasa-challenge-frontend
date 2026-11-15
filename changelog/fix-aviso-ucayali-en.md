# fix/aviso-ucayali-en

Va con el PR #64 del backend (aviso propio de Ucayali en la temperatura). Sin este cambio, la ficha de Ucayali en inglés mostraría ese aviso en español.

## Qué cambia
- `src/i18n/avisoZona.ts` (nuevo): `avisoZonaEn(motivo)` traduce el aviso de Ucayali leyendo los números del texto de la API (los dos últimos años, sus °C y la pendiente con y sin ellos), así que no hay cifras escritas aquí.
- `avisoFijo` recibe ahora también el `motivo` (el `stats.aviso` de la API) y suma esa traducción al aviso de lag1, como antes.
- `Ficha.tsx`: pasa `d.motivo` a `avisoFijo`.
- `src/i18n/aviso.test.ts`: el texto exacto del backend se traduce con sus números; con lag1 alto salen los dos avisos; si la redacción del backend cambia, no traduce y la ficha muestra el español (no se rompe).

## Notas
- Sin API, la copia local no trae el aviso de Ucayali (es una mejora del backend #64); se verá cuando la API conteste.
- Si cambia la redacción de `aviso_ucayali()` en el backend, hay que actualizar la expresión de `avisoZona.ts` y el texto del test.
