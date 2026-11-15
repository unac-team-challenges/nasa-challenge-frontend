# Migración de arquitectura: roturas y cambios grandes

Todo lo que se rompió, se desvió del plan (`docs/superpowers/plans/2026-11-14-migracion-arquitectura.md`) o cambió más de lo esperado. Cada entrada: qué pasó, archivos, resolución o pendiente, a quién avisar.

## Entorno y línea base (14 nov, `origin/developer` @ 68cdabc)

- **pnpm no estaba en el PATH.** Se instaló con `corepack enable --install-directory ~/.local/bin pnpm`; hay que usar `export PATH=$HOME/.local/bin:$PATH`.
- **Test intermitente:** `src/components/pantallas.test.tsx` («/zona/20?perfil=agricultor abre la ficha de Piura…») falló una vez en la corrida completa (`pnpm test`, carga alta) y pasa solo y en la segunda corrida completa. Ya fallaba antes de tocar nada. Pendiente: subir el timeout de `findByRole` o revisar por qué tarda.
- **e2e lento e intermitente:** `e2e/recorrido.spec.ts` («recorrido completo») falló en la primera corrida completa (suite de 2.7 min) y pasó sola (58 s). Es lento por el 3D en software (sin GPU). Ya ocurría antes de la migración.
- Línea base de la migración: `pnpm test` → 34 pasan, 3 omitidos; `pnpm build` ok; `pnpm lint` ok.

## Durante la migración

- **Tareas 4 y 5 en un solo commit** (`refactor: features y app`), como permite el plan: la Tarea 4 sola deja `tsc` roto hasta que exista `app/rutas/Inicio.tsx`.
- **Prettier no está al día en el repo** (ya antes de migrar, en `origin/developer`, no pasan `prettier --check`: `src/mapa/fauna.ts`, `src/mapa/escena.ts`, `src/i18n/textos.ts`, `src/api/schema.d.ts`, `src/data/departamentos.json`, `src/data/power.json` y `tsconfig.json`; `Ficha.tsx` y `Explorador.tsx` sí pasaban; `pnpm lint` no lo exige). Al mover, solo se envolvieron las líneas de import que pasaron de 100 columnas (router, Explorador, Ficha); `fauna.ts` y `escena.ts` se dejaron tal cual para no meter ruido (prettier reescribía 280 líneas de `fauna.ts`). Pendiente: un commit aparte de `pnpm format` si el equipo quiere. Avisar al equipo antes de formatear todo.
- **`Portada` ya no importa `Mapa3D`:** recibe `mapa: ReactNode`; el `lazy` + `Suspense` + `MapaSkeleton` viven ahora en `src/app/rutas/Inicio.tsx`. Mismo comportamiento.
- **Un CSS sigue con ruta relativa:** `src/index.css` hace `@import './shadcn.css'`. El alias `@/` y la regla de lint solo cubren TypeScript; el CSS resuelve bien y el build pasa. Se deja.
- **Reglas de lint más estrictas que el plan:** el plan decía que `no-restricted-imports` bastaba para los relativos. El review de la Tarea 6 encontró que no detectaba `from '.'`, `from '..'` ni `import('../x')`; se agregaron `'.'`/`'..'` al patrón y una regla `no-restricted-syntax` para `import()` dinámico (commit `chore: eslint cierra huecos de imports relativos`). También se cambió el mensaje a español neutro («Usa el alias @/…») y se formateó solo `eslint.config.js` con prettier.
- **Dependencias nuevas (decisión del usuario, 14 nov):** `eslint-plugin-import-x` 4.18.1 y `eslint-import-resolver-typescript` 4.4.5 (devDependencies). `ARQUITECTURE.md` §5 decía «sin plugin nuevo»; se corrigió.
- **`eslint.config.js` no depende del cwd:** usa `import.meta.dirname` para leer `src/features` y para el `tsconfig.app.json` del resolver, y pasa `basePath: import.meta.dirname` a `import-x/no-restricted-paths` (opción soportada por import-x 4.18.1; sin ella las zonas se resolvían contra `process.cwd()`). `pnpm lint` desde la raíz y `eslint` lanzado desde `src/` siguen marcando las violaciones.
- **`import-x` no marca alias que no resuelven** (no se activó `no-unresolved`); `tsc -b` ya lo atrapa.
- **Intermitentes:** en las verificaciones de las Tareas 2-6 no se repitió el fallo de `pantallas.test.tsx` ni el de `recorrido.spec.ts`; siguen siendo intermitentes preexistentes (ver arriba).
- Nada más se rompió en las Tareas 2-6: sin desviaciones en el movimiento de archivos ni en la reescritura de imports (0 imports relativos tras la Tarea 2, 0 referencias a rutas viejas en `src/` tras las Tareas 3-5 y la ronda de arreglos finales, salvo un comentario de `src/i18n/textos.ts` (línea ~386, `src/mapa/fauna.ts`) que se corrige después del rebase porque `feat/mapa-hover-relieve` edita ese archivo).

