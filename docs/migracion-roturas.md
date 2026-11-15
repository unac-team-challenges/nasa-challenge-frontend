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
- **`Portada` ya no importa `Mapa3D`:** durante la migración recibía `mapa: ReactNode` desde `src/app/rutas/Inicio.tsx`. Quedó obsoleto con el merge de `origin/developer` (ver abajo): ahora `Portada()` no recibe props y el único mapa 3D lo monta `src/app/App.tsx`.
- **Un CSS sigue con ruta relativa:** `src/index.css` hace `@import './shadcn.css'`. El alias `@/` y la regla de lint solo cubren TypeScript; el CSS resuelve bien y el build pasa. Se deja.
- **Reglas de lint más estrictas que el plan:** el plan decía que `no-restricted-imports` bastaba para los relativos. El review de la Tarea 6 encontró que no detectaba `from '.'`, `from '..'` ni `import('../x')`; se agregaron `'.'`/`'..'` al patrón y una regla `no-restricted-syntax` para `import()` dinámico (commit `chore: eslint cierra huecos de imports relativos`). También se cambió el mensaje a español neutro («Usa el alias @/…») y se formateó solo `eslint.config.js` con prettier.
- **Dependencias nuevas (decisión del usuario, 14 nov):** `eslint-plugin-import-x` 4.18.1 y `eslint-import-resolver-typescript` 4.4.5 (devDependencies). `ARQUITECTURE.md` §5 decía «sin plugin nuevo»; se corrigió.
- **`eslint.config.js` no depende del cwd:** usa `import.meta.dirname` para leer `src/features` y para el `tsconfig.app.json` del resolver, y pasa `basePath: import.meta.dirname` a `import-x/no-restricted-paths` (opción soportada por import-x 4.18.1; sin ella las zonas se resolvían contra `process.cwd()`). `pnpm lint` desde la raíz y `eslint` lanzado desde `src/` siguen marcando las violaciones.
- **`import-x` no marca alias que no resuelven** (no se activó `no-unresolved`); `tsc -b` ya lo atrapa.
- **Intermitentes:** en las verificaciones de las Tareas 2-6 no se repitió el fallo de `pantallas.test.tsx` ni el de `recorrido.spec.ts`; siguen siendo intermitentes preexistentes (ver arriba).
- Nada más se rompió en las Tareas 2-6: sin desviaciones en el movimiento de archivos ni en la reescritura de imports (0 imports relativos tras la Tarea 2, 0 referencias a rutas viejas en `src/` tras las Tareas 3-5 y la ronda de arreglos finales, salvo un comentario de `src/i18n/textos.ts` con `src/mapa/fauna.ts`, corregido tras el merge con `origin/developer`).

## Merge con `origin/developer` (ya aplicado, 15 nov)

Se hizo `git merge origin/developer` (no rebase) en `refactor/arquitectura`. Entraron #21 (`feat/mapa-hover-relieve`: un solo mapa 3D de fondo en `App.tsx`, `Portada()` sin props, `tarjeta.ts`, `disposicion.ts`), #23 (`fix/periodo-2001`: años de metodología y metadatos desde los datos), #24 (favicon `.ico`) y #26 (notas de release). Git siguió los 27 renombres.

**Conflictos (11), todos resueltos tomando el lado entrante en la ruta nueva:**

