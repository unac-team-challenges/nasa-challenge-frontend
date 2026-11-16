# feat/cabecera-celular

## Cambiado
- **Cabecera de celular en 1 fila (≤ 900 px).** Antes eran 2 filas y la tira deslizable cortaba el perfil al borde de la pantalla (se veía «Farme…»). Ahora la fila lleva la marca, el selector de variable y el menú ☰. El escritorio (≥ 901 px) no cambia.
- **Selector de variable.** Es un botón con la variable actual (ícono, nombre y ▾) que abre una lista: Lluvia, Temperatura y Vegetación, y después de un separador, Lugares medidos. Usa `DropdownMenu.RadioGroup` de Radix. Bajo 420 px muestra «Lugares» / «Places» en lugar del nombre largo.
- **Menú ☰.** Abre una hoja desde abajo (`Dialog` de Radix) con el perfil y su descripción, el idioma, el tema e Inicio. Respeta el área segura del iPhone y el movimiento reducido.

## Agregado
- `src/components/CabeceraCelular.tsx` (`SelectorVariable` y `MenuCelular`).
- `src/components/opcionesCabecera.ts`: íconos, idiomas y `aInicio`, que comparten las dos cabeceras. Van en un archivo aparte por la regla de fast refresh.
- Textos `menu`, `cerrarMenu`, `idiomaLbl`, `temaLbl` y `vegetacionCorto` (es/en).

## Guía
- En celular, `data-guia="variables"` está en el selector de variable y `data-guia="perfil"` en el botón ☰. Como la guía usa el primer elemento visible, en escritorio sigue señalando los rieles de siempre.

## Pruebas
- e2e: `cabecera-perfil` (celular) ahora comprueba la fila única, el selector de variable y el perfil dentro del menú, todo con 44 px. `celular`, `guia` y `cabecera-oculta` abren o enfocan el ☰.

## Notas
- Si se toca el selector justo cuando se está cerrando la hoja (unos 150 ms), el primer toque cae sobre el fondo oscuro y no abre el selector. A ritmo normal no pasa.
