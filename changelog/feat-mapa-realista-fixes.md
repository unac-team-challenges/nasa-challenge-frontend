# feat/mapa-realista-fixes

Mapa 3D más realista (agua viva, sol y luna, cielo, nubes de lluvia), paleta "tierra" en la página y arreglos de la cabecera y de la barra de tiempo.

## Añadido
- **Agua viva** (`SUELO_FS` en `escena.ts`): cuatro ondas con normal analítica, crestas y valles, fresnel y el camino de luz del sol o la luna sobre el mar. En celular, solo dos ondas (`OLAS_SIMPLES`).
- **Sol (claro) y luna (oscuro)** en el cielo real, bajos al frente (al norte, como en Perú). La vista de inicio baja un poco para dejar una franja de cielo. Una sola dirección de luz (`DIR_LUZ`) para la luz, la sombra del Perú y la de las nubes.
- **Cielo anclado al mundo** (equirectangular): azul de día, noche con estrellas. Neblina del horizonte celeste o azul noche, sin depender del fondo de la página.
- **Nubes de lluvia** con su sombra, solo con la variable lluvia: dos draw calls instanciados. Comparten `uTime` y `uTope` con las gotas, así que no hay trabajo de CPU por cuadro.
- **Botón Inicio** en la cabecera, activo en `/`. En celular queda solo el icono.

## Cambiado
- **Paleta de la página "Nazca"**: marrón oscuro en oscuro (`#201c19`) y marrón claro en claro (`#d6c3a5`). Textos con contraste WCAG ≥ 4.5:1. El color de la barra del navegador sigue el tema.
- **Paleta de datos tierra**: azul acero (`--map-up`) y marrón (`--map-down`), validados para daltonismo. Rampa de intensidad más amplia (25–100 %) en las franjas del año.
- **«Posible casualidad»** pasa de rayas a **punteado** (color lavado y puntos finos al tresbolillo), igual en columnas 3D, malla de calor o lluvia, 2D y leyenda.
- **Sin "nieve" falsa** en claro: tierras altas ocres; la nieve solo sobre ~5200 m.

## Arreglado
- La línea del deslizador "Año a año" ocupa todo el alto del riel, del primer año al último.
- Desde `/metodologia`, Lluvia/Temperatura y el perfil llevan a `/explorar` (antes solo cambiaba la URL). «Atrás» vuelve a la metodología.
- Al cambiar de perfil ya no aparece un hueco a la derecha: el informe minimizado ensanchaba la página (`overflow-x-clip` en la sección del explorador).

## Pendiente
- Medir el rendimiento del shader del mar en un celular real.
