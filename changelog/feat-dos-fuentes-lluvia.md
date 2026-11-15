# feat/dos-fuentes-lluvia

PR: base `developer`. Autor: Favio. Va con el PR #53 del backend (`feat/lluvia-power-imerg`).

## Por qué
La web mostraba dos lluvias distintas según por dónde se entraba: la API servía **GPM IMERG** y la copia local, **NASA POWER**. Con el mismo periodo (2001–2024) se contradecían en **13 de 24 departamentos** (Puno: IMERG −91 mm, POWER +141 mm, real). Además, IMERG baja en los 25 departamentos por el cambio de satélites de 2014, y el mapa quedaba entero ocre.

Decisión de producto (opción C): **POWER es la lluvia del mapa e IMERG, la segunda fuente para comparar.**

## Añadido
- **«¿Coinciden dos fuentes de NASA?»** en la ficha de lluvia (`src/features/ficha/components/DosFuentes.tsx`):
  - el modelo (POWER) y los satélites (IMERG), cada uno con su cambio por década, una barra desde el cero (con la misma escala para las dos) y su estado; para el perfil estudiante, también el rango probable;
  - una frase dice si coinciden o no y, si no coinciden, por qué el mapa usa POWER.
- `src/data/imerg.json`: copia local de IMERG (plan B), con los mismos números que `/api/zonas?variable=lluvia_imerg`. Se genera con `python scripts/datos_imerg.py <backend>/data/zonas/lluvia_imerg.json`.
- `imergDeApi()` (`src/api/consultas.ts`) y `useSegundaFuente()` (`src/hooks/useZonas.ts`): usan IMERG de la API si la sesión usa la API y, si no, la copia local. Solo con la tendencia 2001–2024 con El Niño, y **solo si la lluvia principal es POWER**: con el backend viejo, donde la lluvia de la API todavía es IMERG, el bloque no aparece.

## Cambiado
- Contrato: `openapi.json` y `schema.d.ts` con la variable `lluvia_imerg` (del PR #53; se conservan las rutas de vegetación).
- Textos (ES/EN):
  - el aviso en inglés ya no pone el salto de IMERG en la lluvia principal;
  - en Metodología, la lluvia sale de POWER, IMERG aparece como segunda fuente, la copia local se describe como «los mismos números que la API» y se corrigen los departamentos con pocas celdas.
- Pruebas: `aviso.test.ts` adaptada y 2 pruebas nuevas de `imergDeApi`.

## Comprobado
- La copia local de POWER coincide exactamente con la lluvia que sirve el backend nuevo: 0 diferencias en los 24 departamentos con datos. Con el PR #53, la contradicción desaparece.
- En el navegador, contra el backend del PR #53 en local:
  - la portada muestra otra vez el contraste azul y ocre;
  - Puno: «No coinciden» (+141 frente a −91 mm), con la explicación de 2014;
  - Ucayali: «Coinciden: las dos dicen que llueve menos»;
  - también se probó en tema claro y en inglés.

## Pendiente
- Mezclar después de que el PR #53 del backend se mezcle y se despliegue en Render. Antes de eso, la web sigue igual que hoy: el bloque no aparece porque la API todavía sirve IMERG como lluvia principal.

## Ajustes tras la revisión de Leandro
1. **Actualizado con `developer`** (ya entraron #30 y el backend #53). En `src/api/consultas.ts` y `consultas.test.ts` se conservan las dos partes: `vegetacionDeApi` (#30) e `imergDeApi`, con sus pruebas. `openapi.json` es igual al del backend actual y `schema.d.ts` se regeneró con `pnpm gen`: la mezcla automática lo había dejado con `anios` en vez de `serie`.
2. **«Coinciden» ya no depende solo del signo.** `veredictoDosFuentes()` (`src/features/ficha/utils/dosFuentes.ts`, con 5 pruebas) compara los rangos probables:
   - mismo sentido → «coinciden», o «ninguna de las dos es segura» si los dos rangos cruzan el cero;
   - sentido contrario y rangos que no se tocan → «no coinciden», con la explicación de 2014;
   - sentido contrario y rangos que se tocan → «no se puede decir que se contradigan».

   Con los datos actuales, «no coinciden» baja de 11 a 8 departamentos (3 pasan a «dudoso»).
3. **Revertido el reformateo ajeno de `src/i18n/textos.ts`** (bloque `FAUNA_TEXTOS`): el diff de ese archivo queda solo con los textos del PR.
4. **Menores:**
   - `imergDeApi` toma la unidad de `/api/variables` con `factorUnidad`, en vez de fijar `× 365`;
   - `useSegundaFuente` ya no mira el texto de la fuente: si la lluvia de la ficha viene de la API, IMERG también (un backend sin `lluvia_imerg` da `null` y no se compara); si viene de la copia local, usa la copia de IMERG.

Probado en el navegador:
- con la API de Render actual (todavía sirve IMERG como lluvia principal), el bloque no aparece;
- con la copia local, Puno sale «No coinciden» (+141 frente a −91 mm, con rangos que no se tocan).
