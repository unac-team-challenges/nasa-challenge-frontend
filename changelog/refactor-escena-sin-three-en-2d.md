# refactor/escena-sin-three-en-2d

## Cambiado
- `escenaActiva` pasa de `escena/escena.ts` a `escena/activa.ts` (importa `EscenaPeru` solo como tipo). `Explorador` ya no importa `escena.ts`, así que three.js deja de entrar en su chunk.
- Medido con `pnpm build`: el chunk `Mapa2D` (que arrastraba three) pasa de 664 KB (171 KB gz) a 20 KB (8 KB gz). three.js queda solo en `Mapa3D` (668 KB, 172 KB gz), que se baja únicamente cuando se dibuja el 3D.
- Efecto: el explorador en 2D o sin WebGL ya no descarga three.js.

## Notas
- Sin dependencias nuevas ni cambios de comportamiento. `pnpm lint`, `pnpm build` y `pnpm test` pasan.
