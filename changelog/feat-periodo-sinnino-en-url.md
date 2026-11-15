# feat/periodo-sinnino-en-url

PR: base `feat/ficha-agricultor-estudiante` (apilada sobre el PR #54; pasa a `developer` cuando ese se fusione). Solo frontend; no toca el contrato.

## Cambiado
- El periodo de la tendencia y «sin los años de El Niño» pasan de Zustand a la URL (`?periodo=largo&sinnino=1`), con una sola fuente de verdad. Un enlace compartido o el de «Cómo citar» abre la misma vista.
- `lib/busqueda.ts`: campos `periodo` y `sinnino` en el esquema Zod, hooks `usePeriodo()` y `useSinNino()` (selectores, como `useAnio()`) y setters `setPeriodo` / `setSinNino` en `useBusqueda()`. Cambiar de variable quita `sinnino`; cambiar el periodo detiene la reproducción.
- `stores/app.ts` ya no guarda `periodo` ni `sinNino`. Leen de la URL: `useZonas`, `Explorador`, `Figura`, `SerieZona`, `EstRobustez`, `BarraTiempo`, `Mapa2D`, `Mapa3D` y `Leyenda`.
- «Enlace a esta vista exacta» vuelve a ser exacto (periodo y «sin El Niño» incluidos).

## Tests
- `busqueda.test.ts`: lectura de `periodo` / `sinnino` y valores inválidos ignorados.
- `pantallas.test.tsx`: `sinnino=1` abre la casilla marcada, marcar/desmarcar escribe la URL y cambiar de variable lo quita.

## Notas
- Hoy no hay control en pantalla para cambiar el periodo (siempre `reciente` salvo por URL); el setter queda listo para cuando exista.