## Resumen para quien haga el rebase

**Base usada:** `origin/developer` @ `68cdabc`. El destino real del rebase es la rama local `feat/mapa-hover-relieve` @ `7f081f4` (contiene `origin/developer` 68cdabc; el merge-base con esta rama es 68cdabc). No es `1e778bc`. Las ramas que editaron rutas viejas después de 68cdabc chocarán en los archivos movidos.

**Archivos movidos (viejo → nuevo).** Git los detecta como renombres (similitud 76-100 %):

| Viejo | Nuevo |
|---|---|
| `src/App.tsx` | `src/app/App.tsx` |
| `src/router.tsx` | `src/app/router.tsx` |
| `src/components/Explorador.tsx` | `src/app/rutas/Explorador.tsx` |
| (nuevo; antes dentro de `Portada`) | `src/app/rutas/Inicio.tsx` |
| `src/components/Portada.tsx` | `src/features/portada/components/Portada.tsx` |
| `src/components/Metodologia.tsx` | `src/features/metodologia/components/Metodologia.tsx` |
| `src/components/BarraTiempo.tsx` | `src/features/tiempo/components/BarraTiempo.tsx` |
| `src/components/Ficha.tsx`, `GraficoSerie.tsx`, `AntesDespues.tsx` | `src/features/ficha/components/` |
| `src/data/caso2.ts` | `src/features/ficha/data/caso2.ts` |
| `src/components/Leyenda.tsx` | `src/features/mapa/components/Leyenda.tsx` |
| `src/mapa/Mapa2D.tsx`, `Mapa3D.tsx` | `src/features/mapa/components/` |
| `src/mapa/escena.ts`, `fauna.ts` | `src/features/mapa/escena/` |
| `src/mapa/suelo2d.ts` | `src/features/mapa/utils/suelo2d.ts` |
| `src/lib/meta.ts`, `ruta.ts`, `useZonas.ts`, `useZonas.test.ts` | `src/hooks/` |
| `src/lib/color.ts`, `direccion.ts`, `formato.ts`, `webgl.ts` | `src/utils/` |
| `src/store.ts` | `src/stores/app.ts` |
| `src/test/render.tsx`, `setup.ts` | `src/testing/` (y `vite.config.ts` `setupFiles` apunta ahí) |

Además, todos los imports relativos pasaron a `@/`.

**Conflictos reales** (`git merge-tree --write-tree --name-only --messages feat/mapa-hover-relieve HEAD`, solo lectura): 7 archivos con conflicto de contenido, todos en el bloque de imports (un hunk cada uno): `src/app/App.tsx`, `src/app/rutas/Explorador.tsx`, `src/components/Esperas.tsx`, `src/features/mapa/components/Mapa2D.tsx`, `src/features/mapa/components/Mapa3D.tsx`, `src/features/mapa/escena/escena.ts`; y `src/features/portada/components/Portada.tsx` con dos hunks. Se combinan solos en la ruta nueva: `fauna.ts`, `textos.ts`, `stores/app.ts`. Los 27 renombres se detectan (similitud 76-100 %). `store.ts` y `useZonas.ts` no chocan.

**Ruta recomendada.** Rebasar commit por commit rehace los mismos 7 conflictos hasta 3 veces, porque `76a6329`, `69a158d` y `1feceea` reescriben los mismos bloques de imports. Mejor:

