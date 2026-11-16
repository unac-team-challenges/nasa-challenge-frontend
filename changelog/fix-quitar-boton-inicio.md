# fix/quitar-boton-inicio

## Quitado
- Botón «Inicio» / «Home» de la cabecera, con su ícono de casita (`House` de lucide) y la rayita que lo
  separaba del idioma. Era redundante: el logo y el nombre del proyecto ya llevan al inicio, con las
  mismas opciones del mapa (variable, perfil e idioma, `aInicio`).
- Texto `inicioCorto` (es/en), que solo usaba ese botón.

## Cambiado
- El enlace del logo lleva `aria-current="page"` en la portada (antes lo tenía el botón), para que el
  lector de pantalla siga diciendo dónde estás. Su nombre accesible no cambia: «Detective del Perú: inicio».

## Notas
- La cabecera queda con el logo a la izquierda, las variables, los perfiles, el idioma y el tema. En
  celular, la fila de arriba queda con el logo, el idioma y el tema.
- `pnpm lint`, `tsc -b`, `pnpm test` (190 pasan, 4 omitidas) y e2e completo en local (71 pasan; `celular`
  falló una vez con el servidor de desarrollo cargado y pasó 3 de 3 al repetirlo).
