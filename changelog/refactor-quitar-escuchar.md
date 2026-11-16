# refactor/quitar-escuchar

PR: base `developer`. Se quita el botón «Escuchar» (lectura en voz alta con Web Speech API) de la ficha del agricultor, a pedido de Favio.

- Fuera `Escuchar.tsx` y su prueba, el uso en `Ficha.tsx`, los 4 textos (es/en) y la prueba de integración en `pantallas.test.tsx`.
- Quedan las marcas `data-leer` en los componentes de la ficha: ya no las lee nadie (se pueden limpiar aparte).
