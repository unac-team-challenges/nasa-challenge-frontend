# Migración de arquitectura del frontend — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar `src/` en `app/ · features/ · capas compartidas` con dependencias en un solo sentido, forzado por ESLint, sin cambiar comportamiento.

**Architecture:** Primero todo import pasa a `@/` (así mover un archivo es reescribir un string). Luego se mueven las capas compartidas, después las features, después `app/`. Al final se agrega la regla ESLint y se actualiza la documentación. Cada tarea deja `tsc`, `lint`, `test` en verde.

**Tech Stack:** React 19, Vite 8, TypeScript, TanStack Router, Zustand, Vitest, Playwright, ESLint 10 (flat config), pnpm.

**Spec:** `ARQUITECTURE.md` (raíz del frontend). Es la fuente de verdad del árbol final y de las reglas.

## Global Constraints

- Nombres de archivo **no cambian** (PascalCase en componentes). Solo cambian carpetas. Excepciones: `store.ts` → `stores/app.ts` (carpeta nueva `stores/`).
- Carpetas en español. Sin barrel files (`index.ts`).
- Todo import entre archivos usa `@/` (alias a `src/`, ya existe en `tsconfig.app.json` y `vite.config.ts`). Cero `./` y `../`.
- `@/lib/utils` y `components/ui/` no se mueven (aliases de `components.json` de shadcn).
- `src/main.tsx` se queda en `src/` (lo referencia `index.html`).
- Cero comportamiento nuevo. Única dependencia nueva (decisión del usuario, 14 nov): `eslint-plugin-import-x` + `eslint-import-resolver-typescript` como devDependencies. Se eligió `import-x` y no `eslint-plugin-import` porque este último solo declara soporte hasta ESLint 9 y el proyecto usa ESLint 10; `import-x` declara `^10.0.0` y trae la misma regla (`no-restricted-paths`) que usa bulletproof-react.
- **Roturas y cambios grandes se documentan, no se esconden.** Todo lo que se rompa, se tenga que desviar del plan, o cambie mucho más de lo esperado se anota en `docs/migracion-roturas.md` (qué pasó, archivos, cómo se resolvió o qué falta, quién puede arreglarlo). Si un paso no se puede cerrar, se deja anotado y se sigue.
- `pnpm` hay que tenerlo en el PATH (`corepack enable pnpm` o `npm install -g pnpm@10`).
- Verificación estándar de cada tarea: `pnpm exec tsc -b && pnpm lint && pnpm test` → sin errores.
- Los commits se hacen solo cuando el usuario lo autorice.

## Review Focus

- `lazy(() => import('...'))` en `router.tsx`, `Explorador.tsx` y `Portada.tsx`: el string también cambia. Si falla, `tsc` no lo ve pero `pnpm build` o los e2e sí. Test: `pnpm build && pnpm e2e` al final de las tareas 4, 5 y 6.
- `vite.config.ts` → `setupFiles: ['./src/test/setup.ts']` apunta a una ruta, no a un import: se rompe en silencio al mover `test/` (Vitest falla con "Failed to load setupFiles"). Se corrige en la Tarea 3.
- La regla ESLint no cubre imports dinámicos o features nuevas. Test: Tarea 6 crea violaciones de prueba (estático, dinámico, feature nueva) y exige que `pnpm lint` falle en cada una.
- Ciclos entre capas compartidas (`stores/app.ts` ↔ `hooks/useZonas.ts` ↔ `lib/busqueda.ts` ya se importan entre sí hoy). Mover no debe agregar ciclos nuevos; `pnpm build` los delata como import no resuelto.
- `Portada` sin `Mapa3D` propio: la portada debe seguir mostrando `MapaSkeleton` mientras carga three.js. Test: e2e `recorrido.spec.ts` + `pantallas.test.tsx`.

---

## Herramientas desechables

Viven en el scratchpad, **no** se commitean. Crear los dos archivos una vez (`$SCRATCH` = carpeta de scratchpad de la sesión).

`$SCRATCH/alias.mjs` — convierte imports relativos a `@/` (corre desde la raíz del frontend):

