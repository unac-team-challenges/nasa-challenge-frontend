# refactor/texturas-webp

## Cambiado
- `public/mapa/mundo.png` y `mundo2.png` pasan a `mundo.webp` y `mundo2.webp`, **WebP sin pérdida**: 1.406 KB → 966 KB (−31 %). Los píxeles son idénticos (diferencia máxima 0 en los tres canales).
- `escena.ts` (3D), `suelo2d.ts` (2D) y `scripts/generar_mundo.py` apuntan a los `.webp`; el script ahora guarda con `lossless=True`.

## Notas
- Sin pérdida a propósito: los canales RGB son datos (relieve, máscara de tierra, ríos, fronteras), no color. Con WebP con pérdida (calidad 80) bajaban a 114 KB, pero el error máximo por canal pasaba de 125 y se deformaría el relieve y las fronteras.
- AVIF no se usó: el WebP sin pérdida cubre lo mismo sin dependencia nueva y todos los navegadores actuales lo leen.
- `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e `recorrido` y `mapa2d-toque` pasan (3D y 2D cargan las texturas).
