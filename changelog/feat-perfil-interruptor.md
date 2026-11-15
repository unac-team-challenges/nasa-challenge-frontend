# feat/perfil-interruptor

Mejora 7, punto 3 del documento de UX: el perfil deja de ser un `<select>`. Primera de dos PRs de la mejora 7 (la segunda: la cabecera se oculta al bajar). El resto de la 7 ya lo hizo #36 (nombre corto, metodología en menú, variable con íconos), y Lluvia/Temperatura se queda en la cabecera.

## Cambiado
- **Perfil como interruptor con íconos.** `Cabecera.tsx`: Agricultor (brote) y Estudiante (birrete) como dos botones `aria-pressed` dentro de un riel, igual que Lluvia/Temperatura, en vez de la lista que abre el sistema. Es un grupo con nombre «Perfil»; el `title` de cada botón lleva su descripción («Agricultor: Lluvia y años secos, en palabras de campo»).
- **En celular, solo el ícono** (menos de 480 px de ancho). Con texto, el segundo botón quedaba fuera de la tira que se desliza de lado. El nombre sigue para lectores de pantalla (`sr-only`) y en el `title`.
- Sin dependencias nuevas: los íconos son de `lucide-react`, que ya se usaba.

## Notas
- `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/cabecera-perfil.spec.ts` (nuevo): no queda ningún `<select>`; el perfil de la URL se marca; elegir otro cambia la URL; en celular los botones miden ≥ 36 px y se ven enteros a 390 px. `recorrido.spec.ts`, `enlaces.spec.ts` y `pantallas.test.tsx` leían `#perfil` (el select) y ahora leen el botón marcado; en `recorrido` el clic del perfil de la portada se acota a `main`, porque ahora también hay un botón «Agricultor» en la cabecera.

## Pendiente
- A 320 px de ancho el segundo botón queda parcialmente fuera y se llega deslizando la tira (ya pasaba con el `<select>`). Se arregla mejor con la cabecera de una sola fila de 7b.
- Verificar el toque en un celular real.
