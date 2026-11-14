# feat/maquina-tiempo

PR: base `feat/datos-reales` (#5); se mezcla después de #1 → … → #5.

## Añadido
- `src/components/BarraTiempo.tsx`: **máquina del tiempo** del prototipo. Barra vertical pegada al borde derecho del mapa con:
  - botón **Tendencia** (vuelve a la vista de tendencia);
  - el año en grande;
  - **riel de franjas** del Perú (una por año, con el más reciente arriba; cada franja lleva a su año);
  - **deslizador** vertical accesible (`aria-valuetext`);
  - **Play / Pausa**: avanza un año cada 850 ms y se detiene al llegar al final.
- Modo año en la **escena 3D**: cada departamento sube o se hunde según cómo fue ese año frente a su propio promedio (lluvia en %, temperatura en °C), con color de anomalía y etiquetas con el valor del año. En modo año las columnas se mueven más lento (interpolación 0,07 por cuadro), así el Play se ve como una ola continua.
- Modo año en el **mapa 2D** (color y `aria-label` del año), en la **leyenda** (columnas "más/menos que su promedio" y escala) y en el **gráfico** de la ficha (línea punteada y círculo en el año).
- `anomaliasAnio()` en `src/data/datos.ts`: escala al percentil 95, para que un año extremo (El Niño 1998) no aplaste al resto.
- Estado `anio` y `reproduciendo` en Zustand. Al cambiar de periodo se vuelve a la tendencia.

## Cambiado (después)
- Se quitó el selector "Desde 1981 / Desde 2001" de la cabecera: solo la tendencia 1981–2024 (decisión de Favio).
