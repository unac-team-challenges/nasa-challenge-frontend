# refactor/arquitectura

Reorganiza `src/` por features y capas compartidas, sin cambios de comportamiento. Base: `origin/developer` @ 68cdabc, luego merge con `origin/developer` @ a368bf3 (ver `docs/migracion-roturas.md`).

## Añadido
- Estructura `src/app` (App, router, rutas), `src/features/{mapa,ficha,tiempo,portada,metodologia}` y capas compartidas `components`, `hooks`, `utils`, `stores`, `api`, `data`, `i18n`, `testing`.
- Imports con alias `@/` en todo `src/`; `src/index.css` conserva su `@import` relativo.
- Guarda de arquitectura en `eslint.config.js` con `eslint-plugin-import-x` y `eslint-import-resolver-typescript` (devDependencies): prohíbe imports relativos (también `import()`), compartido → feature/app, feature → app y feature → otra feature. Las features nuevas quedan protegidas solas.
- `ARQUITECTURE.md`: estructura, reglas y cómo agregar una feature.
- `CLAUDE.md`: guía para Claude sobre la estructura y las reglas.
- `docs/migracion-roturas.md`: roturas, desvíos del plan y cómo se hizo el merge.

## Cambiado
- Archivos movidos con `git mv` (git los detecta como renombres): p. ej. `src/mapa/*` → `src/features/mapa/`, `src/components/{Ficha,BarraTiempo,Portada,Metodologia,…}` → `src/features/*/components/`, `src/store.ts` → `src/stores/app.ts`, `src/lib/{useZonas,meta,ruta}` → `src/hooks/`, `src/lib/{color,direccion,formato,webgl}` → `src/utils/`, `src/test` → `src/testing`.
- Merge con `origin/developer` (#21, #23, #24, #26): `Portada()` vuelve a ir sin props y el único `lazy(Mapa3D)` queda en `src/app/App.tsx` (se borró `src/app/rutas/Inicio.tsx`); `tarjeta.ts` (+test) pasó a `src/features/mapa/utils/` y `disposicion.ts` a `src/utils/`.
- `README.md`: rutas nuevas y enlace a `ARQUITECTURE.md`.
- Comentarios con rutas viejas actualizados.
