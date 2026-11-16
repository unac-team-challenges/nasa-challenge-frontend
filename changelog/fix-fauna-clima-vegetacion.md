# fix/fauna-clima-vegetacion

## Corregido
- Globo de la fauna con `?variable=vegetacion` fuera del modo Vegetación: decía «la temperatura» (en inglés «temperature»). Ahora `FAUNA_CLIMA.tendencia` y `.anio` nombran las tres variables con un mapa tipado por `PorVariable`, así una variable nueva no compila sin su nombre.
- Test de `lineaClima` con `vegetacion` en español e inglés.

## Pendiente
- Ajustes sugeridos en la revisión de #84 que no son bugs: refrescar el globo al cambiar el año, texto del jaguar y tests de `nivelNdvi`.
