# ci/plantilla-ci-e2e

## Añadido
- `.github/pull_request_template.md`: molde de PR con checklist.
- `ci.yml`: lint, tipos + build y Vitest en cada PR.
- `pr-checks.yml`: título con prefijo, `main` solo desde `developer`, solo `pnpm-lock.yaml`, changelog presente.
- `e2e.yml` + `e2e/recorrido.spec.ts`: recorrido completo con Playwright (portada → perfil → explorador → 2D → zona → informe → idioma/tema) y respaldo sin WebGL.

- `@playwright/test` y el script `pnpm e2e`. Probado en local: 2 pruebas pasan.
- Vitest ignora `e2e/` y pasa sin pruebas (`--passWithNoTests`).

## Corregido
Con ESLint (PR #1) aparecían 4 errores en el código de #2–#4 que oxlint no veía:
- `react-hooks/refs` en `Mapa3D.tsx`: la ref `alGirarRef` se actualiza en un efecto, no al renderizar.
- `prefer-const` en `data/ejemplo.ts` (`calcularZonas`).
- `react-refresh/only-export-components` en `Ficha.tsx`: `colorDireccion` pasa a `lib/color.ts`.

## Base
Apilada sobre `feat/mapa2d` (#4), porque el e2e recorre las pantallas de #2–#4. Incluye un merge de `feat/base-frontend` (ESLint y shadcn).
