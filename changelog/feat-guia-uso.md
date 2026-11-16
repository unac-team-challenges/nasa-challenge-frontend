# feat/guia-uso

Guía de uso (fix 4): un tour de 10 pasos para quien entra por primera vez y no sabe de tecnología. Oscurece la pantalla, resalta una parte real y la explica en palabras simples: primero qué está viendo, después qué puede tocar.

## Pasos

1. Qué es el mapa (tarjeta al centro).
2. El mapa: cada departamento sube si llueve más y se hunde si llueve menos.
3. La leyenda: lleno = cambio real, punteado = puede ser casualidad, borde = faltan datos.
4. Las variables (cabecera).
5. El perfil Agricultor / Estudiante (cabecera).
6. La barra de tiempo: Tendencia o Por año.
7. Tocar un departamento: el tour abre Piura de ejemplo (o deja el que ya estaba elegido).
8. El informe.
9. Los controles del mapa, con el botón «?» que repite la guía.
10. La metodología.

## Cambiado

- `src/features/guia/` (nuevo): `pasos.ts` (pasos y textos ES/EN), `estado.ts` (store y clave `guia-vista`), `components/Guia.tsx` y su test.
- `Explorador.tsx`: monta la guía, agrega el botón «?» a los controles del mapa (en celular va en el menú «⋯») y los `data-guia` del mapa, el informe y los controles. `AyudaModo` no sale mientras la guía está abierta.
- `Leyenda.tsx` y `MenuMetodologia.tsx`: solo el atributo `data-guia`.
- `e2e/apoyo/espanol.ts` y `src/testing/render.tsx`: dan la guía por vista, para que no tape las pruebas que ya existían. `e2e/guia.spec.ts` la prueba aparte.

## Notas

- **Arranque:** solo en la primera visita al explorador. Al arrancar marca también `ayuda-modo-tiempo`, porque el paso 6 dice lo mismo que esa pista.
- **Textos:** van en `pasos.ts` y no en `i18n/textos.ts`, para no chocar con #80 (que parte ese archivo) ni con #82, #86 y #89. Se pueden mover cuando entre #80.
- **Anclas de la cabecera y la barra de tiempo:** se usan `data-guia="variables" | "perfil" | "tiempo"` si existen (PR de Josué), y si no, el `aria-label` de esos grupos. No se tocan `Cabecera.tsx` ni `BarraTiempo.tsx`.
- **Pasos sin ancla:** si el ancla no está en pantalla, el paso se salta. Por ejemplo, en vegetación no hay barra de tiempo.
- **Accesibilidad:** `role="dialog"` con `aria-modal`. Esc cierra y ← → cambian de paso. Con `prefers-reduced-motion` no hay transiciones.
- **Dependencias:** ninguna nueva.
