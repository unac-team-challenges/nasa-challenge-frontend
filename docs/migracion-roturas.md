# Migración de arquitectura: roturas y cambios grandes

Todo lo que se rompió, se desvió del plan (`docs/superpowers/plans/2026-11-14-migracion-arquitectura.md`) o cambió más de lo esperado. Cada entrada: qué pasó, archivos, resolución o pendiente, a quién avisar.

## Entorno y línea base (14 nov, `origin/developer` @ 68cdabc)

- **pnpm no estaba en el PATH.** Se instaló con `corepack enable --install-directory ~/.local/bin pnpm`; hay que usar `export PATH=$HOME/.local/bin:$PATH`.
- **Test intermitente:** `src/components/pantallas.test.tsx` («/zona/20?perfil=agricultor abre la ficha de Piura…») falló una vez en la corrida completa (`pnpm test`, carga alta) y pasa solo y en la segunda corrida completa. Ya fallaba antes de tocar nada. Pendiente: subir el timeout de `findByRole` o revisar por qué tarda.
- **e2e lento e intermitente:** `e2e/recorrido.spec.ts` («recorrido completo») falló en la primera corrida completa (suite de 2.7 min) y pasó sola (58 s). Es lento por el 3D en software (sin GPU). Ya ocurría antes de la migración.
- Línea base de la migración: `pnpm test` → 34 pasan, 3 omitidos; `pnpm build` ok; `pnpm lint` ok.

## Durante la migración

- **Tareas 4 y 5 en un solo commit** (`refactor: features y app`), como permite el plan: la Tarea 4 sola deja `tsc` roto hasta que exista `app/rutas/Inicio.tsx`.
- **Prettier no está al día en el repo** (ya antes de migrar: `fauna.ts`, `escena.ts`, `Ficha.tsx`, `Explorador.tsx`, `textos.ts`, `schema.d.ts`, los json no pasan `prettier --check`; `pnpm lint` no lo exige). Al mover, solo se envolvieron las líneas de import que pasaron de 100 columnas (router, Explorador, Ficha); `fauna.ts` y `escena.ts` se dejaron tal cual para no meter ruido (prettier reescribía 280 líneas de `fauna.ts`). Pendiente: un commit aparte de `pnpm format` si el equipo quiere. Avisar al equipo antes de formatear todo.
- **`Portada` ya no importa `Mapa3D`:** recibe `mapa: ReactNode`; el `lazy` + `Suspense` + `MapaSkeleton` viven ahora en `src/app/rutas/Inicio.tsx`. Mismo comportamiento.
- **Un CSS sigue con ruta relativa:** `src/index.css` hace `@import './shadcn.css'`. El alias `@/` y la regla de lint solo cubren TypeScript; el CSS resuelve bien y el build pasa. Se deja.
- **Reglas de lint más estrictas que el plan:** el plan decía que `no-restricted-imports` bastaba para los relativos. El review de la Tarea 6 encontró que no detectaba `from '.'`, `from '..'` ni `import('../x')`; se agregaron `'.'`/`'..'` al patrón y una regla `no-restricted-syntax` para `import()` dinámico (commit `chore: eslint cierra huecos de imports relativos`). También se cambió el mensaje a español neutro («Usa el alias @/…») y se formateó solo `eslint.config.js` con prettier.
- **Dependencias nuevas (decisión del usuario, 14 nov):** `eslint-plugin-import-x` 4.18.1 y `eslint-import-resolver-typescript` 4.4.5 (devDependencies). `ARQUITECTURE.md` §5 decía «sin plugin nuevo»; se corrigió.
- **`import-x` no marca alias que no resuelven** (no se activó `no-unresolved`); `tsc -b` ya lo atrapa.
- **Intermitentes:** en las verificaciones de las Tareas 2-6 no se repitió el fallo de `pantallas.test.tsx` ni el de `recorrido.spec.ts`; siguen siendo intermitentes preexistentes (ver arriba).
- Nada más se rompió en las Tareas 2-6: sin deviaciones en el movimiento de archivos ni en la reescritura de imports (0 imports relativos tras la Tarea 2, 0 referencias a rutas viejas tras las Tareas 3-5).

## Resumen para quien haga el rebase

**Base usada:** `origin/developer` @ `68cdabc`. Las ramas que editaron rutas viejas después de ese commit chocarán en los archivos movidos.

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

**Archivos con más riesgo de conflicto:** `src/mapa/Mapa2D.tsx`, `src/mapa/Mapa3D.tsx`, `src/components/Explorador.tsx`, `src/components/Portada.tsx` (ahora `Portada({ mapa })` y el `lazy` de `Mapa3D` vive en `Inicio.tsx`), `src/App.tsx`, `src/store.ts`, `src/lib/useZonas.ts`.

**Receta:** hacer el rebase/merge normal; git sigue los renombres, así que los cambios entrantes sobre un archivo viejo se aplican al archivo en su ruta nueva. Para cada conflicto, aplica el cambio entrante sobre la ruta NUEVA. Si git no logra emparejar un archivo (archivo muy editado, similitud baja), muévelo tú con `git mv` a la ruta de la tabla y reaplica el cambio. Los imports del código entrante que sigan siendo relativos (`./x`, `../x`) o apunten a ubicaciones viejas (`@/store`, `@/mapa/...`, `@/components/Ficha`…) hay que convertirlos a `@/` y a las ubicaciones nuevas. Al final corre `pnpm exec tsc -b && pnpm lint && pnpm test`: `tsc` marca las rutas rotas y `pnpm lint` marca los imports relativos y las dependencias prohibidas (feature → feature, compartido → feature/app).
