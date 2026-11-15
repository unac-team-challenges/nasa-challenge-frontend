# Detective del Perú (frontend)

NASA Space Apps Challenge 2026. React 19 + Vite + TypeScript, TanStack Router/Query, Zustand, Tailwind v4 y shadcn/ui. Gestor de paquetes: pnpm.
Comandos: `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm e2e`.

@ARQUITECTURE.md

Reglas clave (el detalle y el resto están en `ARQUITECTURE.md`; `pnpm lint` las hace cumplir):

- Una feature (`src/features/<x>`) nunca importa de otra feature; lo que juntan dos features va en `src/app/`, lo que comparten va en una capa compartida.
- Imports siempre con el alias `@/`, nunca relativos (`./x`, `../x`).
- Sin barrel files (`index.ts` que reexporta): se importa cada archivo por su ruta.
