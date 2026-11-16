# feat/fuente-datos

PR: base `developer`.

## Agregado

- `VITE_FUENTE_DATOS=local`: fuerza la copia local (`src/data`) aunque `VITE_API_URL` esté puesta. Vacío = comportamiento de siempre (API con la copia local de respaldo).
- `.env.example` y README explican las dos fuentes (API y copia local) y las dos variables.

## Cambiado

- `src/api/cliente.ts`: `hayApi` es falso también cuando `VITE_FUENTE_DATOS=local`. Todas las consultas a la API ya salían por `hayApi`, así que no hay más cambios.

## Notas

- Las variables `VITE_` se leen al compilar: cambiarla en Vercel exige un nuevo despliegue.
