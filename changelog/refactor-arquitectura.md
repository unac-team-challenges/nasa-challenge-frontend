# refactor/arquitectura

Reorganiza `src/` por features y capas compartidas, sin cambios de comportamiento. Base: `origin/developer` @ 68cdabc; falta rebase sobre las ramas de features abiertas (ver `docs/migracion-roturas.md`).

## Añadido
- Estructura `src/app` (App, router, rutas), `src/features/{mapa,ficha,tiempo,portada,metodologia}` y capas compartidas `components`, `hooks`, `utils`, `stores`, `api`, `data`, `i18n`, `testing`.
- Imports con alias `@/` en todo `src/`; `src/index.css` conserva su `@import` relativo.
- Guarda de arquitectura en `eslint.config.js` con `eslint-plugin-import-x` y `eslint-import-resolver-typescript` (devDependencies): prohíbe imports relativos (también `import()`), compartido → feature/app, feature → app y feature → otra feature. Las features nuevas quedan protegidas solas.
- `ARQUITECTURE.md`: estructura, reglas y cómo agregar una feature.
- `CLAUDE.md`: guía para Claude sobre la estructura y las reglas.
- `docs/migracion-roturas.md`: roturas, desvíos del plan y guía de rebase.

## Cambiado
- Archivos movidos con `git mv` (git los detecta como renombres): p. ej. `src/mapa/*` → `src/features/mapa/`, `src/components/{Ficha,BarraTiempo,Portada,Metodologia,…}` → `src/features/*/components/`, `src/store.ts` → `src/stores/app.ts`, `src/lib/{useZonas,meta,ruta}` → `src/hooks/`, `src/lib/{color,direccion,formato,webgl}` → `src/utils/`, `src/test` → `src/testing`.
- `Portada` recibe el mapa por la prop `mapa`; el `lazy(Mapa3D)` pasó a `src/app/rutas/Inicio.tsx`.
- `README.md`: rutas nuevas y enlace a `ARQUITECTURE.md`.
- Comentarios con rutas viejas actualizados.

## Pendiente
- Rebase sobre `feat/mapa-hover-relieve` (7 conflictos de imports; `Inicio.tsx` y `Portada({ mapa })` quedan obsoletos).
- Un comentario de `src/i18n/textos.ts` aún menciona `src/mapa/fauna.ts`.
