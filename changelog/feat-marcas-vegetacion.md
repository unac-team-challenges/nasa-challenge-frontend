# feat/marcas-vegetacion

Montado sobre `feat/olmos-y-selva` (#42). Decisión de Favio (15 nov): la vegetación entra al mapa como un **modo «Vegetación»** (opción A). Reemplaza la primera versión de este PR, que solo marcaba los lugares con puntos.

## Por qué así
Solo hay datos de vegetación de **5 recuadros** (3 valles y 2 zonas de selva), no de los 25 departamentos. Por eso no es una variable más: el modo atenúa los departamentos y muestra los 5 recuadros reales con el color de su tendencia.

## Qué cambia
- **Botón «Vegetación»** en el mismo grupo que Lluvia y Temperatura (`Cabecera.tsx`).
  - Va en la URL como `?capa=vegetacion` (`lib/busqueda.ts`) y no cambia el tipo `Variable`: lluvia y temperatura siguen igual.
  - Al entrar se apaga la máquina del tiempo; desde la portada lleva al explorador. Lluvia o Temperatura sacan del modo.
- **Mapa 3D** (`escena.ts`, `setVegetacion`):
  - departamentos planos y atenuados;
  - los 5 recuadros a tamaño real (unos 25 km), con borde;
  - sin etiquetas de lluvia, sin partículas y sin la tarjeta del puntero;
  - el nombre de cada lugar va sobre su recuadro, con el punto del color de su tendencia.
- **Mapa 2D** (`Mapa2D.tsx`): lo mismo. La etiqueta accesible de cada departamento dice si tiene vegetación medida.
- **Colores** (`COLOR_TENDENCIA`):
  - verde: más vegetación (Chavimochic, Ica y Olmos);
  - ocre: menos árboles (La Pampa);
  - color del texto: sin cambio claro (Iquitos).
- **Leyenda** propia del modo: los 3 colores y «cada cuadro es el área medida, no el departamento».
- **Título del mapa** «Vegetación medida con satélite · MODIS, 2001–2024 · 5 lugares». Sin barra de tiempo.
- **Informe** (`app/rutas/PanelVegetacion.tsx`), en vez de la ficha de lluvia:
  - con un lugar elegido: su antes y después (Caso 2 o árboles de la selva, con su aviso) y la lista de los otros 4;
  - sin lugar: qué se midió y los 5 lugares para elegir;
  - en un departamento sin vegetación medida: lo dice y ofrece los 5 lugares.
  - `Ficha.tsx` no cambia.
- `vegetacion.ts`: cada lugar con su recuadro real (`caja`) y su `tendencia`; el centro se calcula del recuadro.

## Pruebas
- `app/vegetacion.test.ts`: cada recuadro tiene su ficha, y el color de cada recuadro dice lo mismo que su ficha (Caso 2: el NDVI sube; selva: el rango probable).
- `mapa/utils/vegetacion.test.ts`: cada recuadro cae dentro de su departamento.
- `app/rutas/PanelVegetacion.test.tsx` (4):
  - el botón entra al modo, lo escribe en la URL y quita la máquina del tiempo;
  - la lista de los 5 lugares;
  - elegir La Pampa abre los árboles de la selva, y Lluvia saca del modo;
  - Lima, sin vegetación medida.
- En el navegador:
  - 3D y 2D, tema oscuro y claro, español e inglés;
  - al volver a Lluvia reaparecen las etiquetas con valores y la barra de tiempo;
  - consola sin errores.
