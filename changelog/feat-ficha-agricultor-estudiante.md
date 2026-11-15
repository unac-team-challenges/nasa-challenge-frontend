# feat/ficha-agricultor-estudiante

PR: base `developer`. Solo frontend; no toca el contrato (`openapi.json`).

## Cambiado
- La ficha de cada departamento cambia según el perfil, **con el mismo dato**: tendencia, confianza, serie,
  verdor y fuentes se cuentan en palabras de campo para el agricultor y con la estadística para el
  estudiante. `Ficha.tsx` arma los bloques; cada uno (`Tendencia`, `Confianza`, `SerieZona`…) tiene sus dos
  versiones.
- Gráficos con Recharts (ya estaba en las dependencias): medidor de tendencia (lluvia en % de su promedio,
  misma escala para los 25), barras «cada año frente a lo normal», serie con recta de Sen y rango probable,
  dos fuentes con bigotes del IC y ranking de los 25 departamentos. Leyenda, globo al pasar el puntero,
  El Niño etiquetado y animación que respeta «reducir movimiento».
- «La costa que reverdece» pasa a «No todo cambio es el clima» donde el riego está documentado (La Libertad
  e Ica, con su fuente). Olmos, que mezcla riego y bosque seco y depende de El Niño, solo muestra sus cifras
  y su aviso, sin atribuir la causa. El aviso del recuadro y el bloque de la selva (de developer) se mantienen.

## Añadido
- Agricultor: «¿Los años secos vienen más seguido?» (casillas por año), «¿Qué trae El Niño aquí?»,
  «Un año normal aquí» (también en m³ por hectárea) y «Dónde seguir» (SENAMHI, ENFEN).
- Estudiante: «¿Se sostiene el resultado?» (2 periodos × con y sin El Niño), «Frente a los 25
  departamentos», ficha técnica ampliada, limitaciones, tabla de los 25 en CSV, figuras en SVG/PNG, cita en
  APA y BibTeX y cómo reproducirlo con la API.
- «Posibles causas y consecuencias» en las dos fichas, solo lo documentado y siempre con fuente:
  Lavado y Espinoza (2014), Sulca et al. (2018), Vuille et al. (2018), Smith et al. (2023), INAIGEM (2023),
  IPCC AR6 cap. 12, OPS (2017), Damonte et al. (2016) y la memoria de Chavimochic
  (`features/ficha/data/causas.ts`).
- Cálculos con tests en `features/ficha/utils/` (`serie.ts`, `campo.ts`, `estudiante.ts`) y `data/causas.ts`.

## Corregido tras la revisión técnica
- La recta de Sen del gráfico usa el `intercept` del pipeline (nuevo campo de `Zona`, también desde la API); antes pasaba por el promedio.
- Con «posible casualidad» el agricultor ve «No se ve un cambio claro…» en gris, sin cifra con dirección; el sello «Seguro» es «Cambio claro». Las causas con sentido (bosque, calentamiento, menos agua…) solo salen si el cambio es real; si no, queda el contexto y un aviso.
- «Años secos/calurosos» se miden contra el promedio de la primera mitad (línea base fija) y se comparan por proporción; «¿Qué trae El Niño?», contra la recta de Sen.
- Enlace de la cita: «a esta zona, variable y año» (no guarda periodo ni «sin El Niño»; sigue el año al mover la barra). Año de la cita tomado de los datos; BibTeX en `@misc`.
- CSV con BOM (Excel) y celdas vacías, no ceros, para zonas sin datos. Quitado `placeholderData` de `useDetalle` (mostraba la serie de otra variable).
- Figuras SVG/PNG con la fuente de la interfaz incrustada y el fondo del panel; un solo `xmlns`.
- Fuentes contrastadas con el original: APA completas (Vuille, IPCC, Smith), año de Chavimochic (2020), textos de Sulca, IPCC, OPS y Smith ajustados a lo que dicen; enlace de SENAMHI a `gob.pe/senamhi`.
- Texto del riego (La Libertad, Ica) suavizado: «se explica sobre todo por el riego»; «−0» ya no sale; lista accesible del ranking; contraste de las casillas.
- Tests nuevos: `exportar`, `campo`, `ejes`, `formato`, línea base de años malos, El Niño contra la recta, CSV de zonas sin datos, causas con casualidad.

## Rendimiento
- Arrastrar la barra de tiempo ya no redibuja toda la ficha: `useAnio()` aparte en `lib/busqueda.ts`,
  `useBusqueda()` con selectores, `Ficha` con `memo`, bloques que leen solo lo que usan del store y datos de
  los gráficos memorizados. Medido con React Profiler (modo desarrollo): de ~1380 ms a ~88 ms de render de la
  ficha por paso.

## Tests
- `testTimeout` de Vitest a 15 s: `findBy` espera hasta 5 s y la primera carga de la ficha, con toda la suite
  en paralelo, a veces se pasaba del límite anterior (también 5 s).
- e2e del Caso 2: La Libertad e Ica buscan «No todo cambio es el clima»; Lambayeque, «La costa que reverdece».

## Sin cambios
- Mapa 3D y 2D, leyenda y barra de tiempo (salvo leer el año con `useAnio()`), API y datos.

## Pendiente
- Confirmar la autoría de la cita del proyecto en «Cómo citar» (hoy «UNAC Team Challenges»).
- Los umbrales de año seco (−20 %) y caluroso (+0,3 °C) están en `UMBRAL_MALO`; el equipo puede ajustarlos.
