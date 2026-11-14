# feat/mapa-rendimiento-fauna

PR: base `developer`. Autor: Josue. Revisión: Leandro.

## Resumen

El mapa 3D se trababa porque **dibujaba sin parar aunque nadie lo tocara** y **recompilaba los 25 materiales en cada movimiento del mouse**. Esta rama corrige eso, cambia el piso inventado por un suelo de Sudamérica sobrio hecho con datos reales y agrega **17 personajes de fauna y gente de cada región**, que reaccionan al puntero.

No cambia el contrato de datos, ni las rutas, ni los componentes de React. Todo está en `src/mapa/escena.ts`, más un módulo nuevo (`src/mapa/fauna.ts`), dos texturas y un script.

## Commits

| Commit | Qué hace |
|---|---|
| `perf(mapa): dibujar solo cuando algo cambia y corregir fallos del 3D` | Render bajo demanda, hover barato, caché de colores, resolución adaptativa que sí funciona, altura mínima y etiquetas sin tocar el DOM de más |
| `feat(mapa): suelo de Sudamérica sobrio en un solo shader` | Mar, costa, relieve suave, ríos y fronteras reales en un draw call; reemplaza las sombras PCF y el piso con curvas de nivel inventadas |
| `perf(mapa): lluvia viva y calor que sube animados en la GPU` | Las partículas se mueven en el shader; el CPU ya no las toca cada cuadro |
| `feat(mapa): fauna y gente de cada región, interactivas` | 17 personajes 3D por región y departamento, con dato al pasar el puntero |
| `docs: changelog de la rama` | Este archivo |

## Corregido

1. **Dibujaba siempre.** `setAnimationLoop` renderizaba 60 veces por segundo con el mapa quieto. Ahora se dibuja solo cuando algo cambia: cámara, datos, hover, tema o tamaño. La animación de fondo (giro, lluvia, oleaje y fauna) va como máximo a **30 cuadros/s**, baja a **15** si la ventana no tiene el foco y se detiene con la pestaña oculta o el mapa fuera de pantalla. Al interactuar se usa la tasa completa de la pantalla.
2. **El hover recompilaba los materiales.** `pintar()` corría en cada `pointermove` y marcaba `needsUpdate` en los 25 materiales y en todas las líneas de contorno. Además llamaba a `cssVar()` (`getComputedStyle`) unas 100 veces. Ahora:
   - el hover toca solo 2 materiales;
   - `needsUpdate` se marca solo si cambia la textura o la transparencia;
   - los colores del tema se leen una vez por tema;
   - el raycast se hace como mucho una vez por cuadro.
3. **La protección de rendimiento nunca se activaba en equipos lentos.** Descartaba los cuadros de más de 250 ms (`if (dt < 250)`), justo los de un equipo lento, y medía una sola vez. Ahora la resolución se adapta en forma continua, entre 0,5 y 1,5. El cambio se aplica al empezar el cuadro siguiente, para no dejar el lienzo en blanco un cuadro.
4. **Departamentos que desaparecían bajo el mar.** La escala podía quedar negativa (`PISO + h`, con `h` hasta −3,5 en la máquina del tiempo). Ahora la altura mínima es 0,12.
5. **Detalles de costo:** una línea con su material por cada anillo pasó a ser un `LineSegments` por departamento. Las etiquetas escribían `style.transform` en cada cuadro y ahora solo lo hacen si cambió. `mallas.find()` por etiqueta y por cuadro pasó a ser un `Map`.

## Añadido

### Suelo de Sudamérica (sobrio)

- **Un solo plano, un solo shader y un draw call:**
  - mar con profundidad sugerida, aguas someras junto a la costa, espuma y oleaje suave;
  - tierra con sombreado suave del relieve real;
  - ríos y lagos tenues (Amazonas, Titicaca);
  - fronteras tenues;
  - sombra suave del Perú: su silueta difuminada, calculada una vez en 256 px.
- **Reemplaza dos cosas:** el mapa de sombras `PCFSoftShadowMap`, que tomaba muchas muestras por píxel en pantalla completa, y el piso con curvas de nivel inventadas, que se recalculaba con marching squares en 1024 px en cada cambio de tema.
- **Texturas** precalculadas en `public/mapa/mundo.png` (855 KB) y `public/mapa/mundo2.png` (551 KB). Se generan con `scripts/generar_mundo.py`, que las reproduce byte a byte:

  ```bash
  python3 scripts/generar_mundo.py   # requiere numpy, scipy y pillow
  ```

- **Fuentes:**
  - elevación y batimetría: [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/), que combina SRTM de NASA en tierra con ETOPO1 de NOAA en el mar;
  - fronteras, ríos y lagos: Natural Earth 1:50m (dominio público).

