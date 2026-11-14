# feat/datos-reales

PR: base `feat/mapa2d` (#4); se mezcla después de #1 → #2 → #3 → #4.

## Añadido
- `src/data/power.json` (88 KB): **datos reales de NASA POWER** (MERRA-2) por departamento. Lluvia (`PRECTOTCORR`, en mm/año) y temperatura (`T2M`, en °C), con tendencias de 1981–2024 y 2001–2024, la variante sin años de El Niño y las series anuales para el gráfico.
- `scripts/datos_power.py`: lo genera con el **mismo método que el pipeline de Josue**: malla regional en 4 recuadros, todas las celdas de cada departamento y sus funciones de `lab5_tendencias.py` (copiadas tal cual) con su umbral exigente. Verificado contra `power_departamentos_tendencias.csv` del backend: **100 de 100 filas con el mismo estado** y la misma pendiente (diferencia relativa < 3e-6).
- `src/data/datos.ts`: reemplaza a `ejemplo.ts` (borrado).
- Variable **Temperatura** (reemplaza a Vegetación, que todavía no tiene datos reales) y selector de periodo **Desde 1981 / Desde 2001**.
- Ficha: fuente con número de celdas, % por década en lluvia, motivo cuando no es "cambio real", explicación de "pocos datos" por celdas, pista de contraste elegida con los datos (la tendencia contraria más fuerte) y enlace a NASA POWER.
- Colores: en temperatura, más calor = ocre y más frío = azul (`src/lib/direccion.ts`).

## Cambiado
- Textos de la portada: datos de 1981 a 2024; se quitan los enlaces a expedientes (fuera del alcance).

## Contrato
- Campos nuevos por zona: `celdas`, `motivo`, `pct_change_per_decade`, `year_start`, `year_end` (los que ya produce el pipeline de Josue).
- Variable nueva `temperatura` y dos periodos (`largo`, `reciente`).

## Pendiente
- Que la API del backend sirva estas tendencias; entonces `useZonas` pasa a TanStack Query y `power.json` queda como plan B.
- IMERG (lluvia a 10 km) cuando esté su pipeline (backend #9).
