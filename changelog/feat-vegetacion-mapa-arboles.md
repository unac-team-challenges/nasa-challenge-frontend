# feat/vegetacion-mapa-arboles

El mapa 3D de «Lugares medidos» (relieve por verdor y bosque) pasa a ser el mapa de **Vegetación**, y la
opción «Lugares medidos» se quita. Quedan los 3 mapas principales: Lluvia, Temperatura y Vegetación. Los
datos de Vegetación no cambian: el informe, la tendencia, la máquina del tiempo y la descarga son los mismos.

## Cambiado
- **Vegetación en 3D**: cada departamento sube según su verdor medio (NDVI de MODIS), la tapa muestra el
  NDVI por celda y crecen las plantas de cada zona (`escena/bosque.ts`). Etiquetas solo en los 3
  departamentos más verdes y los 3 menos verdes, con su NDVI medio. Es la vista que antes salía con
  «Lugares medidos».
- **Año a año**: con un año elegido, la tapa muestra el NDVI de ese año. Las alturas siguen siendo el
  verdor medio.
- **Leyenda de Vegetación en 3D**: la altura y la escala del NDVI de fondo (o del año elegido), sin los
  «5 cuadros».
- **Título del mapa**: «Vegetación (NDVI) · tendencia 2001–2024», con el subtítulo «Altura: verdor medio ·
  color: NDVI por celda (MODIS)».
- **Vegetación en 2D**: igual que en `developer` (el 2D no tiene bosque).
- **Portada**: igual que antes. La vista de verdor es del explorador.
- **Guía de uso**: el paso de las variables nombra las tres y ya no menciona «Lugares medidos».
- Al cambiar entre Vegetación y otra variable, los colores se funden desde el mapa de antes y no desde un
  paso intermedio (`fundir` no se repite en el mismo cuadro).

## Quitado
- Botón «Lugares medidos» de la cabecera y el parámetro `?capa=vegetacion`.
- Los 5 recuadros medidos (Olmos, Chavimochic, Ica, Iquitos y La Pampa) en el 3D y el 2D, con sus
  nombres, y el panel lateral que los listaba (`PanelVegetacion`).
- `features/mapa/utils/vegetacion.ts`, sus 2 pruebas y los textos y el CSS que ya nadie usaba.
- No cambian las fichas del Caso 2 ni de la selva (`features/ficha/data/caso2.ts` y `selva.ts`): siguen
  saliendo en el informe de esos departamentos.

## Enlaces viejos
- Un enlace con `?capa=vegetacion` abre la variable Vegetación (`validarBusqueda`).

## Pruebas
- Nueva: `busqueda.test.ts` (enlace viejo) y e2e `vegetacion.spec.ts` (3 botones, leyenda, barra de
  tiempo, informe y enlace viejo).
- `Guia.test.tsx`: en Vegetación con el 3D se salta la leyenda y la barra de tiempo ya no se salta.
- Se borran `PanelVegetacion.test.tsx`, `app/vegetacion.test.ts` y `mapa/utils/vegetacion.test.ts`
  (probaban los 5 recuadros).
- `pnpm lint`, `tsc -b`, `pnpm build`, `pnpm test` (182 pasan, 4 omitidas) y e2e completo en local
  (73 pasan, escritorio y celular).
