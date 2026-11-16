# feat/saltar-contenido

## Añadido
- Enlace «Saltar al contenido» / «Skip to content»: primer elemento al tabular, oculto (`sr-only`) hasta que recibe el foco. Al activarlo, el foco pasa a `<main id="contenido" tabIndex={-1}>` y se salta la cabecera (logo, variable, perfil, idioma, tema…). Usa `preventDefault` y `.focus()`: no agrega `#contenido` a la URL, que la gente comparte.
- Prueba `pantallas.test.tsx` («saltar al contenido») y e2e `saltar-contenido.spec.ts`: se ve solo con el foco, queda fija arriba a la izquierda, mueve el foco a `main` y la URL no cambia; en inglés dice «Skip to content» y cabe en un celular de 360 px.

## Corregido en la revisión
- Al saltar, `<main>` ya no se dibuja con el borde de foco de 3 px alrededor de toda la página: la regla global `:focus-visible` de `index.css` no está en una capa y le ganaba a `outline-none`. Ahora `#contenido:focus-visible { outline: none }` va junto a esa regla.
- El enlace llevaba el borde global y además un `ring`: queda solo el borde global, igual que el resto de los controles.
- El e2e usa `e2e/apoyo/espanol` (la web abre en inglés y la guía de la primera visita taparía la página) y espera a que la app dibuje antes de pulsar `Tab`.

## Revisado y sin cambios (mejora 9)
- Mapa 2D: cada departamento ya es `role="button"` con `tabIndex={0}` y `Enter`/`Espacio` lo eligen (`Mapa2D.tsx`).
- Mapa 3D: el lienzo es `role="img"`, sin teclado. La alternativa es la lista de departamentos de la ficha (`SelectorZona`), que #82 dejó oculta a la vista y visible solo con el foco (e2e `selector-zona`). Tras «Saltar al contenido», esa lista se alcanza con `Tab`. No se agregó navegación por teclado dentro del lienzo 3D.

## Notas
- Rama apilada sobre `refactor/textos-por-idioma` (#80): el texto nuevo va en `textos.ts` (inglés, siempre cargado) y `es.ts` (español, en su propio chunk). Con `developer` integrado (#82, #89, #91, #92, #93).
- La guía de la primera visita (#91) deja `#root` inerte mientras está abierta: el enlace no se alcanza hasta cerrarla, como el resto de la página.
- `pnpm lint`, `tsc -b`, `pnpm build` y `pnpm test` (190 pasan, 4 omitidas); e2e completo en local (71 pasan, escritorio y celular).
