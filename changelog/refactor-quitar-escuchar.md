# refactor/quitar-escuchar

PR: base `developer`. Se quita el botón «Escuchar» (lectura en voz alta con Web Speech API) de la ficha del agricultor, a pedido de Favio.

- Fuera `Escuchar.tsx` y su prueba, el uso en `Ficha.tsx`, los 4 textos (es/en) y la prueba de integración en `pantallas.test.tsx`.
- Se quitaron las marcas `data-leer` (ya no las usa nada) y la mención a Escuchar en un comentario de `campo.ts`.
