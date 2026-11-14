# feat/mapa2d

PR: base `feat/explorador` (#3); se mezcla después de #1 → #2 → #3.

## Añadido
- `src/mapa/Mapa2D.tsx`: mapa del Perú en SVG con el mismo semáforo por forma que el 3D (color pleno = cambio real, rayado = posible casualidad, contorno punteado = pocos datos). Zona elegida con borde de acento; se elige con clic o con el teclado (Tab + Enter o Espacio); cada departamento tiene su `aria-label` ("Piura, +45 mm por década, cambio real") y un globo al pasar el puntero.
- Explorador: selector **3D / 2D**. En 2D, el 3D se desmonta (libera la tarjeta gráfica) y se desactivan "girar" y "recentrar".
- **Respaldo automático sin WebGL**: el explorador muestra el 2D con el aviso "Tu navegador no muestra 3D…" y sin el selector; la portada muestra el 2D solo para mirar y sin la leyenda "Arrastra para girar".
- `src/lib/webgl.ts`: detección de WebGL. **`?sinwebgl` en la URL** simula un navegador sin 3D, para probar el respaldo.
- Estado: `conWebgl` y `modoMapa` en Zustand.

## Pendiente
- Ranking, máquina del tiempo, expedientes, "¿Coinciden dos fuentes?", Caso 2 y paletas.
