# feat/saltar-contenido

## Añadido
- Enlace «Saltar al contenido» / «Skip to content»: primer elemento al tabular, oculto (`sr-only`) hasta que recibe el foco. Al activarlo, el foco pasa a `<main id="contenido" tabIndex={-1}>` y se salta la cabecera (logo, variable, perfil, idioma, tema…). Usa `preventDefault` y `.focus()`: no agrega `#contenido` a la URL, que la gente comparte.
- Prueba `pantallas.test.tsx` («saltar al contenido») y e2e `saltar-contenido.spec.ts` (se ve solo con foco, mueve el foco a `main`, la URL no cambia).

## Revisado y sin cambios (mejora 9)
- Mapa 2D: cada departamento ya es `role="button"` con `tabIndex={0}` y `Enter`/`Espacio` lo eligen (`Mapa2D.tsx`).
- Mapa 3D: el lienzo es `role="img"`, sin teclado; la alternativa es la lista de departamentos de la ficha (`SelectorZona`, cubierta por el e2e `selector-zona`). No se agregó navegación por teclado dentro del lienzo 3D.

## Notas
- Rama apilada sobre `refactor/textos-por-idioma` (#80): el texto nuevo va en `textos.ts` (es) y `en.ts` (en).
- `pnpm lint`, `pnpm build` y `pnpm test` (145 pasan); e2e `saltar-contenido`, `cabecera-oculta`, `recorrido`.
