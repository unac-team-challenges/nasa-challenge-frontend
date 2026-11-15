# test/proyecto-celular

PR: base `developer`. Mejora 11d del documento de UX.

## Agregado
- `playwright.config.ts`: dos proyectos. `escritorio` corre todo lo que ya había; `celular` usa `devices['Pixel 7']` (412 × 915, 2,6x, táctil, user agent móvil) y solo corre `e2e/celular.spec.ts`. Sigue siendo solo Chromium, así que el CI no instala nada más.
- `e2e/celular.spec.ts`, tres comprobaciones del documento en un celular de verdad:
  - La Pista («Ir a …») no devuelve la página al mapa: tras tocarla, `scrollY` sigue abajo (no vuelve a 0).
  - El idioma muestra cuál está activo (`aria-pressed`) y cambiarlo a ES quita `lang` de la URL.
  - Con todo cerrado, los paneles tapan menos del 25 % del mapa.
- `e2e/apoyo/cobertura.ts`: la medición de cobertura de paneles, sacada de `mapa-limpio.spec.ts` para usarla en los dos proyectos.

## Cambiado
- `e2e/mapa-limpio.spec.ts`: usa `coberturaPaneles` del helper. Misma prueba, mismo umbral.

## Notas
- La Pista sugiere la zona vecina que le toque; la prueba lee el nombre del botón en vez de fijar «Ucayali».
- Sigue sin cubrir gestos de pellizco ni el menú de compartir de iOS/Android: eso se verifica en el teléfono.
