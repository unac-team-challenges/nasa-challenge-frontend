# feat/informe-celular

## Agregado
- **Barra fija de la zona en celular (≤ 900 px).** Al bajar por el informe, cuando el nombre grande sale de la pantalla, aparece una barra con la zona, cuánto cambió por década y el semáforo, más un botón «Mapa» que sube al mapa. Se pega justo debajo de la cabecera y sigue su borde real (la cabecera se esconde al bajar y vuelve al subir). En escritorio no aparece. Está en `src/app/rutas/BarraZona.tsx`.

## Cambiado
- **Bloques de la ficha más livianos en celular.** Las 15 cajas con borde (`rounded-m border border-line p-3.5`) pasan a la clase `.bloque-ficha`: en escritorio siguen siendo caja, y en celular se ven como una línea arriba, sin caja.
- **«Antes / Ahora» de los años malos.** Las columnas usan `minmax(0,1fr)` y la cifra baja a 19 px bajo 420 px, con `text-balance`: «Uno cada 2 o 3 años» ya no se parte en 3 líneas.
- **Gráficos de la ficha más altos en celular.** `GraficoSerie` y `GraficoAnomalias` pasan a 400/270 bajo 480 px, y la etiqueta «El Niño» sube de 10 a 11 px.

## Notas
- La barra necesita `IntersectionObserver`. Sin él (navegadores viejos o jsdom), no aparece y nada se rompe.
- e2e nuevo en `celular.spec.ts`: la barra aparece al bajar y «Mapa» vuelve arriba.
