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