```js
import fs from 'node:fs'
import path from 'node:path'
const SRC = path.resolve('src')
const EXT = ['', '.ts', '.tsx', '.d.ts', '.json']
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
for (const f of walk(SRC).filter((f) => /\.tsx?$/.test(f))) {
  const s = fs.readFileSync(f, 'utf8')
  const out = s.replace(/(['"])(\.{1,2}\/[^'"\n]*)\1/g, (m, q, spec) => {
    const abs = path.resolve(path.dirname(f), spec)
    if (!EXT.some((e) => fs.existsSync(abs + e) && fs.statSync(abs + e).isFile())) return m
    return `${q}@/${path.relative(SRC, abs)}${q}`
  })
  if (out !== s) fs.writeFileSync(f, out)
}
```

`$SCRATCH/mover.mjs <viejo> <nuevo>` — rutas relativas a `src/`, con extensión. Hace `git mv` y reescribe el string `@/<viejo sin .ts/.tsx>` en `src/`, `e2e/` y `vite.config.ts` (los `.json` conservan extensión):

```js
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
const [viejo, nuevo] = process.argv.slice(2)
fs.mkdirSync(path.dirname(`src/${nuevo}`), { recursive: true })
execSync(`git mv src/${viejo} src/${nuevo}`)
const spec = (p) => '@/' + (p.endsWith('.json') ? p : p.replace(/\.(d\.ts|tsx?)$/, ''))
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
const archivos = [...walk('src'), ...walk('e2e')].filter((f) => /\.tsx?$/.test(f))
for (const f of archivos) {
  const s = fs.readFileSync(f, 'utf8')
  const out = s.replaceAll(`'${spec(viejo)}'`, `'${spec(nuevo)}'`)
  if (out !== s) fs.writeFileSync(f, out)
}
```

---

### Task 1: Línea base

**Files:** ninguno.

- [ ] **Step 0:** `pnpm --version` → responde (si no: `corepack enable pnpm` o `npm install -g pnpm@10`). `.git/MERGE_HEAD` **no** existe (sin merge a medias).
- [ ] **Step 1:** `git status --short` → vacío salvo `ARQUITECTURE.md` y `docs/superpowers/` sin seguir (si hay más, pedir al usuario que commitee o guarde antes de seguir). La migración se hace en su propia rama/worktree, nunca sobre `main`.
- [ ] **Step 2:** `pnpm exec tsc -b && pnpm lint && pnpm test && pnpm build` → todo pasa. Anotar el número de tests que pasan: es la referencia de todas las tareas.
- [ ] **Step 3:** `pnpm e2e` → pasa (si el puerto 4173 está ocupado: `E2E_PORT=4391 pnpm e2e`). Si algo ya falla aquí, **parar** y avisar: no se migra sobre una base rota.

### Task 2: Todos los imports a `@/`

**Files:** Modify: todos los `.ts/.tsx` de `src/` que tengan `./` o `../`.

**Interfaces:**
- Produces: ningún import relativo a archivos de `src/`. A partir de aquí `mover.mjs` es suficiente para mover cualquier archivo.

- [ ] **Step 1:** Crear `alias.mjs` y `mover.mjs` en el scratchpad (código arriba).
- [ ] **Step 2:** `node $SCRATCH/alias.mjs`
- [ ] **Step 3:** Verificar que no quedan relativos: `grep -rnE "from '\.{1,2}/|import\('\.{1,2}/" src` → vacío. Los imports de `@/lib/utils` ya existentes no cambian.
- [ ] **Step 4:** Verificación estándar + `pnpm build` → pasa, mismo número de tests que en la Tarea 1.
- [ ] **Step 5:** Commit: `refactor: imports con alias @/`

### Task 3: Capas compartidas

**Files:** Mover (con `node $SCRATCH/mover.mjs <viejo> <nuevo>`):

