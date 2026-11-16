# Olmos en el Caso 2: hecho

Esta tarea (PR #56 y #58 del backend) se cerró con `changelog/feat-olmos-y-selva.md`. Este documento queda como registro de lo que se pidió, lo que se hizo y en qué se desvió. Revisado contra `origin/developer` (15-nov-2026).

## Qué se pidió y cómo quedó

| Pedido | Estado |
|---|---|
| Olmos (ubigeo `14`, Lambayeque) en el Caso 2 | Hecho, con las cifras de la API (`/api/vegetacion`). |
| Mostrar `stats.aviso` sin hacer clic | Hecho: `Aviso.tsx` («Léelo con cuidado»), en los dos perfiles. |
| El aviso también en inglés | Hecho: copia traducida en `caso2.ts` (en español manda la API). |
| Mostrar que es un recuadro, no el departamento | Hecho: `cmpUnidad` en la ficha, texto fijo. |
| No decir «valle irrigado» de Olmos | Hecho: no se le atribuye el verde al riego (`CAUSA_VERDE` solo tiene Chavimochic e Ica). |
| No presentar un «×10» | Hecho: 125 → 419 km² (≈ ×3,4), extremos de la serie. |
| Pruebas que fallan si el aviso desaparece | Hecho: `Selva.test.tsx`, `consultas.test.ts`, `e2e/tiempo-caso2.spec.ts`. |

## Dónde se desvió de lo pedido

- **Imágenes en vez de gráfico.** Se generaron `public/caso2/olmos_{2001,2024}.png` con el mismo script y escala que Chavimochic e Ica (`labs/lab3_imagenes_caso2.py`), así que el deslizador sirve y no hizo falta graficar la `serie`.
- **Copia local con cifras.** `caso2.ts` trae Olmos (125 → 419 km², Sen 0,081) como respaldo, igual que Chavimochic e Ica: sin API o en inglés se usa esa copia. Así Olmos se ve aunque la API esté caída.
- **`tipo` y `unidad_geografica` de la API no se leen.** La ficha usa el texto fijo `cmpUnidad`. Si el backend cambia la descripción del recuadro, hay que actualizarlo a mano.

## Referencias

- Backend: `docs/vegetacion.md`, `openapi.json`, `data/ndvi.json`, PR #56 y #58.
- Frontend: PR #28 (contrato de `/api/vegetacion`), `changelog/feat-olmos-y-selva.md`.
