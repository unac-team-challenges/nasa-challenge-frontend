# feat/navbar-rediseno

PR: base `developer`. Autor: Sebastian.

## Por qué
La cabecera se veía vacía y genérica, y tenía fallos de uso:
- **Idioma**: el botón mostraba el idioma *destino* (`EN` estando en español), no el actual.
- **Tema**: siempre mostraba una luna, sin importar el tema activo.
- **Metodología**: era un enlace plano y en celular no aparecía.

## Añadido
- `src/components/MenuMetodologia.tsx`: menú desplegable (Radix) con «Ver la metodología completa» y
  las 5 secciones (Fuentes, Cálculo, Semáforo, Límites, Créditos). Cada una salta a su ancla
  (`#m-<sección>`). En celular se ve como ícono. En `/metodologia` el botón queda marcado.
- `public/logo.png`: el logo del equipo con fondo transparente (160 px). Lo genera
  `python scripts/logo.py ../logo.jpeg`: quita el blanco del fondo sin tocar el vidrio de la lupa.
- Tipografía **Fraunces** (`@fontsource-variable/fraunces`, solo el subset italic WONK, ~46 KB)
  para la palabra «Detective» de la marca.
- Textos (ES/EN): lema de la marca, «Ver la metodología completa», «(página actual)» y una línea por
  sección del menú (`menuD`). `SECCIONES_METODOLOGIA` en `src/i18n/textos.ts`.

## Cambiado
- `src/components/Cabecera.tsx`:
  - marca con logo, «Detective» en Fraunces y lema;
  - variable (con íconos) y perfil agrupados en rieles;
  - idioma como selector `ES | EN` que resalta el idioma actual (`aria-pressed`);
  - tema con sol o luna según el tema real, solo con CSS (`@custom-variant oscuro` en `src/index.css`);
  - fondo translúcido con desenfoque y una franja superior con los colores de los datos;
  - selectores de Zustand por campo: el estado del mapa (Play, giro) ya no vuelve a dibujar la cabecera.
- `src/app/App.tsx`: con `#ancla` en la URL no vuelve arriba al cambiar de pantalla.
- `Metodologia.tsx`: margen de scroll en los títulos para que la cabecera fija no los tape (más alto en
  celular, donde la cabecera tiene 2 filas).
- Pruebas: los e2e usan el nuevo selector de idioma y el menú. Hay 2 pruebas nuevas: el idioma actual
  queda marcado y cada sección del menú tiene su ancla en la página.

## Integración con #37 y `developer`
- Trae `developer` al día (#34, #35 y #40) y la rama de #37 (`fix/boton-idioma`), según el orden que pidió
  Leandro. Cuando #37 entre a `developer`, esta PR queda sin conflictos.
- El selector `ES | EN` llama a `setIdioma` de `useBusqueda` (#37): el idioma queda en la URL (`?lang=en`).
- El logo y los enlaces del menú de Metodología conservan `lang`.
- Se resolvió el conflicto en `lib/busqueda.ts`: quedan `setIdioma` (#37) y `seleccionar(zona, desdeMapa)` (#35).
- El e2e de `?lang=en` (#37) usa el selector segmentado (`Español` / `English`).
- A 320 px la cabecera ya no cae a una tercera fila: bajo 360 px queda solo el logo (el nombre sigue en
  el `aria-label`). Medido: 117 px de alto a 320, 360 y 390 px, y 71 px a 1440 px.

## Comprobado
- `pnpm lint`, `pnpm test`, `pnpm build` y `pnpm e2e` en verde.
- En el navegador:
  - escritorio (1440 px) y celular (390 px);
  - tema claro, tema oscuro y tema del sistema;
  - el menú desde `/explorar` y desde `/metodologia`, que baja a la sección sin que la cabecera la tape.