| Viejo | Nuevo |
|---|---|
| `store.ts` | `stores/app.ts` |
| `test/render.tsx` | `testing/render.tsx` |
| `test/setup.ts` | `testing/setup.ts` |
| `lib/useZonas.ts` | `hooks/useZonas.ts` |
| `lib/useZonas.test.ts` | `hooks/useZonas.test.ts` |
| `lib/meta.ts` | `hooks/meta.ts` |
| `lib/ruta.ts` | `hooks/ruta.ts` |
| `lib/color.ts` | `utils/color.ts` |
| `lib/direccion.ts` | `utils/direccion.ts` |
| `lib/formato.ts` | `utils/formato.ts` |
| `lib/webgl.ts` | `utils/webgl.ts` |

Modify: `vite.config.ts` (`setupFiles`).

**Interfaces:**
- Produces: `useApp`, `Tema`, `Fuente`, `ModoVista` exportados desde `@/stores/app`; `useZonas`, `useRango`, `useVista`, `useDetalle`, `decidirFuente` desde `@/hooks/useZonas`; `useMeta` desde `@/hooks/meta`; `useRuta`, `Ruta` desde `@/hooks/ruta`; helpers puros desde `@/utils/*`. Los nombres exportados no cambian.

- [ ] **Step 1:** Ejecutar `mover.mjs` por cada fila de la tabla.
- [ ] **Step 2:** En `vite.config.ts`: `setupFiles: ['./src/testing/setup.ts']`.
- [ ] **Step 3:** `grep -rn "src/test/\|'@/store'\|@/lib/\(useZonas\|meta\|ruta\|color\|direccion\|formato\|webgl\)" src e2e *.ts *.md` → solo debe quedar texto de documentación (se arregla en la Tarea 7), ningún import.
- [ ] **Step 4:** Verificación estándar + `pnpm build` → pasa, mismo número de tests.
- [ ] **Step 5:** Commit: `refactor: capas compartidas (stores, hooks, utils, testing)`

### Task 4: Features

**Files:** Mover con `mover.mjs`:

| Viejo | Nuevo |
|---|---|
| `mapa/Mapa2D.tsx` | `features/mapa/components/Mapa2D.tsx` |
| `mapa/Mapa3D.tsx` | `features/mapa/components/Mapa3D.tsx` |
| `components/Leyenda.tsx` | `features/mapa/components/Leyenda.tsx` |
| `mapa/escena.ts` | `features/mapa/escena/escena.ts` |
| `mapa/fauna.ts` | `features/mapa/escena/fauna.ts` |
| `mapa/suelo2d.ts` | `features/mapa/utils/suelo2d.ts` |
| `components/Ficha.tsx` | `features/ficha/components/Ficha.tsx` |
| `components/GraficoSerie.tsx` | `features/ficha/components/GraficoSerie.tsx` |
| `components/AntesDespues.tsx` | `features/ficha/components/AntesDespues.tsx` |
| `data/caso2.ts` | `features/ficha/data/caso2.ts` |
| `components/BarraTiempo.tsx` | `features/tiempo/components/BarraTiempo.tsx` |
| `components/Portada.tsx` | `features/portada/components/Portada.tsx` |
| `components/Metodologia.tsx` | `features/metodologia/components/Metodologia.tsx` |

Modify: `features/portada/components/Portada.tsx` (quitar `Mapa3D`, recibir `mapa`).

**Interfaces:**
- Consumes: Tarea 3 (rutas `@/hooks/*`, `@/stores/app`, `@/utils/*`).
- Produces: `Portada({ mapa }: { mapa: ReactNode })` — pinta `mapa` en el panel derecho donde hoy va el `<Suspense><Mapa3D modo="inicio"/></Suspense>`. Lo demás de `Portada` no cambia (`conWebgl`, pie `heroCap`).

- [ ] **Step 1:** Ejecutar `mover.mjs` por cada fila. `data/datos.ts` y los json **no** se mueven.
- [ ] **Step 2:** En `Portada.tsx`: borrar `lazy`, `Suspense`, el import de `Mapa3D` y el de `MapaSkeleton`; agregar la prop `mapa: ReactNode` y renderizar `{mapa}` en su lugar. (Portada ahora no importa de `features/mapa`.)
- [ ] **Step 3:** Mientras no exista `app/rutas/Inicio.tsx` (Tarea 5), `router.tsx` rompe en tipos: dejar la Tarea 4 y la 5 como **un solo commit** o crear `Inicio.tsx` ya (ver Tarea 5, Step 2) antes de correr tsc.
- [ ] **Step 4:** Verificación estándar + `pnpm build`.
- [ ] **Step 5:** Verificar que no hay cruces entre features: `grep -rnE "@/features/(mapa|ficha|tiempo|portada|metodologia)" src/features` → cada archivo solo menciona **su propia** feature.

