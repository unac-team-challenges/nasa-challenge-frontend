# feat/explorador

PR: base `feat/portada-mapa3d` (#2); pasa a `developer` cuando #1 y #2 se mezclen.

## Añadido
- `src/components/Explorador.tsx`: explorador como en la v10. El mapa abre a todo el ancho con el informe minimizado ("Toca una zona"); al tocar un departamento, el informe se abre solo. También: título y subtítulo del mapa, aviso "sin El Niño", botones de girar y de volver a la vista inicial, e informe minimizable a una franja con la zona y su valor.
- `src/components/Ficha.tsx`: ficha de zona con tipo de departamento, fuente, semáforo con texto, frase según el perfil, cifra por década con rango probable, gráfico, "Quitar los años de El Niño", pista "sube aquí, baja allá" (con botón para ir a esa zona), "Cómo lo sabemos" (abierto para el perfil estudiante) y el aviso de que no es un pronóstico. Sin zona elegida, muestra "Toca un departamento". Fundido de 220 ms al cambiar de zona.
- `src/components/GraficoSerie.tsx`: serie 2000–2025 en SVG portada del prototipo (puntos, tendencia de Sen, banda del rango, años de El Niño).
- `src/components/Leyenda.tsx`: leyenda ilustrada y plegable (cerrada en celular).
- Cabecera: selector de variable (Lluvia / Vegetación) y de perfil; en celular, tira deslizable en una segunda fila.
- `src/lib/ruta.ts` (rutas por hash: `#inicio`, `#explorar`), `src/lib/useZonas.ts` (punto único para cambiar los datos de ejemplo por la API) y `src/lib/formato.ts`.
- Escena 3D: modo explorador (cámara desde arriba), elegir con un toque, zona elegida elevada con borde de acento y etiqueta, vuelo de cámara, giro que se pausa al tocar el mapa.

## Notas
- El gráfico es SVG propio y no Recharts (más liviano y fiel al diseño). Si el equipo prefiere Recharts, se cambia solo `GraficoSerie`.
- Rutas por hash como el prototipo; TanStack Router + Zod queda para cuando haya más pantallas.

## Pendiente
- Expedientes 1 y 2, Mapa2D en SVG, ranking, máquina del tiempo, "¿Coinciden dos fuentes?", antes y después (Caso 2), paletas, lluvia viva y montañas.
