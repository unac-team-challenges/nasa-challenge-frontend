# feat/descarga-estudiante

PR: base `developer`. Autor: Favio.

## Cambiado

- Ficha del estudiante, bloque «Llévatelo»: el botón único «Tabla de los 25 departamentos (CSV)» se reemplazó por un panel `EstDescargas` (`src/features/ficha/components/`).
  - **Una zona, por años:** «Desde» y «Hasta» (por defecto, todo el periodo). Si el inicio es mayor que el final avisa y bloquea las descargas. El mismo año en los dos extremos baja un solo año.
  - **Un año, los 25 departamentos:** el valor de ese año en cada departamento. La opción «Todo el periodo» baja la tabla de tendencias de siempre.
  - **Formatos:** CSV, gráfico PNG (solo en «Una zona») y ficha PDF.
- **CSV con la fuente arriba:** las primeras líneas, con `#`, dicen la fuente, el parámetro, la fecha de los datos y el enlace a la vista exacta (pandas: `comment='#'`; R: `comment.char = '#'`).
- **PNG del rango elegido:** `graficoSvg` (`utils/descarga.ts`) dibuja el gráfico de los años elegidos con título y fuente al pie, con los colores del tema activo.
- **PDF por la vía del navegador (sin librerías):** el botón abre el cuadro de impresión («Guardar como PDF») con el nombre de archivo ya puesto. Hoja de estilos `@media print` en `index.css`: solo se imprime el informe, siempre en tema claro, sin botones ni selectores, y con la fuente al pie.
- Textos en español e inglés (`descModoLbl`… `descCita`). Se quitó `csvTablaBtn`, que ya no se usa.

## Probado

- `pnpm test`, `pnpm lint` y `tsc -b` en verde. Pruebas nuevas: `descarga.test.ts` (funciones puras) y `EstDescargas.test.tsx` (el panel).
- En el navegador: descarga real del CSV por años, del CSV de un año y del PNG; PDF generado con Chromium en tema oscuro (sale en claro).

## Pendiente / a tener en cuenta

- El PDF lleva la ficha completa con todo el periodo: el rango de años no lo recorta.
- «Un año, los 25 departamentos» toma los valores de la copia local (`src/data`): la API solo entrega la serie de la zona elegida. Si la API cubriera años que la copia local no tiene, esas celdas salen vacías. Un endpoint `GET /api/zonas/anio/{anio}` lo resolvería; no se pidió todavía.
- La cita del CSV usa el nombre de la fuente de `useVista` (API o copia local).