### Task 5: `app/`

**Files:**
- Mover: `App.tsx` → `app/App.tsx`, `router.tsx` → `app/router.tsx`, `components/Explorador.tsx` → `app/rutas/Explorador.tsx`.
- Create: `src/app/rutas/Inicio.tsx`.
- Modify: `src/main.tsx` (importa `router` de `@/app/router`; lo hace `mover.mjs`), `app/router.tsx` (ruta `inicio` usa `Inicio`).

**Interfaces:**
- Consumes: `Portada({ mapa })` (Tarea 4), `Mapa3D` con props `modo="inicio"` y `MapaSkeleton` de `@/components/Esperas`.
- Produces: `Inicio(): JSX.Element` en `@/app/rutas/Inicio` — arma `<Portada mapa={<Suspense fallback={<MapaSkeleton />}><Mapa3D modo="inicio" /></Suspense>} />` con `Mapa3D` cargado por `lazy` (el mismo `lazy(() => import(...).then(m => ({ default: m.Mapa3D })))` que hoy tenía Portada, con la ruta nueva).

- [ ] **Step 1:** Mover los tres archivos con `mover.mjs`.
- [ ] **Step 2:** Crear `Inicio.tsx` como se describe. En `router.tsx`: `component: Portada` → `component: Inicio`; actualizar los `import('@/…')` de `lazyRouteComponent` (Explorador → `@/app/rutas/Explorador`, Metodologia → `@/features/metodologia/components/Metodologia`).
- [ ] **Step 3:** `grep -rn "import(" src` → ningún string apunta a una ruta que ya no existe.
- [ ] **Step 4:** Verificación estándar + `pnpm build` + `pnpm e2e` → todo pasa, mismo número de tests. Abrir `pnpm dev` y comprobar a mano `/`, `/explorar`, `/zona/20`, `/metodologia`: la portada muestra el esqueleto y luego el mapa.
- [ ] **Step 5:** Commit (Tareas 4 y 5 juntas si hizo falta): `refactor: features y app`

### Task 6: Regla ESLint que hace cumplir la arquitectura

**Files:** Modify: `eslint.config.js`.

**Interfaces:**
- Consumes: `eslint-plugin-import-x` y `eslint-import-resolver-typescript` (se instalan en el Step 0), resolver con `tsconfig.app.json` para entender `@/`.
- Produces: tres grupos de reglas, igual que bulletproof-react: (a) `no-restricted-imports` nativo prohíbe imports relativos (`./*`, `../*`) en todo `src/**`; (b) `import-x/no-restricted-paths` con zonas: carpetas compartidas (`components, hooks, lib, utils, stores, api, data, i18n`) no pueden importar de `./src/features` ni `./src/app`, y `./src/features` no puede importar de `./src/app`; (c) una zona por cada carpeta `src/features/<f>` (leída con `fs.readdirSync` al cargar la config): `target: ./src/features/<f>`, `from: ./src/features`, `except: ['./<f>']`. `src/testing/**` y `src/main.tsx` quedan exentos de (b) y (c); `src/components/ui/**` conserva su override de `react-refresh`.

