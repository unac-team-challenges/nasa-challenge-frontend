# fix/tabla-metodologia

Hallazgo de la revisión de la mejora 7: en la metodología, la tabla de fuentes se cortaba por la derecha en celular.

## Cambiado
- **Celular (menos de 640 px): cada fuente es una tarjeta.** La tabla tiene cuatro columnas (variable, fuente, resolución, años) con un ancho mínimo de 544 px dentro de un `overflow-x-auto`: a 390 px se desplazaba de lado sin avisar y se veían cortados «≈ 10», «1 km» y «2001–2024». Ajustar el relleno no bastaba (la suma de los anchos mínimos pasa de 356 px, y a 320 px sobran ~90). Ahora la variable es el título y debajo van Fuente, Resolución y Años, cada uno con su rótulo (el encabezado de su columna, vía `data-etiqueta` y `::before`), a todo el ancho y sin deslizar.
- **Escritorio: no cambia**, sigue siendo la tabla de cuatro columnas.
- **Semántica de tabla conservada.** Al cambiar el `display` de las celdas, algunos navegadores dejan de anunciarlas como tabla; por eso los elementos llevan `role` explícito (`table`, `rowgroup`, `row`, `columnheader`, `rowheader`, `cell`). El encabezado se oculta solo de la vista en celular (`sr-only`), no del lector de pantalla.
- Los rótulos salen de `m.tablaCols` en cada idioma; no hay textos nuevos.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/metodologia-tabla.spec.ts` (nuevo): a 390 y 320 px ni la tabla ni la página se desplazan de lado y los datos llevan rótulo y son visibles; en escritorio sigue la tabla con sus cuatro encabezados. Los de celular fallan sin el cambio.

## Pendiente
- Revisar en un celular real y con un lector de pantalla que las tarjetas se anuncian como filas de una tabla.
