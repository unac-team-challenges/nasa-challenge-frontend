# feat/fauna-con-datos-clima

Base: `origin/developer`. El globo que sale al pasar el puntero por un animal ya no es un dato curioso suelto: habla de lo que trata el mapa.

## Cambiado
- **Datos curiosos reescritos** (`FAUNA_TEXTOS`, es y en, los 19 personajes): cada uno une al personaje con el agua y el clima de su zona (bofedales y deshielo, temporada de lluvias, El Niño y la anchoveta, crecidas del río, riego en el desierto de Ica, bosque nublado, manglar, acequias).
- **Globo en tres partes** (`escena.ts`, `llenarTip`): nombre en negrita, dato y, debajo, una línea con los datos de la NASA del departamento donde vive el animal:
  - lluvia o temperatura: cambio por década y si es real o puede ser casualidad;
  - con un año elegido en la barra de tiempo: anomalía de ese año frente a su promedio;
  - modo Vegetación: NDVI medio y su nivel en palabras;
  - pocos datos (p. ej. Callao): «no sacamos conclusiones».
- `Fauna.texto()` ahora devuelve `{ nombre, dato, dept }` en vez de un string.
- `nivelNdvi()` sale de `datosTarjetaVeg` (`tarjeta.ts`) para reusarlo, sin cambiar su resultado.

## Añadido
- `src/features/mapa/utils/faunaClima.ts` (+ test): arma la línea de clima. Textos en `FAUNA_CLIMA` (`textos.ts`).
- Estilos `.tip3d-nombre` y `.tip3d-clima` en `index.css`.

## Verificado
- `pnpm lint`, `pnpm test --run` y `pnpm build` pasan.
- No se vio el globo en el navegador (el mapa 3D no dibuja en el navegador de pruebas del entorno): hay que mirarlo con `pnpm dev`.

## Pendiente
- **Revisar los datos de fauna antes de la demo.** Son afirmaciones generales, no salen de nuestros datos: bofedales (humedales de altura que dependen de lluvia y deshielo), lluvias de diciembre a marzo en los Andes, efecto de El Niño sobre pingüino, lobo marino y pelícano, delfín rosado entre árboles inundados en la crecida, reciclaje de agua en el bosque amazónico, ascenso de altura del bosque nublado con el calentamiento, salinidad del manglar, fiesta de limpieza de acequias del danzante de tijeras.
