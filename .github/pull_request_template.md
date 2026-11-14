## Qué cambia
<!-- Una o dos frases. -->

## Por qué
<!-- Hito, tarjeta de Trello o decisión del Drive (ej.: 07-stack-decidido). -->

## Cómo probarlo
```bash
pnpm install
pnpm dev
```
<!-- Qué mirar en el navegador. -->

## Checklist
- [ ] Título con prefijo: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` o `ci:`
- [ ] Base correcta: rama corta → `developer`; solo `developer` → `main`
- [ ] `pnpm lint`, `pnpm build` y `pnpm test` pasan en local
- [ ] Si cambia el recorrido de la interfaz, `pnpm e2e` pasa
- [ ] Añadí `changelog/<rama>.md`
- [ ] Solo `pnpm-lock.yaml` (nada de `package-lock.json` ni `yarn.lock`), sin claves ni `.env`
- [ ] Si toca el contrato de datos (`openapi.json`, `public/data/`): avisé a los 4 en el chat

## Pendiente
<!-- Lo que queda para otra PR. -->
