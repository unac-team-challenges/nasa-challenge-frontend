# feat/caso2-antes-despues

PR: base `feat/animaciones-mapa` (#7); se mezcla después de #5 → #6 → #7.

## Añadido
- `src/components/AntesDespues.tsx`: **Caso 2, "la costa que reverdece"**, con `react-compare-slider`. Aparece en la ficha de **La Libertad (Chavimochic)** e **Ica (Villacurí)**: imagen real de NDVI de MODIS MOD13A3 (1 km) de 2001 frente a 2024, etiquetas de año, escala de color y la cifra del área verde.
- `public/caso2/*.png` (4 imágenes de ~5 KB) y `src/data/caso2.ts`: cifras del Lab 3 de Favio (backend #25). Chavimochic: 189 → 355 km² (+88 %); Ica: 118 → 222 km² (+88 %). Las dos tienen tendencia significativa (TFPW + Sen, lab5 de Josue).
- Textos en ES y EN (`cmp*` en `textos.ts`).
