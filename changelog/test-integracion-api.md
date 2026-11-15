# test/integracion-api

## Añadido
- `src/api/integracion.test.ts`: prueba contra la API real del backend (`datosDeApi`, `detalleDeApi`). Confirma las 25 zonas con tendencias, que la lluvia llega en mm/año (la API da mm/día) y que la temperatura llega en °C. Si el contrato se rompe, falla en vez de caer en silencio a la copia local.
- Se salta sola si `VITE_API_INTEGRACION` no está definida: `pnpm test` y el CI no cambian.

## Cómo correrla
```bash
# en nasa-challenge-backend
cargo run
# en nasa-challenge-frontend
VITE_API_INTEGRACION=http://localhost:3000 pnpm test
```

## Pendiente
- Correrla en CI: necesita descargar el backend (repos privados → token entre repos).
