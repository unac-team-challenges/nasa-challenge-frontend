# feat/vegetacion-serie

PR: base `developer`. Autor: Favio.

## Cambiado
- `src/api/openapi.json` y `src/api/schema.d.ts`: contrato del backend ya mezclado (#42 y #50). `ZonaVegetacion` trae `serie: [{anio, ndvi_anual, area_verde_km2}]` (antes `anios`, un mapa por año) y `p_value`/`q_value` valen como mínimo `0.000001`.
- `AntesDespues` (Caso 2) toma las áreas de 2001 y 2024 de `GET /api/vegetacion` (`vegetacionDeApi` en `src/api/consultas.ts`, hook `useVegetacion`). Sin API, con error o sin 2001/2024 en la serie, usa `caso2.ts` (mismos valores del Lab 3), como el resto de la app (plan B).
- La ficha del Caso 2 dice que las cifras son de un recuadro de 0,25° × 0,25° (~27 × 27 km) y no el promedio del departamento (`cmpUnidad`, en español e inglés).

## p y q
`fmtP` ya muestra «< 0,001» para todo p < 0,001, así que un `0.000001` del backend se ve igual que un 0 y nunca aparece «0». No hizo falta cambiarlo.

## Pruebas
- `consultas.test.ts`: `vegetacionDeApi` toma 2001 y 2024 de la serie por ubigeo, omite un valle sin esos años y devuelve `null` sin API, con error o sin valles.
- `integracion.test.ts`: con el backend de `developer` corriendo (`VITE_API_INTEGRACION`), trae Chavimochic (189 → 356 km²) e Ica (118 → 222 km²). 45/45 con la API real.
- `pnpm lint` y `pnpm build` en verde.

## Pendiente
- Mostrar el NDVI y la tendencia de `/api/vegetacion` (hoy solo se usan las áreas).
- Selva (`/api/cobertura-arboles`, MOD44B): repetir `pnpm gen` cuando exista.
