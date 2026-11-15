# fix/favicon-transparente

## Cambiado
- `public/favicon.ico`: fondo transparente. 16 y 32 px son pixel art alineado a la grilla (un color
  sólido por píxel, órbita de 1 px, Perú más grande a 16 px), así se ven nítidos; 48 px sale del SVG.
  Antes era un recorte del JPEG y salía con fondo blanco en la pestaña.

## Agregado
- `scripts/favicon.py`: regenera `favicon.ico` desde la geometría del SVG (`python scripts/favicon.py`).
- `public/favicon.svg`: logo simplificado (lupa, Perú rosa/teal y órbita) con hex fijos muestreados de `logo.jpeg`; aro más claro en tema oscuro,
  contorno blanco para pestañas oscuras y órbita más gruesa para que se lea a 16 px.
- `index.html`: `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` para navegadores modernos.
