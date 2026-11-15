# fix/favicon-transparente

## Cambiado
- `public/favicon.ico`: regenerado desde vector con fondo transparente (16, 32 y 48 px).
  Antes era un recorte del JPEG y salía con fondo blanco en la pestaña.

## Agregado
- `public/favicon.svg`: logo simplificado (lupa, Perú rosa/teal y órbita) con hex fijos muestreados de `logo.jpeg`; aro más claro en tema oscuro,
  contorno blanco para pestañas oscuras y órbita más gruesa para que se lea a 16 px.
- `index.html`: `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` para navegadores modernos.
