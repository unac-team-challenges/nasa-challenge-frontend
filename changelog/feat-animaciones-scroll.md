# feat/animaciones-scroll

Mejora 10 del documento de UX: las secciones entran con suavidad al desplazarse.

## Añadido
- **Entrada al desplazarse, solo con CSS.** `.aparece` y `.aparece-hijos > :not(:first-child)` reutilizan el `@keyframes entrada` que ya existía (opacidad y 10 px de subida) con `animation-timeline: view()` y `animation-range: entry 0% entry 40%`: el bloque aparece mientras sube por la pantalla y queda completo cuando entró el 40 % de su alto. Todo va dentro de `@supports (animation-timeline: view())`: donde el navegador no la tiene, el contenido se ve normal y sin errores.
- Se aplica a las cinco secciones de la metodología y a los bloques de la ficha bajo su título (el título no se anima: ya está a la vista).
- **Reducir movimiento.** Con `prefers-reduced-motion: reduce` las dos clases quedan sin animación, igual que `.entrada`.
- Solo `opacity` y `transform`; no hay JavaScript, y el mapa no se anima al desplazarse.

## Decidido no hacer
- **View Transitions al cambiar de departamento.** La ficha ya hace un fundido de 220 ms al cambiar de zona (Web Animations, con soporte de «reducir movimiento»). `document.startViewTransition` capturaría la página entera, incluido el mapa 3D en movimiento, en cada cambio, y bloquearía la interacción durante la transición; el costo es alto y la mejora visible sería casi nula.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan; el e2e `animaciones-scroll` (nuevo) pasa y falla sin el CSS.
- El e2e se salta solo en navegadores sin `animation-timeline`.
- Las animaciones guiadas por el desplazamiento no tienen duración fija: no aplica el tope de 400 ms.

## Pendiente
- Probar en Chrome Android y Safari iOS (el soporte de `animation-timeline` en Safari es reciente; si falta, el contenido aparece sin animar).
- Revisar caniuse.com antes de decidir si se amplía a más secciones.
