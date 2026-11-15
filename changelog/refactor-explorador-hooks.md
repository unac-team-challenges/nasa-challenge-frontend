# refactor/explorador-hooks

## Cambiado
- `Explorador.tsx` pierde dos bloques de efectos, que pasan a hooks propios en `src/app/rutas/` (van ahí y no en `src/hooks/` porque usan `escenaActiva`, de una feature; una capa compartida no puede importarla):
  - `usePresentacionZona(sel, informeMin, zonaDesdeMapa)`: la presentación del departamento elegido (`intro`, `abrirTarde`).
  - `useInforme(sel, informeMin, modoMapa)`: la ref del informe, el scroll al principio del informe cuando el nuevo es más corto, y el corrimiento del Perú en la escena según el ancho del informe.
- `Explorador` baja de 347 a 299 líneas. Código movido tal cual: sin cambios de comportamiento.

## Notas
- Rama apilada sobre `refactor/escena-sin-three-en-2d` (PR #73): `useInforme` importa `escenaActiva` de `escena/activa`.
- `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e `recorrido`, `mapa2d-toque` y `cabecera-oculta` pasan.
- Sin pruebas unitarias nuevas: es movimiento de código y los e2e cubren el flujo.
