# ci/plantilla-ci-e2e

## Añadido
- `.github/pull_request_template.md`: molde de PR con checklist.
- `ci.yml`: lint, tipos + build y Vitest en cada PR.
- `pr-checks.yml`: título con prefijo, `main` solo desde `developer`, solo `pnpm-lock.yaml`, changelog presente.
- `e2e.yml` + `e2e/recorrido.spec.ts`: recorrido completo con Playwright (portada → perfil → explorador → 2D → zona → informe → idioma/tema) y respaldo sin WebGL.

## Pendiente
- `pnpm add -D @playwright/test` (actualiza `pnpm-lock.yaml`) antes de que `e2e.yml` pase.
