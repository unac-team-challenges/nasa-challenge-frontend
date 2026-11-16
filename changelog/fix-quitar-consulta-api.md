# fix/quitar-consulta-api

## Quitado
- Ficha del Estudiante, bloque «Reprodúcelo» / «Reproduce it»: se quita la consulta `GET /api/zonas/{id}?variable=` con su botón de copiar. La API no se da a conocer; el bloque queda solo con los enlaces a los repositorios (backend y frontend).
- Textos `reproApi` y `reproSinApi` en `textos.ts` y `es.ts`.

## Notas
- Base `developer`. `tsc`, `eslint` y `pantallas.test.tsx` (19) pasan.