- Solo bloque de imports (se tomaron los imports entrantes y se pasaron a `@/` y a las ubicaciones nuevas): `src/app/App.tsx`, `src/app/rutas/Explorador.tsx`, `src/components/Esperas.tsx`, `src/features/mapa/components/{Mapa2D,Mapa3D}.tsx`, `src/features/mapa/escena/escena.ts`.
- No estaban en la vista previa (los trajo #23, que llegó después): `src/features/metodologia/components/Metodologia.tsx`, `src/hooks/meta.ts` (nuevo `useRango`) y `src/i18n/textos.ts` (ya no importa `Periodo`). Mismo tratamiento.
- `src/features/portada/components/Portada.tsx`: cuerpo entrante, `Portada()` sin props; se borró el hueco `{mapa}` de esta rama.
- `README.md`: texto entrante del favicon, con la ruta `src/hooks/meta.ts`.

**Mapa 3D único (trampa del doble montaje).** Se borró `src/app/rutas/Inicio.tsx`; la ruta `/` de `src/app/router.tsx` vuelve a `Portada` (`@/features/portada/components/Portada`). Queda un solo `lazy(Mapa3D)`, en `src/app/App.tsx` (`@/features/mapa/components/Mapa3D`); `Explorador` ya no monta el suyo. Si alguien vuelve a montar `Mapa3D` en una ruta, el inicio tendría dos escenas WebGL y ni `tsc` ni lint lo detectan: revisar con `git grep -n "<Mapa3D"`.

**Archivos nuevos reubicados** (`git mv`, imports a `@/`): `src/lib/tarjeta.ts` y `tarjeta.test.ts` → `src/features/mapa/utils/` (solo los usan `Mapa2D` y `escena`); `src/lib/disposicion.ts` → `src/utils/` (la usan App, Esperas, Explorador y Portada).

**Tabla de movimientos (viejo → nuevo),** por si llega otra rama con rutas viejas:

| Viejo | Nuevo |
|---|---|
| `src/App.tsx`, `src/router.tsx` | `src/app/App.tsx`, `src/app/router.tsx` |
| `src/components/Explorador.tsx` | `src/app/rutas/Explorador.tsx` |
| `src/components/Portada.tsx` | `src/features/portada/components/Portada.tsx` |
| `src/components/Metodologia.tsx` | `src/features/metodologia/components/Metodologia.tsx` |
| `src/components/BarraTiempo.tsx` | `src/features/tiempo/components/BarraTiempo.tsx` |
| `src/components/Ficha.tsx`, `GraficoSerie.tsx`, `AntesDespues.tsx` | `src/features/ficha/components/` |
| `src/data/caso2.ts` | `src/features/ficha/data/caso2.ts` |
| `src/components/Leyenda.tsx` | `src/features/mapa/components/Leyenda.tsx` |
| `src/mapa/Mapa2D.tsx`, `Mapa3D.tsx` | `src/features/mapa/components/` |
| `src/mapa/escena.ts`, `fauna.ts` | `src/features/mapa/escena/` |
| `src/mapa/suelo2d.ts`, `src/lib/tarjeta.ts` (+test) | `src/features/mapa/utils/` |
| `src/lib/meta.ts`, `ruta.ts`, `useZonas.ts`, `useZonas.test.ts` | `src/hooks/` |
| `src/lib/color.ts`, `direccion.ts`, `formato.ts`, `webgl.ts`, `disposicion.ts` | `src/utils/` |
| `src/store.ts` | `src/stores/app.ts` |
| `src/test/render.tsx`, `setup.ts` | `src/testing/` (y `vite.config.ts` `setupFiles` apunta ahí) |

**Receta para la próxima rama que choque:** merge normal; para cada conflicto, aplica el cambio entrante sobre la ruta NUEVA y pasa sus imports relativos (`./x`, `../x`) o viejos (`@/store`, `@/mapa/…`, `@/components/Ficha`…) a `@/` y a la tabla. Luego `pnpm exec tsc -b && pnpm lint && pnpm test`: `tsc` marca las rutas rotas y `pnpm lint` los imports relativos y las dependencias prohibidas.

**Otros puntos.**

- El chequeo de PR exige un archivo en `changelog/`: ya existe `changelog/refactor-arquitectura.md`.
- En el checkout principal del usuario (`/home/leandro-rojas/Escritorio/Nasa/nasa-challenge-frontend`) pueden existir dos archivos sin seguimiento y desactualizados, `ARQUITECTURE.md` (copia vieja) y el plan `docs/superpowers/plans/2026-11-14-migracion-arquitectura.md`. Bloquearán el checkout/merge allí («untracked working tree files would be overwritten»): hay que borrarlos antes. No se tocaron desde esta rama.
