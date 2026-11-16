# refactor/escena-clase

## Cambiado
- El constructor de `EscenaPeru` pierde ~120 líneas: las tres piezas que se arman una sola vez y no leían el estado de la clase pasan, movidas tal cual, a funciones de `escena/construccion.ts`:
  - `muestrasLluvia(origen)`: los puntos de muestra de cada departamento (antes leía `this.mapa.position`; ahora lo recibe).
  - `crearParticulas()` (y el tipo `Particulas` y `N_PARTICULAS`): geometría y material de las gotas.
  - `llenarNubes(nubes, geoNubes, gotas)`: las nubes y su sombra; `gotas` aporta `uTime` y `uTope`.
  - `crearEstrellas()`: las estrellas de la cúpula.
- `escena.ts`: 1.891 → 1.770 líneas. El orden de `escena.add(...)` y el de las llamadas a `Math.random()` (primero las muestras, al final las estrellas) no cambia.

## Alcance y lo que NO se hizo
- La clase sigue teniendo ~70 campos privados y ~530 referencias a `this`: cielo, relieve, calor, interacción y cámara comparten ese estado (`cuadro()` toca casi todo). Partirla de verdad exige decidir qué objeto es dueño de cada campo y qué API se exponen entre sí; no es un movimiento de código y no se intentó aquí. Sacar los métodos a funciones sueltas obligaría a quitar `private` de decenas de campos, y eso empeora el encapsulamiento sin simplificar nada.

## Notas
- Rama apilada sobre `refactor/escena-modulos` (#98): `construccion.ts` usa `constantes.ts`, `shaders.ts` y `texturas.ts`.
- `pnpm lint`, `pnpm build` y `pnpm test` (190 pasan); e2e `recorrido`, `leyenda` y `tiempo-caso2` pasan con 3D real (las gotas, nubes y estrellas están en esas pantallas, pero ninguna prueba compara píxeles: no hay comprobación visual automática).
