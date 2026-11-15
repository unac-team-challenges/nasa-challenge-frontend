# feat/mapa-lluvia

Mapa de color de lluvia, igual que el de calor: cada celda de NASA POWER (~50 km) con su lluvia anual, en vez de un color plano por departamento.

## Añadido
- Rampa de lluvia (`--lluvia-0`…`--lluvia-6` en `index.css`): seco ocre → verde oliva → turquesa → azul → azul profundo → violeta. Escala fija por percentiles 2–98 (33–3404 mm/año), la misma en la tendencia y en cada año.
- `src/data/celdas_lluvia.json`: `PRECTOTCORR` anual (mm/año) de las mismas 344 celdas de la temperatura, 2001–2024. Solo copia local (la API aún sirve celdas solo de temperatura).
- `useCalor` sirve la malla de la variable activa; 3D, 2D y leyenda la leen de `calor.paradas` y `calor.unidad` (la leyenda muestra «33 mm/año … 3404 mm/año»).
- Textos ES/EN de la leyenda por variable.

## Sin cambios
- Temperatura, columnas (tendencia), semáforo, ficha y máquina del tiempo.

## Refrescar la copia local
Bajar `PRECTOTCORR` mensual de POWER (los 4 recuadros de `pipeline/power.py`), promediar por año con 12 meses y multiplicar por 365; mismo formato que `celdas_temperatura.json` pero con `valor` en vez de `t2m`.

## Pendiente
- `/api/celdas?variable=lluvia` en el backend, para que la API mande como en temperatura.
