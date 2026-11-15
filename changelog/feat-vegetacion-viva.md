# feat/vegetacion-viva

El modo Vegetación al nivel de lluvia y temperatura, o más: relieve real, las 3 regiones, plantas de cada
zona y animaciones fluidas. Incluye la leyenda compacta del PR #70 (se fusionó aquí para revisar un solo PR).

## Mapa de Vegetación (3D)
- **Relieve real sobre el nivel del mar**: al entrar al modo, las columnas bajan a la altitud media de su
  departamento y sube el relieve del Perú (SRTM, la misma textura del suelo vecino, ×25), pintado con el NDVI
  de MODIS por celda. Los vecinos suben igual: no hay escalón en la frontera.
- **Costa, sierra y selva con los datos**: la costa sale como la franja baja y seca, la sierra como los Andes
  y la selva como el llano verde. Nombres de las 3 regiones sobre el relieve y la parte de cada una en la ficha.
- **Plantas de cada zona** (`escena/bosque.ts`), plantadas con el NDVI y la altitud reales de cada celda:
  cactus, algarrobos (norte) y huarangos (sur) en la costa; parcelas de cultivo en los valles regados
  (Chavimochic, Ica, Olmos); molles y árboles de yunga en los valles andinos; ichu, queñuas y puyas de
  Raimondi en la puna; selva con gigantes emergentes y aguajes en la Amazonía. Siempre salen igual
  (semilla fija).
- **Bordes de departamento sobre el relieve** y el departamento bajo el puntero o elegido, resaltado.
- **Ficha al pasar el puntero**: NDVI medio, nivel (desierto … bosque denso), % de costa/sierra/selva,
  altitud media y celdas. Antes no había ficha en este modo.
- La fauna se esconde en el modo (anda sobre las columnas); vuelve al salir.

## Animaciones
- **Fundido de color** entre modos (lluvia ⇄ temperatura ⇄ vegetación): las tapas pasan del color anterior al
  nuevo en 0,75 s en vez de saltar.
- El relieve sube en 1,4 s y baja en 0,9 s; las plantas crecen con un rebote suave en una ola de norte a sur y
  se mueven con el viento. Todo en la GPU (el CPU sube 3 números por cuadro).
- **Interpolaciones por tiempo, no por cuadro**: alturas, corrimiento y brillo se ven igual a 30, 60 o 120
  cuadros/s (antes iban más rápido en pantallas de 120 Hz y más lento con la ventana sin foco).
- Las mallas de cada modo se guardan: volver a un modo es inmediato y nunca se ve la malla del modo anterior
  mientras llega la nueva. La de vegetación se adelanta al abrir el explorador.
- Con «reducir movimiento» todo cambia de golpe y sin viento.

## Datos reales del backend
- La malla de **lluvia** también llega de `GET /api/celdas?variable=lluvia` (antes solo la copia local; son los
  mismos números, comprobado celda a celda). Vegetación y temperatura ya venían de la API.
- La copia local de vegetación es idéntica a `data/celdas/vegetacion.json` del backend #73 (2001–2024). El
  backend desplegado hoy sirve 2001–2012 hasta que se mezcle #73: la leyenda muestra los años que lleguen.

## Leyenda
- Nueva parte «Relieve y regiones» (solo 3D): las 3 regiones, qué es el relieve y qué plantas hay.

## Pruebas
- `bosque.test.ts`: qué planta crece en cada zona, las 3 regiones, ubicar un punto en su departamento y
  semilla fija.
- lint, build, 144 unitarias y 65 e2e en verde (las de `cabecera-oculta` fallan a veces en paralelo por
  tiempos; solas pasan).
