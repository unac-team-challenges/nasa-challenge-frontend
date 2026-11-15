# fix/favicon-transparente

## Cambiado
- `public/favicon.ico`: fondo transparente; 16, 32 y 48 px rasterizados desde el SVG, cada uno a su
  resolución real.
  Antes era un recorte del JPEG y salía con fondo blanco en la pestaña.

## Agregado
- `scripts/favicon.py`: regenera `favicon.ico` desde el SVG (`python scripts/favicon.py`; requiere Pillow y `rsvg-convert`). README actualizado.
- `public/favicon.svg`: logo simplificado (lupa, Perú rosa/teal y órbita) con hex fijos muestreados de `logo.jpeg`; aro más claro en tema oscuro,
  contorno blanco para pestañas oscuras y órbita más gruesa para que se lea a 16 px.
- `index.html`: `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` para navegadores modernos.
