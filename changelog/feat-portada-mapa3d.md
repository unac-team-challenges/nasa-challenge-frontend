# feat/portada-mapa3d

PR: base `feat/base-frontend` (#1); pasa a `developer` cuando #1 se mezcle.

## Añadido
- `src/mapa/escena.ts`: escena three.js portada del prototipo v2. Columnas por departamento con altura según `slope_per_decade`, color pleno para "real", rayado para "posible casualidad" y tenue para "pocos datos"; cielo, piso con curvas de nivel, sombras, giro automático, resaltado al pasar el puntero, etiquetas flotantes (6 zonas clave y "Océano Pacífico").
- Ajustes de rendimiento del prototipo (v13): sombras solo cuando cambian las alturas, nitidez máxima de 1,5, no dibuja fuera de pantalla y baja la resolución si va a menos de ~40 fps.
- `src/mapa/Mapa3D.tsx`: componente React que crea y destruye la escena, y le pasa datos, tema e idioma. Sin WebGL, muestra un aviso.
- `src/components/Portada.tsx`, `Cabecera.tsx` y `FranjasPeru.tsx`: portada del prototipo (pregunta, franjas 2000–2025, 4 perfiles, "Explorar el mapa"), con cambio de idioma (ES/EN, también `?lang=en`) y de tema.
- `src/data/departamentos.json` (25 departamentos, del prototipo) y `src/data/ejemplo.ts`: datos de EJEMPLO con la forma del contrato (`slope_per_decade`, `p_value`, `q_value`, `status`…) y Benjamini-Hochberg.
- `src/store.ts` (Zustand: idioma, perfil, variable, tema), `src/i18n/textos.ts` y `src/lib/color.ts`.
- `src/index.css`: tokens completos de Humboldt claro y oscuro.

## Notas
- Para que los colores se vean como en r128, la escena desactiva la gestión de color de three.js y multiplica las luces por π.
- El bundle pesa ~246 KB gzip, casi todo three.js. Se puede cargar aparte más adelante.

## Pendiente
- Explorador (mapa + ficha), Mapa2D en SVG, ranking, máquina del tiempo, lluvia viva, montañas, límites, paletas Andes/Amazonía/Nazca y expedientes.
- Cambiar los datos de ejemplo por los del backend cuando existan las tendencias.
