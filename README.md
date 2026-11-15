# nasa-challenge-frontend

Detective del Perú · NASA Space Apps Challenge 2026 (equipo NASA-CHALLENGE-UNAC).

Interfaz web: un mapa del Perú en 3D donde cada departamento sube o se hunde según cuánto cambió una variable de NASA, con una ficha que dice cuánto cambió y si el cambio es real o casualidad.

## Uso

Se usa **pnpm** (decisión del equipo, 14 nov). La versión exacta está en `packageManager` de `package.json`.

```bash
npm install -g pnpm@10    # una sola vez (o: corepack enable pnpm, si tienes permisos de administrador)
pnpm install
pnpm dev                  # http://localhost:5173
pnpm build                # revisa tipos y genera dist/
pnpm lint                 # eslint
pnpm format               # prettier
pnpm test                 # vitest + Testing Library (jsdom)
pnpm e2e                  # Playwright: recorridos completos (primera vez: pnpm exec playwright install chromium)
E2E_PORT=4391 pnpm e2e    # si el puerto 4173 ya está ocupado
```

> **Red del evento:** el wifi de la sede corta `registry.npmjs.org` (`ECONNRESET`). Para instalar paquetes, conéctate al hotspot del celular.

## Stack

| Parte                    | Librería                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Base                     | React 19 + Vite 8 + TypeScript                                                                                                                |
| Mapa                     | **three.js** (3D) con respaldo 2D en SVG. Reemplaza a Leaflet: ver `15-decision-mapa-threejs-14nov.md` en el Drive                            |
| Estilos y componentes    | Tailwind CSS v4 (`@tailwindcss/vite`) + **shadcn/ui** (`Button`, `Alert` y `Skeleton` en `src/components/ui`, estilo new-york) + lucide-react |
| Calidad                  | **ESLint** (typescript-eslint, react-hooks) + Prettier + Vitest + **Testing Library** (jsdom) + Playwright                                    |
| Datos del servidor       | TanStack Query + openapi-fetch (`src/api`), con la copia local como plan B                                                                    |
| Rutas y enlaces          | **TanStack Router** (`src/router.tsx`) + **Zod** (`src/lib/busqueda.ts`): ver «Rutas y enlaces»                                               |
| Estado global            | Zustand (`src/store.ts`): idioma, tema, fuente de datos, vista 3D/2D, informe abierto, Play y «sin El Niño». Lo que se comparte va en la URL  |
| Gráficos                 | SVG propio (`GraficoSerie`) para la serie de la ficha                                                                                         |
| Antes y después (Caso 2) | react-compare-slider                                                                                                                          |
| Letra "Carta"            | Newsreader + Public Sans (`@fontsource-variable`, incluidas en el build: funcionan sin internet)                                              |

shadcn/ui se agrega por componente: `pnpm dlx shadcn@latest add <componente>` (si el CLI no encuentra `pnpm`, ponlo en el `PATH`; y quita el paquete `cn` que a veces agrega por error: la utilidad ya está en `src/lib/utils.ts`). Sus colores apuntan a nuestros tokens en `src/shadcn.css` (`accent` sigue siendo el cochinilla del proyecto). `Button` tiene las variantes del proyecto: `default` (acción), `outline` (herramienta), `toggle` (opción de un grupo, con `aria-pressed`) y `ghost`.

TypeScript va en 6.0 porque typescript-eslint todavía no soporta TS 7.

## Rutas y enlaces

Cada vista es un enlace que se puede compartir (también cada caso de la demo):

| Ruta           | Pantalla                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| `/`            | Portada                                                                                  |
| `/explorar`    | Explorador (mapa, leyenda, máquina del tiempo e informe cerrado)                         |
| `/zona/20`     | Explorador con la ficha del departamento `20` (ubigeo `01`–`25`; otro id da «no existe») |
| `/metodologia` | Metodología, fuentes y créditos                                                          |

Búsqueda opcional, validada con Zod (un valor inválido se ignora): `variable` (`lluvia` o `temperatura`), `perfil` (`publico`, `agricultor`, `municipalidad`, `estudiante`) y `anio` (máquina del tiempo). Ejemplo: `/zona/20?variable=lluvia&perfil=agricultor&anio=2017`. Los componentes leen y cambian estos valores con `useBusqueda()` (`src/lib/busqueda.ts`). Vercel necesita el _rewrite_ de `vercel.json` para recargar en rutas como `/zona/20`.

## Esperas y errores

- `src/components/Esperas.tsx`: esqueletos con la forma de lo que reemplazan (mapa, gráfico, ficha, explorador, página de texto).
- `src/components/Errores.tsx`: pantalla de error con «Reintentar» (el router la usa si una pantalla falla), ruta que no existe y el aviso cuando la serie de una zona no llega de la API.
- El 3D (three.js), el gráfico, el explorador y la metodología se descargan aparte (`React.lazy` y rutas lazy); la portada ya no carga todo el JavaScript de golpe.

## Metadatos

`index.html` trae las etiquetas en español (título, descripción, Open Graph, Twitter y `theme-color` para tema claro y oscuro; es lo único que leen los rastreadores sin JavaScript). `src/lib/meta.ts` las actualiza según pantalla, idioma y tema, y `public/favicon.svg` cambia de color con el tema del sistema. **Pendiente:** `og:image` (`/og.png`) debe ser una URL absoluta (`https://<dominio>/og.png`) cuando se defina el dominio.

## Datos y periodo

Con la API del backend (`VITE_API_URL`) se muestra **2001–2024** (lluvia GPM IMERG, temperatura MERRA-2 vía POWER). Si no responde, la copia local (`src/data/power.json`, NASA POWER) muestra **1981–2024**. «Sin El Niño» y la máquina del tiempo usan siempre la copia local. Detalle en `/metodologia` y `docs/para-favio.md`.

## Pendiente de decisión

Lo que depende de producto, diseño o datos está en [`docs/para-favio.md`](docs/para-favio.md).

## Diseño

Los colores salen del prototipo v2. Están como variables CSS en `src/index.css` y como clases de Tailwind (`bg-map-up`, `bg-map-down`, `bg-map-green`, `bg-accent`, `font-display`…):

- **Humboldt** (oscuro) y **Garúa** (claro), según el sistema, o forzados con `data-theme`.
- Azul = más, ocre = menos, verde = más vegetación. El acento cochinilla se usa solo en selección y botones.

## Ramas

- `developer`: integración (vista previa en Vercel).
- `main`: producción. Solo recibe PR desde `developer`.
