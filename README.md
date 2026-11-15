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
pnpm test                 # vitest
pnpm e2e                  # Playwright: recorrido completo (primera vez: pnpm exec playwright install chromium)
```

> **Red del evento:** el wifi de la sede corta `registry.npmjs.org` (`ECONNRESET`). Para instalar paquetes, conéctate al hotspot del celular.

## Stack

| Parte                    | Librería                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Base                     | React 19 + Vite 8 + TypeScript                                                                                             |
| Mapa                     | **three.js** (3D) con respaldo 2D en SVG. Reemplaza a Leaflet: ver `15-decision-mapa-threejs-14nov.md` en el Drive         |
| Estilos y componentes    | Tailwind CSS v4 (`@tailwindcss/vite`) + **shadcn/ui** (componentes en `src/components/ui`, estilo new-york) + lucide-react |
| Calidad                  | **ESLint** (typescript-eslint, react-hooks) + Prettier + Vitest                                                            |
| Datos del servidor       | TanStack Query                                                                                                             |
| Rutas y enlaces          | TanStack Router + Zod (`/zona/20?perfil=agricultor&variable=lluvia`)                                                       |
| Estado de la pantalla    | Zustand                                                                                                                    |
| Gráficos                 | Recharts                                                                                                                   |
| Antes y después (Caso 2) | react-compare-slider                                                                                                       |
| Letra "Carta"            | Newsreader + Public Sans (`@fontsource-variable`, incluidas en el build: funcionan sin internet)                           |

shadcn/ui se agrega por componente: `pnpm dlx shadcn@latest add button`. Sus colores apuntan a nuestros tokens en `src/shadcn.css` (`accent` sigue siendo el cochinilla del proyecto).

TypeScript va en 6.0 porque typescript-eslint todavía no soporta TS 7.

Pendiente: el cliente `openapi-*`, en una PR aparte (el backend ya publica `openapi.json`, PR #21 del backend).

## Diseño

Los colores salen del prototipo v2. Están como variables CSS en `src/index.css` y como clases de Tailwind (`bg-map-up`, `bg-map-down`, `bg-map-green`, `bg-accent`, `font-display`…):

- **Humboldt** (oscuro) y **Garúa** (claro), según el sistema, o forzados con `data-theme`.
- Azul = más, ocre = menos, verde = más vegetación. El acento cochinilla se usa solo en selección y botones.

## Ramas

- `developer`: integración (vista previa en Vercel).
- `main`: producción. Solo recibe PR desde `developer`.