- [ ] **Step 0: Instalar.** `pnpm add -D eslint-plugin-import-x eslint-import-resolver-typescript`. Si falla por red (el wifi de la sede corta `registry.npmjs.org`, ver README), anotarlo en `docs/migracion-roturas.md` y pedir al usuario que use el hotspot. Verificar `pnpm lint` (igual que antes de instalar) y que el lockfile cambió solo por estos paquetes.
- [ ] **Step 1: Escribir la violación primero.** Crear temporalmente en `src/features/tiempo/components/Violacion.tsx`: `import { Ficha } from '@/features/ficha/components/Ficha'` y `export const x = Ficha`. Crear `src/hooks/Violacion.ts`: `import '@/app/App'`. Crear `src/features/portada/components/Violacion2.tsx`: `export const L = () => import('@/features/mapa/components/Mapa3D')`. Crear `src/features/tiempo/components/Violacion3.tsx`: `import { cn } from '../../../lib/utils'; export const y = cn`.
- [ ] **Step 2:** `pnpm lint` → pasa (todavía no hay regla). Confirma que el test de abajo sí detecta algo.
- [ ] **Step 3:** Escribir las reglas en `eslint.config.js` (plugin registrado como `'import-x'`, `settings['import-x/resolver-next']` con `createTypeScriptImportResolver({ project: './tsconfig.app.json' })`).
- [ ] **Step 4:** `pnpm lint` → **falla en las cuatro violaciones** (estático entre features, shared→app, dinámico entre features, relativo). Si `import-x/no-restricted-paths` no resuelve `@/` (no falla donde debería), probar con el resolver apuntando a `tsconfig.json`; si sigue sin funcionar, anotarlo en `docs/migracion-roturas.md` y usar `no-restricted-imports` nativo con `patterns` por zona como respaldo. Si el dinámico no falla, agregar el selector `no-restricted-syntax` para `ImportExpression` con `source.value=/^@\/features\//` en archivos de features y repetir.
- [ ] **Step 5:** Crear la carpeta `src/features/nueva/components/X.tsx` que importe `@/features/ficha/...` → `pnpm lint` falla (la lista de features se lee sola). Borrarla.
- [ ] **Step 6:** Borrar las cuatro violaciones. `pnpm lint` → verde, sin ningún `eslint-disable` en el código real.
- [ ] **Step 7:** Commit: `chore: eslint hace cumplir la arquitectura`

### Task 7: Documentación y CLAUDE.md

**Files:** Modify: `README.md`, `docs/para-favio.md`; Create: `CLAUDE.md` (raíz del frontend).

- [ ] **Step 1:** `README.md`: reemplazar toda mención a rutas viejas (`src/router.tsx`, `src/store.ts`, `src/lib/busqueda.ts` sigue igual, `src/lib/useZonas.ts`, `src/components/ui` sigue igual) por las nuevas, y agregar una línea «Arquitectura: ver `ARQUITECTURE.md`». Comprobar con `grep -nE "src/(router|store|App|mapa|test)|lib/useZonas" README.md docs/*.md`.
- [ ] **Step 2:** `docs/para-favio.md` §7: reemplazar el árbol de «Hoy el código está así» por el del `ARQUITECTURE.md` §2 y cambiar la pregunta final por «Árbol acordado: ver `ARQUITECTURE.md`».
- [ ] **Step 3:** Crear `CLAUDE.md` con una línea de contexto del proyecto y `@ARQUITECTURE.md` (import). Verificar en una sesión nueva que Claude cita las reglas sin que se las pidan.
- [ ] **Step 3b:** Crear o completar `docs/migracion-roturas.md` con todo lo que se rompió o cambió mucho durante la migración (si no pasó nada: una línea que lo diga). Cada entrada: qué pasó, archivos, resolución o pendiente, a quién avisar.
- [ ] **Step 4:** Verificación final: `pnpm exec tsc -b && pnpm lint && pnpm test && pnpm build && pnpm e2e` → todo pasa, mismo número de tests que en la Tarea 1. `find src -type d -empty` → vacío.
- [ ] **Step 5:** Commit: `docs: arquitectura y CLAUDE.md`

---

## Autorrevisión

- **Cobertura del spec (`ARQUITECTURE.md`):** árbol (§2) → Tareas 3-5; reglas 1-4 (§3) → Tareas 2, 4, 6; regla 2 (store global) → Tarea 3 (`stores/app.ts`); lint (§5) → Tarea 6; tabla de cambios (§6) → Tareas 3-5; docs (§9) → Tarea 7.
- **Consistencia de nombres:** `Portada({ mapa })` y `Inicio` se definen en las Tareas 4 y 5 y se usan igual en `router.tsx`.
- **Proporción:** el plan es mecánico (mover + reescribir strings); el único cambio de código real es `Portada`/`Inicio`.