### Lluvia viva y calor en la GPU

Cada partícula guarda su posición (x, z), una fase, una velocidad y su departamento. El shader calcula la altura con el reloj y la altura actual del departamento, así que por cuadro solo se suben el reloj y 25 números. La lluvia se dibuja como gota alargada y el calor como brillo redondo.

### Fauna y gente de cada región

| Región | Personaje (departamento) | Movimiento |
|---|---|---|
| Costa | Pelícano peruano ×2 (Piura, sobre el mar) | Planea por la costa |
| Costa | Caballito de totora con pescador (Huanchaco, La Libertad) | Flota |
| Costa | Agricultor con sombrero y lampa (Ica) | Camina |
| Costa | Pingüino de Humboldt ×3 (Paracas, Ica) | Nada |
| Costa | Lobo marino ×2 (islas Palomino, Callao) | Nada |
| Costa | Caballo peruano de paso con chalán (Lima) | Camina |
| Costa | Cocodrilo americano (Tumbes) | Camina despacio |
| Sierra | Alpaca con borlas ×2 (Puno) | Camina |
| Sierra | Vicuña (Ayacucho) | Camina |
| Sierra | Cóndor andino (Colca, Arequipa) | Vuela en círculos |
| Sierra | Pastora con pollera y montera (Cusco) | Camina |
| Sierra / bosque nublado | Oso de anteojos (Cajamarca) | Camina |
| Selva | Delfín rosado (Loreto) | Salta en arco |
| Selva | Guacamayo escarlata ×2 (Madre de Dios) | Vuela aleteando |
| Selva | Jaguar (Ucayali) | Camina |
| Selva | Gallito de las rocas (San Martín) | Saltitos |
| Selva | Mono choro de cola amarilla (Amazonas) | Saltitos |

- **Interacción:** al pasar el puntero, el personaje salta y aparece un dato corto, en español o inglés según el idioma, siempre como `textContent`. Al tocarlo se elige su departamento en el explorador.
- **Altura del dato:** los personajes van sobre la cara superior de su departamento y suben o bajan con él.
- **Costo:** 17 mallas instanciadas de pocos cientos de triángulos, hechas con primitivas fusionadas y color por vértice, sin archivos. Por cuadro se actualizan unas 22 matrices.
- **«Reducir movimiento»:** quedan quietos.
- **Revisar los datos de cada personaje antes de la demo** (lista `FAUNA` en `src/mapa/fauna.ts`).

## Medido

Medí el mismo diseño en una copia local del prototipo con Chromium y la GPU real de una laptop (AMD Radeon integrada, 1440×900 a escala 1,5):

| Fase | Antes | Después |
|---|---|---|
| Quieto | 53–59 % de CPU del navegador, 61 recálculos de estilo/s | 30–38 % con lluvia, oleaje y fauna en movimiento; 0 recálculos de estilo |
| Mouse sobre el mapa | 60 cuadros/s | 60 cuadros/s |
| Sin GPU (SwiftShader, peor caso) | 4–8 cuadros/s; la resolución nunca bajaba | La resolución baja sola hasta 0,5 |

Con la pestaña oculta o el mapa fuera de pantalla, no se dibuja nada.

## Cómo probar

```bash
pnpm install
pnpm dev   # abrir /#explorar
```

Qué mirar:

- Mover el mouse sobre el mapa: el resaltado es inmediato.
- En pantalla táctil, tocar un personaje: salta y muestra su dato 4 s.
- Pasar el puntero sobre una alpaca (Puno), el cóndor (Arequipa) o un pingüino (frente a Paracas): saltan y muestran su dato.
- En la máquina del tiempo, ningún departamento desaparece bajo el mar.
- Cambiar el tema y el idioma.

`pnpm lint`, `pnpm build` y `pnpm e2e` corren en el CI de la PR: en mi máquina no hay acceso al registro de npm.

## Pendiente (otra PR)

- **Que la fauna reaccione al dato:** por ejemplo, en un año de El Niño los pelícanos se alejan de la costa.
- **Botón para ocultar la fauna** si el jurado quiere ver solo los datos.
- **Revisión de los textos de la fauna** por el equipo.

## Ajustes tras la revisión

- **Táctil:** el dato de la fauna sale al tocar al personaje (antes solo con el puntero encima). Arrastrar con el dedo sigue girando el mapa.
- **i18n:** los textos de la fauna pasaron de `fauna.ts` a `FAUNA_TEXTOS` en `src/i18n/textos.ts`. Cambiar el idioma con el dato abierto lo actualiza.
- **Carga tardía:** si el mapa se cierra mientras carga `mundo.png`, la textura se libera.
