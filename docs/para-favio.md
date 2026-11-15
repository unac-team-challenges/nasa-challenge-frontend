# Para Favio: decisiones de producto y diseño pendientes en el frontend

Revisión del frontend del 14 de nov. Estas cosas no son solo de código: dependen de diseño, de datos o de una decisión tuya. Cada punto dice **qué hay hoy** y **qué necesitamos que respondas**. Si contestas aquí mismo (debajo de cada pregunta), lo convertimos en tareas.

---

## 1. Expedientes (pendiente, hace falta tu definición)

**Qué hay hoy.** Nada. El prototipo v2 tenía rutas `#expediente-1…`; en el código actual esas rutas ya no existen (`src/hooks/ruta.ts` las mandaba al explorador "hasta el otro PR") y `Cabecera.tsx` tenía anotado «Pendiente: el menú de expedientes». En el stack (`07-stack-decidido`) el expediente está como **extra**: «detección automática → expediente», armado con las mismas plantillas de texto.

**Qué necesitamos para hacerlo:**

1. ¿Qué es un expediente exactamente? ¿Una zona con cambio real contada como historia, o un recorrido de varias zonas (como los casos 1 y 2 de la demo)?
2. ¿Cuántos y cuáles? (Piura/Tumbes frente a Puno; la costa que reverdece…)
3. ¿Qué lleva cada uno? (texto, gráfico, mapa recortado, antes/después, enlace a la ficha)
4. ¿Cómo se llega? ¿Menú en la cabecera, tarjetas en la portada, o solo enlaces desde la demo?
5. ¿Hay diseño en Figma? (el boceto v1 de 7 pantallas: ¿incluye expedientes?)
6. Datos: el backend tiene `/api/casos/:id` y `/api/hallazgos` **sin hacer** (dependen de las tendencias). ¿Los escribimos a mano en el frontend por ahora?

Con la URL ya definida en el Drive, un expediente sería un enlace: `/zona/20?perfil=agricultor&variable=lluvia`.

## 2. Buscar y comparar zonas

**Qué hay hoy.** Solo se elige una zona tocando el mapa, o con el botón «sube aquí, baja allá» de la ficha. No hay lista, buscador, ranking ni comparación. (El stack dice que comparar es pedir dos veces `/api/zonas/:id`; `/api/comparar` se quitó.)

**Preguntas:**

- ¿Hace falta un buscador o lista de departamentos (también ayuda a quien no puede usar el mapa con el mouse)?
- ¿Un ranking «las zonas que más cambiaron»? ¿Dónde viviría?
- ¿Comparar dos zonas lado a lado? ¿Es parte del recorrido de la demo o un extra?

## 3. Fuentes mezcladas en la misma pantalla

**Qué hay hoy.** La API solo se usa con la tendencia larga y con El Niño incluido. «Sin El Niño» y la máquina del tiempo siempre salen de la copia local (`useVista` en `src/hooks/useZonas.ts`). Y las dos fuentes no son lo mismo: la lluvia de la API es **GPM IMERG** y la de la copia local es **NASA POWER**. Si alguien marca «sin El Niño» o mueve el año, los números pasan de una fuente a otra sin avisar. (Está explicado en la página de metodología, pero no en el momento en que ocurre.)

**Opciones:**

- a) Mostrar una marca visible («copia local») cuando se cambia de fuente.
- b) Pedir al backend la variante sin El Niño y las anomalías por año, para que todo salga de la API.
- c) Ocultar «sin El Niño» y la máquina del tiempo cuando la fuente es la API, hasta que existan en la API.
- d) Dejarlo así y confiar en la metodología.

**También abierto (del Drive):** el backend dice `mm/día` y la web muestra `mm/año`. Hay que elegir una.

## 4. Vegetación (NDVI): faltan datos

**Qué hay hoy.** La variable NDVI se quitó del selector porque no hay datos reales servidos. Queda solo el Caso 2 con 4 imágenes estáticas (`public/caso2/`: Chavimochic e Ica, 2001 y 2024). `docs/vegetacion.md` del backend resume tu Lab 3:

- Chavimochic e Ica-Villacurí: sí se sostienen (+88 % de área verde).
- **Olmos: sin dato** (el recuadro cayó sobre bosque seco, no sobre las tierras irrigadas). Hay que mover el recuadro y repetir con AppEEARS (~3 h).
- Selva (Iquitos): NDVI saturado, no sirve. Lima: con cautela. Mantaro: solo informativo.
- La variable de vegetación en `pipeline/` está a cargo de Josue, y el `17-decision` deja abierto «Caso 2: decidir con qué variable, sin NDVI».

**Preguntas:**

1. ¿NDVI vuelve como tercera variable del selector, o se queda como Caso 2 con imágenes?
2. Si vuelve: ¿para qué zonas (solo las 2 confirmadas)? ¿Cuándo tendrías los datos de Olmos?
3. ¿El backend lo sirve, o seguimos con PNG estáticos para la demo?
4. ¿Hay más imágenes o años para el antes/después?

## 5. Compartir, descargar o imprimir una ficha

**Qué hay hoy.** Con las rutas nuevas (`/zona/20?variable=…&perfil=…&anio=…`) ya se puede **copiar la URL** y abre la misma ficha, pero no hay botón «Copiar enlace», ni descarga, ni impresión.

**Preguntas:** ¿hace falta botón de copiar enlace? ¿Descargar la ficha como imagen o PDF? ¿Una vista de impresión? ¿Es para el video/entrega o para el usuario final?

## 6. Recordar idioma y tema

**Qué hay hoy.** El idioma solo se lee de `?lang=en` al cargar la página y no se recuerda. El tema (claro/oscuro) tampoco se guarda: al recargar vuelve al del sistema.

**Preguntas:** ¿guardamos ambos en el navegador (localStorage)? ¿El idioma debe ir en la URL para que un enlace compartido se abra en inglés?

---

## 7. Estructura de carpetas del frontend

En el Drive (`07-stack-decidido` y los documentos de decisión) **no encontré el árbol de carpetas del frontend**; solo hay decisiones sueltas: `src/api/openapi.json` + `schema.d.ts`, `src/i18n/textos.ts` (un solo archivo de textos), `public/data/` como plan B con la forma de la API, y los nombres de componentes de Figma (`Mapa`, `FichaZona`, `Semaforo`, `SelectorPerfil`, `GraficoSerie`). Ya hay un árbol acordado y el código lo sigue (detalle y reglas en `ARQUITECTURE.md`):

```
src/
  app/        une features: App, router y rutas/ (Inicio, Explorador)
  features/   mapa/ · ficha/ · tiempo/ · portada/ · metodologia/  (una feature no importa de otra)
  components/ UI compartida (Cabecera, Errores, Esperas); ui/ = shadcn
  hooks/      useZonas, meta, ruta
  lib/        busqueda.ts (Zod + router), utils.ts (cn)
  utils/      funciones puras: color, direccion, formato, webgl
  stores/     app.ts (Zustand global)
  api/        cliente de la API (openapi-fetch) y tipos generados
  data/       copia local de datos (plan B)
  i18n/       textos.ts (es/en)
  testing/    preparación de las pruebas
```

Árbol acordado: ver `ARQUITECTURE.md`.
