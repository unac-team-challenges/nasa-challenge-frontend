# refactor/selectores-store

## Cambiado
- Siete componentes leían el store con `useApp()` sin selector, y por eso se volvían a dibujar con cualquier cambio de `useApp`, aunque no usaran ese campo (por ejemplo `margenMapa`, que `useMargenMapa` actualiza al medir, o `reinicio2d`). Ahora cada uno se suscribe solo a lo que usa:
  - `Explorador`, `Mapa3D`, `Portada` y `BarraTiempo`: `useApp(useShallow((s) => ({ ... })))` (de `zustand/react/shallow`, ya incluido en zustand).
  - `Mapa2D` y `Leyenda`: `useApp((s) => s.idioma)`, como ya hacían `App.tsx` y otros.

## Notas
- Rama apilada sobre `refactor/explorador-hooks` (#77): ambas tocan el comienzo de `Explorador`.
- Sin cambios de comportamiento. No medí cuántos dibujos se evitan; el efecto es mayor en `Explorador`, que es el que más campos de `useApp` ignoraba.
- `pnpm lint`, `pnpm build` y `pnpm test` pasan; e2e `recorrido`, `linea-tiempo`, `leyenda` y `mapa2d-gestos` pasan.
