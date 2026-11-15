# feat/mapa-calor-temperatura

PR: base `developer`. Va con el PR #62 del backend (`GET /api/celdas`).

## Añadido
- Mapa de calor de temperatura en 3D y 2D: cada celda de NASA POWER (~50 km) con su `T2M`, en vez de un
  color plano por departamento. El promedio por departamento mezclaba costa, Andes y selva (Lima 13,8 °C).
- Rampa frío → calor con tokens nuevos en `index.css` (`--frio-2`, `--frio-1`, `--calor-0`…`--calor-5`):
  azul en Andes y altiplano, amarillo/naranja en costa y valles, rojo en selva. Escala fija 5–28 °C
  (percentiles 2–98), la misma en la tendencia y en cada año de la máquina del tiempo.
- `features/mapa/utils/calor.ts` (+ test): malla a 1 px por celda (typed arrays + LUT), relleno de bordes
  para que la interpolación y las paredes no lean píxeles vacíos, y variantes opacas para el 3D
  (normal, rayada = posible casualidad, velada = pocos datos).
- `features/mapa/hooks/useCalor.ts`: `/api/celdas` si la sesión usa la API; si no, `src/data/celdas_temperatura.json`
  (mismos números) en un chunk aparte (17 KB gzip), solo con temperatura.
- 3D (`escena.ts`): una textura compartida por las 25 tapas, canal `uv1` para que cada pared tome el color de
  su borde, sin transparencias (no se ven columnas cortadas) y más relieve/degradado en las paredes con calor.
- 2D (`Mapa2D.tsx`): `<image>` recortada con la silueta del Perú bajo los departamentos.
- Leyenda: barra de la rampa con °C y nota de resolución (en los Andes el valor sale suavizado).
- `src/api/openapi.json` copiado del backend y `schema.d.ts` regenerado (`pnpm gen`): solo suma `/api/celdas`.

## Sin cambios
- Lluvia, altura de columnas (tendencia), semáforo, ficha y franjas de la máquina del tiempo.

## Pendiente
- Ucayali (0,77 °C/década) es atípico frente a estudios andinos: revisar en el backend.
