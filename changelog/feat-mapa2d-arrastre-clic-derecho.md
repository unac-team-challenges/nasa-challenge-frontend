# feat/mapa2d-arrastre-clic-derecho

## Añadido
- **Mapa 2D: arrastrar con el clic derecho.** Con el ratón, mantener el botón derecho y mover desplaza
  el mapa libremente, también sin zoom (el ratón no tiene pellizco). Puede correrse hasta media caja
  más allá del borde (`HOLGURA_RATON`): se mueve con libertad sin perder el Perú de vista.
- El arrastre sigue aunque el puntero salga del mapa (`setPointerCapture`) y muestra la mano cerrada
  (`cursor: grabbing`).
- Dentro del mapa 2D el clic derecho no abre el menú del navegador.

## Sin cambios
- El clic izquierdo sigue eligiendo el departamento, y arrastrar con él no mueve el mapa.
- Los gestos táctiles (un dedo arrastra, dos pellizcan) siguen igual y sin salirse del borde.
- «Volver a la vista inicial» y elegir otra zona deshacen el desplazamiento, como con los dedos.
- El mapa 3D no cambia (su clic derecho sigue sin efecto, #96).

## Pruebas
- Nuevo e2e `mapa2d-raton.spec.ts`: arrastre con el botón derecho sin zoom, sin menú del navegador y
  sin elegir zona; tope de media caja; «Volver a la vista inicial»; el clic izquierdo elige Loreto.
- `mapa2d-gestos.spec.ts`: la prueba del ratón pasa a llamarse «con el botón izquierdo… no mueve el mapa».
