# Tarea frontend: Olmos en el Caso 2 (con su aviso visible)

Viene de las PR #56 y #58 del backend (ya fusionadas en `developer`). El backend sirve Olmos desde `GET /api/vegetacion`, pero el frontend todavía no lo muestra. Este documento dice qué hay que hacer y qué no se puede saltar. Está escrito contra `origin/developer` del frontend (15-nov-2026).

## Qué hay hoy en el frontend

- **El contrato ya está.** La PR #28 (`chore/contrato-vegetacion`) añadió `GET /api/vegetacion` a `src/api/openapi.json` y `schema.d.ts`. Los tipos traen `tipo`, `unidad_geografica`, `serie` y `stats` con `aviso?`.
- **Se lee, pero solo en parte.** `vegetacionDeApi()` (`src/api/consultas.ts`) y el hook `useVegetacion()` (`src/hooks/useVegetacion.ts`) devuelven por ubigeo solo `{areaAntes, areaDespues, sen}`. **Descartan** `aviso`, `status`, `tipo`, `unidad_geografica` y la `serie`.
- **El Caso 2 sigue anclado a la copia local.** `AntesDespues` (`src/features/ficha/components/AntesDespues.tsx`) hace `const local = VALLES[departamento]; if (!local) return null`, y `VALLES` (`src/features/ficha/data/caso2.ts`) solo tiene Chavimochic (13) e Ica (11). La API solo pisa las cifras (`{ ...local, ...api }`). **Aunque la API devuelva Olmos, la ficha de Lambayeque (14) no muestra nada.**
- **No hay imagen de Olmos.** El deslizador usa `public/caso2/<imagen>_2001.png` y `_2024.png`, y solo existen los de Chavimochic e Ica.
- **El aviso de la vegetación no se muestra en ningún lado.** `Ficha.tsx` enseña `d.motivo` (con `t.avisoFijo`) solo en el bloque de estadísticas de lluvia y temperatura. Hoy `avisoFijo` en `src/i18n/textos.ts` solo conoce la regla `lag1 > 0.5`.

## Qué sirve el backend para Olmos

`GET /api/vegetacion` devuelve un arreglo con 3 zonas: `chavimochic`, `ica-villacuri` y `olmos`. Contrato en `openapi.json` y en `docs/vegetacion.md` del backend.

Olmos (`ubigeo: "14"`, departamento Lambayeque):

| Campo | Valor |
|---|---|
| `tipo` | «riego nuevo y bosque seco» |
| `unidad_geografica` | «recuadro de 0,25° × 0,25° (~27 × 27 km) sobre las tierras nuevas del proyecto, que mezcla riego y bosque seco; no es el promedio del departamento» |
| `serie` | `[{anio, ndvi_anual, area_verde_km2}]`, 2001–2024 |
| NDVI | 0,224 (2001) → 0,331 (2024) |
| `area_verde_km2` | 124,5 (2001) → 419,0 (2024) |
| `stats.status` | `real` (Sen +0,081 por década, IC [0,025; 0,129], q ≈ 0,0001) |
| `stats.aviso` | texto largo, **obligatorio de mostrar** (ver abajo) |

Texto del aviso (en español, tal como lo manda la API):
«Recuadro movido después de descartar el del Lab 3 (caía sobre bosque seco y no tenía tendencia). Mezcla tierras de riego con bosque seco, y la subida pesa mucho en los años de El Niño (2015–2017 y 2023): sin ellos, el rango probable incluye 0.»

## Qué hay que hacer

1. **Subir lo que se descarta en `vegetacionDeApi`.** Añadir `aviso`, `tipo`, `unidad_geografica` y `status` al `ValleApi`, y la `serie` si se hace el gráfico (punto 6). Actualizar `consultas.test.ts` e `integracion.test.ts`.
2. **Dejar de depender de `VALLES` para saber si hay Caso 2.** Que Olmos (ubigeo `14`) aparezca por venir de la API, sin cifras a mano. Para Olmos no hay copia local: sin API, no se muestra (y no se inventan valores). Chavimochic e Ica siguen con su copia como respaldo.
3. **Mostrar `stats.aviso` en la ficha de Olmos, visible sin hacer clic.** Es el punto central: Olmos sale `real`, pero la tendencia depende de los años de El Niño y sin 2015–2017 y 2023 el intervalo incluye 0. Si la ficha solo muestra «real», el mensaje engaña.
4. **El aviso tiene que verse también en inglés.** Con idioma inglés el backend lo manda en español (ver `changelog/fix-aviso-en-ingles.md`), y `avisoFijo(variable, lag1)` no sirve para este aviso. Añadir la traducción del aviso de Olmos por zona en `src/i18n/textos.ts` y un test en `src/i18n/aviso.test.ts`. Alternativa sin duplicar texto: que la API mande un código además del texto (cambia el contrato; habría que pedirlo al backend).
5. **Mostrar `unidad_geografica` y `tipo`.** Son la aclaración de que es un recuadro sobre tierras nuevas, no el departamento ni un valle irrigado. No hay que escribir «valle irrigado» para Olmos en ningún texto (`cmpH`, `cmpTexto`, `cmpCap`…).
6. **Sin imagen de Olmos, no usar el deslizador.** No inventar PNG. Opciones: (a) gráfico de la `serie` (NDVI o `area_verde_km2` por año, con 2015–2017 y 2023 marcados como El Niño), o (b) pedir las imágenes a Favio. Recomiendo (a), porque además deja ver el efecto de El Niño.
7. **No presentar un «×10».** Los extremos de la API dan 124,5 → 419 km² (≈ ×3,4); el «35 → 341 km²» son promedios de períodos. `cmpTexto` debe usar los extremos de la serie.
8. **Lluvia y temperatura no cambian.** Solo toca el Caso 2 y lo de vegetación.

## Criterio de «hecho»

- [ ] La ficha de Lambayeque muestra Olmos con sus cifras de la API.
- [ ] `stats.aviso` se ve en español **y** en inglés, sin interacción.
- [ ] Se ve `unidad_geografica` y ningún texto de Olmos dice «valle irrigado».
- [ ] No hay cifras de Olmos escritas a mano en el código.
- [ ] Hay tests que fallan si el aviso desaparece: `consultas.test.ts` (el cliente lo conserva), `pantallas.test.tsx` (la ficha lo muestra) y `i18n/aviso.test.ts` (versión en inglés).
- [ ] `pnpm lint && pnpm test && pnpm build` en verde. Respetar `ARQUITECTURE.md`: imports con `@/`, sin barrel files, la feature `ficha` no importa de otra feature.
- [ ] `changelog/<rama>.md`, PR a `developer`, CI en verde.

## Referencias

- Backend: `docs/vegetacion.md`, `openapi.json`, `data/ndvi.json`, PR #56 y #58.
- Frontend: PR #28 (contrato de `/api/vegetacion`).
