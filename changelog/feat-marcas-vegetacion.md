# feat/marcas-vegetacion

Montado sobre `feat/olmos-y-selva` (#42). Decisión de Favio (15 nov): la vegetación no es una variable del mapa, porque solo hay datos de 5 recuadros y no de los 25 departamentos. Para que se encuentren, el mapa marca esos 5 lugares.

## Qué cambia
- **`src/features/mapa/utils/vegetacion.ts`:** los 5 lugares con vegetación medida, en un solo sitio del que leen el 3D, el 2D y la leyenda:
  - Olmos, Chavimochic e Ica (Caso 2);
  - Iquitos y La Pampa (selva).

  El punto es el centro del recuadro del backend. `corre` es un corrimiento en px para no tapar las etiquetas de Loreto y Cusco, como el que ya tiene Tumbes.
- **3D (`escena.ts`):** una etiqueta `lbl3d veg` (punto verde y nombre) sobre la cara de su departamento; sube y baja con la columna. Solo en el explorador, no en la portada ni en celular.
- **2D (`Mapa2D.tsx`):** las mismas marcas, en la capa de etiquetas; se deslizan con el zoom. No salen en celular.
- **Leyenda:** «Punto verde: vegetación medida con satélite (Chavimochic, Ica, Olmos, La Pampa e Iquitos). Toca su departamento para verla.»
- Las marcas no reciben clics (`pointer-events: none`): tocar encima abre la ficha del departamento de abajo, que es el de la marca.

## Pruebas
- `mapa/utils/vegetacion.test.ts`: cada marca cae dentro del polígono de su departamento.
- `app/vegetacion.test.ts`: cada marca tiene su ficha (Caso 2 o selva) y cada ficha su marca. Va en `app` porque cruza dos features.
- En el navegador (3D y 2D, tema oscuro y claro): ninguna marca choca con las etiquetas de departamento (comprobado con sus cajas); en la portada no se ven.
