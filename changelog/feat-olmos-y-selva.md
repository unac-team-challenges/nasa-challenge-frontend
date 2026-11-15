# feat/olmos-y-selva

Pendientes de Leandro: el 2 del #56 (que el aviso de Olmos se vea en la ficha) y el 4 del #57 (frontend de la selva).

## Qué cambia
- **`pnpm gen`:** `src/api/openapi.json` y `schema.d.ts` traen `GET /api/cobertura-arboles` (copia del `openapi.json` de `developer` del backend).
- **Olmos en el Caso 2** (Lambayeque, ubigeo 14):
  - entra en `caso2.ts`, con 125 → 419 km² de área verde (2001 → 2024);
  - imágenes `public/caso2/olmos_{2001,2024}.png`, generadas con el mismo script y la misma escala que Chavimochic e Ica (`labs/lab3_imagenes_caso2.py`, ahora con Olmos).
- **El aviso a la vista** (`Aviso.tsx`): el Caso 2 y la selva muestran `stats.aviso` debajo de la cifra, con la etiqueta «Léelo con cuidado», siempre visible.
  - En español manda el aviso de la API. Sin API o en inglés se usa la copia traducida de `caso2.ts` / `selva.ts`.
  - `vegetacionDeApi` ahora trae el `aviso`.
- **Árboles de la selva** (`Selva.tsx`, MODIS MOD44B), en la ficha de Madre de Dios y Loreto:
  - el % del suelo con árboles en 2001 y 2024 (barras en la misma escala de 0 a 100), el estado y la tendencia en puntos por década;
  - **La Pampa** (17): 74 % → 46 %, de 725 a 462 km² de bosque, con su aviso del quiebre de 2009;
  - **Iquitos** (16): «no distinguible de 0», no «estable», sin destacar el área (está en el tope);
  - `coberturaDeApi()` + `useCobertura()` con la copia local `selva.ts` (mismo patrón que el Caso 2);
  - se muestra desde `AntesDespues` cuando el departamento no tiene valle, así que `Ficha.tsx` no cambia.
- **Metodología:** una fila de fuentes nueva, «Árboles de la selva» (MOD44B, 250 m, 2001–2024).

## Pruebas
- `consultas.test.ts`: el aviso de Olmos en `vegetacionDeApi` y 3 casos de `coberturaDeApi`.
- `Selva.test.tsx` (6), con la copia local:
  - Olmos con sus cifras, su aviso y su imagen;
  - Chavimochic sin aviso;
  - La Pampa con el aviso de 2009;
  - Iquitos «no distinguible de 0» y sin «estable»;
  - el aviso en inglés;
  - un departamento sin valle ni selva.
- `e2e/tiempo-caso2.spec.ts`: Lambayeque entra en el Caso 2; Madre de Dios muestra la selva con su aviso; Amazonas no muestra ninguno de los dos.
