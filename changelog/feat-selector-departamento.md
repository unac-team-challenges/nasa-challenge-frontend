# feat/selector-departamento

Mejora 11, punto 6 del documento de UX: una lista de departamentos para llegar a uno sin apuntar en el mapa. Segunda PR de la 11 (la primera, #60: áreas de toque).

## Añadido
- **`SelectorZona`** (`features/ficha/components/`): un `<select>` nativo con los 25 departamentos en orden alfabético y una invitación deshabilitada («O elige uno de la lista» / «Or pick one from the list»). Es la lista del sistema: en celular es cómoda, con lector de pantalla es la forma más directa de llegar a una zona, y en escritorio, escribir las primeras letras ya sirve de buscador. No suma dependencias.
- **Dónde está.** En el informe sin zona elegida, bajo «Toca un departamento»; y con una zona elegida, en la cabecera de la ficha (a la derecha de «Departamento de la sierra»), para cambiar de zona sin volver al mapa. La zona actual aparece marcada.
- **Elegir equivale a tocar el mapa.** Llama a `seleccionar(id, true)`: la URL cambia a `/zona/NN`, el mapa se acerca y, si el informe estaba cerrado, se abre cuando termina la presentación del departamento. El idioma sale de `t.zonaLbl` / `t.zonaElegir` (es/en).

## Decidido no hacer
- **Un buscador con filtro propio** (combobox o `<datalist>`). Con 25 opciones la lista nativa ya se recorre rápido, y un combobox a medida habría que hacerlo accesible a mano. Si en la prueba con personas se pide escribir para filtrar, se cambia por uno.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/selector-zona.spec.ts` (nuevo): sin zona, la lista (26 opciones, ordenadas) lleva a Puno y la URL cambia; con zona, cambia de Cusco a Tumbes y marca la actual; sigue el idioma (`lang=en`); en celular mide ≥ 36 px y cabe en el ancho.
- En celular el texto «Departamento de la sierra» se parte en dos líneas junto a la lista; no se corta nada.

## Pendiente
- Con el informe minimizado en celular la lista no se ve hasta abrirlo («Toca una zona»); si se quiere más a mano, iría a un botón propio en el mapa.
- Probar con un lector de pantalla y con el selector del sistema de iOS y Android.