1. Un solo `git merge feat/mapa-hover-relieve` en una rama nueva creada desde esta (o rebasar una copia aplastada, `git merge --squash`, de esta rama): los 7 conflictos se resuelven una sola vez.
2. Alternativa: partir de `feat/mapa-hover-relieve` y volver a correr sobre ella las dos herramientas desechables del plan: `alias.mjs` (imports relativos a `@/`) y `mover.mjs` (`git mv` + reescritura de `@/…`). Su código está en los bloques del plan `docs/superpowers/plans/2026-11-14-migracion-arquitectura.md`, líneas ~40-61. Luego aplicar los cambios de `eslint.config.js`, `ARQUITECTURE.md`, `CLAUDE.md`, `changelog/` y este documento.

**`Inicio` y `Portada({ mapa })` quedan obsoletos sobre feat.** El commit `f10e3be` de feat deja UN solo mapa 3D de fondo: `App.tsx` renderiza `lazy(Mapa3D)` con `modo={ruta}` y su `Portada()` no recibe props. Si alguien conserva el lado de esta rama en `Portada`, el inicio monta DOS escenas WebGL y ni `tsc` ni lint lo detectan. Pasos sobre feat:

- Borrar `src/app/rutas/Inicio.tsx`.
- En `src/app/router.tsx`, volver a apuntar la ruta `/` a `Portada`, importada de `@/features/portada/components/Portada`.
- Tomar el cuerpo de `Portada` de feat (sin prop `mapa`; solo se conservan los imports `@/`).
- Dejar en `src/app/App.tsx` el `lazy(Mapa3D)` apuntando a `@/features/mapa/components/Mapa3D`.
- Quitar de `src/app/rutas/Explorador.tsx` el `lazy(Mapa3D)` que ya quedó duplicado (`noUnusedLocals` lo marca).

**Archivos nuevos de feat que hay que reubicar** (git no los mueve porque no existen en 68cdabc): `src/lib/tarjeta.ts` y `src/lib/tarjeta.test.ts` → `src/features/mapa/utils/` (solo los usan `Mapa2D` y `escena`), y `src/lib/disposicion.ts` (constante Tailwind compartida por App, Esperas, Explorador y Portada) → `src/utils/`. Convertir sus imports relativos (`./direccion`, `./formato`, ahora en `utils/`) a `@/utils/direccion`, `@/utils/formato`, y actualizar quienes los importan.

**Otros puntos.**

- `vite.config.ts` (`setupFiles` → `src/testing/setup.ts`), `e2e/` y los tests que importen rutas viejas (`@/store`, `@/mapa/…`, `@/components/Ficha`…) hay que revisarlos tras el merge.
- `src/i18n/textos.ts` tiene un comentario con `src/mapa/fauna.ts` (línea ~386): corregirlo a `src/features/mapa/escena/fauna.ts` DESPUÉS del rebase, porque feat edita ese archivo.
- Tras resolver: `pnpm exec tsc -b && pnpm lint && pnpm test && pnpm build`.
- El chequeo de PR exige un archivo en `changelog/`: ya existe `changelog/refactor-arquitectura.md`.
- En el checkout principal del usuario (`/home/leandro-rojas/Escritorio/Nasa/nasa-challenge-frontend`) pueden existir dos archivos sin seguimiento y desactualizados, `ARQUITECTURE.md` (copia vieja) y el plan `docs/superpowers/plans/2026-11-14-migracion-arquitectura.md`. Bloquearán el checkout/merge allí («untracked working tree files would be overwritten»): hay que borrarlos antes. No se tocaron desde esta rama.

**Receta:** hacer el rebase/merge normal; git sigue los renombres, así que los cambios entrantes sobre un archivo viejo se aplican al archivo en su ruta nueva. Para cada conflicto, aplica el cambio entrante sobre la ruta NUEVA. Si git no logra emparejar un archivo (archivo muy editado, similitud baja), muévelo tú con `git mv` a la ruta de la tabla y reaplica el cambio. Los imports del código entrante que sigan siendo relativos (`./x`, `../x`) o apunten a ubicaciones viejas (`@/store`, `@/mapa/...`, `@/components/Ficha`…) hay que convertirlos a `@/` y a las ubicaciones nuevas. Al final corre `pnpm exec tsc -b && pnpm lint && pnpm test`: `tsc` marca las rutas rotas y `pnpm lint` marca los imports relativos y las dependencias prohibidas (feature → feature, compartido → feature/app).
