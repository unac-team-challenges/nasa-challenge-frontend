# fix/logo-base-url

## Corregido
- El logo de la cabecera usa `import.meta.env.BASE_URL` (como las imágenes del Caso 2 y el suelo del mapa) en vez de `/logo.png`. Hoy no cambia nada, porque `vite.config` no define `base`; si el sitio se despliega en una subruta, el logo ya no se rompe.

## Notas
- Una línea en `Cabecera.tsx`. Sin dependencias nuevas.
