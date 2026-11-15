# feat/compartir

Mejora 11, punto 7 del documento de UX: un botón «Compartir». Tercera PR de la 11 (#60: áreas de toque; #62: lista de departamentos).

## Añadido
- **`BotonCompartir`** (`src/components/`), al final del grupo de controles del mapa: a la vista en escritorio y, en celular, en el menú «⋯» junto al giro y el recentrado. Aprovecha que la URL ya guarda zona, variable, perfil, año e idioma: lo que se comparte es la vista que se está viendo.
- **Cómo comparte.** Si el navegador tiene el menú de compartir (`navigator.share`, en celulares) lo abre con el título de la página y el enlace. Si no, copia el enlace al portapapeles: el ícono cambia a ✓ durante 2,2 s, el botón avisa «Enlace copiado» (`role="status"`, que anuncian los lectores de pantalla) y el aviso se va solo.
- **Casos del borde.** Cerrar el menú de compartir sin elegir (`AbortError`) no hace nada ni avisa. Si el menú falla de verdad, cae a copiar. Si tampoco hay permiso de portapapeles (p. ej. página sin https), se muestra el enlace en un `prompt` para copiarlo a mano.
- Textos en es/en: «Compartir esta vista», «Enlace copiado», «Copia el enlace para compartir esta vista:».

## Notas
- Sin dependencias nuevas (los íconos son de `lucide-react`). `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e completo en serie pasa.
- `e2e/compartir.spec.ts` (nuevo): sin `navigator.share` copia exactamente `page.url()` (con `/zona/08`, `variable`, `anio` y `perfil`) y el aviso se va solo; con `share` lo llama con el título y el enlace y no copia; cancelar no copia ni avisa; un fallo real copia; el aviso sigue el idioma; en celular el botón está en el menú «⋯». El comportamiento del menú de compartir se simula con un doble de `navigator.share`: Playwright no abre el del sistema.
- El botón lo monta `Explorador`, que lo dibuja dos veces (escritorio y menú «⋯»); en celular el de escritorio queda oculto, y los tests usan el visible.

## Pendiente
- Probar en un celular real el menú de compartir de iOS y Android (WhatsApp, etc.) y que la vista previa del enlace salga con `og.png`; eso depende de que el dominio tenga `og:image` con URL absoluta (anotado en el README).
- El enlace incluye parámetros de prueba si se abrió con ellos (p. ej. `?sinwebgl`); en uso normal no aparecen.
