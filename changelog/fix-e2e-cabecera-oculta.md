# fix/e2e-cabecera-oculta

## Corregido
- `e2e/cabecera-oculta.spec.ts` fallaba a veces («con el foco dentro de la cabecera no se oculta»: esperaba la cabecera oculta y seguía visible, 117 px). `useOcultarAlBajar` empieza a escuchar el desplazamiento en un `useEffect`, después de dibujar; la prueba hacía `scrollTo(0, 700)` justo tras el `goto`, y si llegaba antes que el listener ese desplazamiento se perdía. La primera prueba pasaba porque medía la cabecera antes de bajar, y esa pausa alcanzaba.
- Nuevo `abrir(page, url)`: espera la cabecera visible y dos cuadros antes de bajar. Lo usan las tres pruebas del archivo.

## Notas
- No es un error de la app: una persona sigue desplazándose y el siguiente evento sí se procesa.
- Antes: 1 de cada 2 corridas fallaba en local (también sobre `developer` sin cambios), y es la falla que dejaba en rojo el Playwright de #80. Después: 30 de 30 (`--repeat-each=10`).
