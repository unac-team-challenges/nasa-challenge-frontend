# feat/metodologia-al-dia

La página `/metodologia` se había quedado en «lluvia y temperatura»: no explicaba la vegetación, el mapa, El Niño ni las zonas especiales, y tenía datos viejos. Además, las palabras técnicas de la ficha ahora llevan a su definición.

## Añadido
- **Secciones nuevas** (cada una con su ancla `m-<id>` y su entrada en el menú de la cabecera):
  - **Cómo leer el mapa**: altura (pendiente de Sen o anomalía), relleno (semáforo), color por celda frente al promedio del departamento (por qué Lima da ~18 °C en el mapa y ~14 °C en la ficha), unidades (lluvia en mm/año = mm/día × 365, NDVI), perfiles y personajes (ilustrativos; su globo sí repite el dato).
  - **Glosario**: Mann-Kendall (TFPW), pendiente de Sen, rango probable (IC 95 %), valor p, valor q (Benjamini-Hochberg), lag1, celda, anomalía y NDVI. Cada término tiene su ancla `g-<término>` y se resalta (`:target`) al llegar desde la ficha.
  - **El Niño, los periodos y la máquina del tiempo**: qué años quita «sin El Niño» (1983, 1998, 2016, 2017 y 2023, los de `ANIOS_NINO` en `scripts/datos_power.py`) y por qué; periodo 2001–2024 frente a 1981–2024.
  - **Zonas con trato especial**: valles del Caso 2 (recuadros, área verde = NDVI > 0,3, Olmos movido), selva (NDVI saturado, MOD44B con umbral de 30 %, La Pampa e Iquitos) y Ucayali (aviso de temperatura, sin cifras fijas: la ficha las da).
  - **Referencias** con DOI (`src/i18n/referencias.ts`): Mann 1945, Sen 1968, Yue et al. 2002 (TFPW), Benjamini-Hochberg 1995, pyMannKendall, MERRA-2, IMERG v07, MOD13A3 v061 y MOD44B v061.
- **Términos subrayados en la ficha** (`src/components/Termino.tsx`): un `Link` de TanStack Router a `/metodologia#g-<término>`, que solo lleva el idioma en la búsqueda. Están en «Cómo lo sabemos» (método, pendiente, p_value, q_value, celdas, lag1, corrección por pruebas múltiples) y en los encabezados Pendiente y q de «¿Se sostiene el resultado?».
- **Botón «Volver»** en `/metodologia` (`useCanGoBack` + `router.history.back()`): solo aparece si hay a dónde volver y regresa a la ficha desde la que se llegó.

## Cambiado
- Fuentes: fila nueva **Vegetación** (MOD13A3 v061 en celdas de 0,25°, 2001–2024); el Caso 2 pasa de «2001 y 2024» a 2001–2024 y nombra los tres valles; versiones v061 en MODIS.
- Cálculo: la regla de los 12 meses vale para lluvia y temperatura; en vegetación bastan 6 meses válidos.
- Límites: «Años completos» explica que POWER ya tiene 2025 y que se corta en 2024 para comparar fuentes en el mismo periodo; nuevo «La montaña» (altura media de la celda en los Andes). «El Niño» y «El periodo importa» pasan a su propia sección.
- Créditos: se agrega MODIS MOD44B; los MODIS enlazan a su página en LP DAAC.
- `Metodologia.tsx`: componentes `Seccion` y `Puntos` para no repetir el marcado en cada sección.

## Notas
- Sin dependencias nuevas. `pnpm lint`, `pnpm build` y `pnpm test` pasan (`/zona/20?perfil=agricultor…` falló una vez con la máquina cargada y pasó al repetir: es el intermitente de `docs/migracion-roturas.md`).
- Tests nuevos: cada término del glosario tiene su ancla; un término de la ficha lleva a su definición y «Volver» regresa (`pantallas.test.tsx`); e2e del salto al glosario con la definición a la vista (`metodologia-tabla.spec.ts`). La tabla de fuentes pasa de 6 a 7 filas.
- Los DOI llevan `overflow-wrap: anywhere`: sin eso la página se desplazaba 15 px de lado a 320 px.

## Pendiente
- Confirmar con el equipo el criterio de los años de El Niño (hoy: lluvias extremas en la costa norte, según el comentario de `scripts/datos_power.py`).
- Subrayar más términos si hace falta (p. ej. NDVI y anomalía dentro de frases de la ficha; hoy solo se subrayan rótulos sueltos).
