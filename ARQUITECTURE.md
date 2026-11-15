# ARQUITECTURE.md

Arquitectura de carpetas del frontend (`src/`). Basada en [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md), adaptada a este proyecto. **Estado: objetivo.** La migración se hace con `docs/superpowers/plans/2026-11-14-migracion-arquitectura.md`.

## 1. Idea en una línea

Una pantalla = una **feature** (carpeta que se basta sola). Lo que usan varias features vive en **capas compartidas**. La **app** une features. Las dependencias van en un solo sentido:

```
compartido  ──►  features  ──►  app
(components, hooks, lib,        (app/: router, layout,
 utils, stores, api, data,       rutas que juntan features)
 i18n)
```

- Compartido **no** importa de `features/` ni de `app/`.
- Una feature importa de compartido, **nunca de otra feature** ni de `app/`.
- `app/` importa de todo.

## 2. Árbol objetivo

```
src
├── main.tsx                 # entrada de Vite (index.html la referencia)
├── index.css, shadcn.css    # estilos globales
│
├── app/                     # une features: aquí SÍ se mezclan
│   ├── App.tsx              # layout raíz (Cabecera + <Outlet>)
│   ├── router.tsx           # TanStack Router (definición de rutas)
│   └── rutas/
│       ├── Inicio.tsx       # Portada + Mapa3D
│       └── Explorador.tsx   # Mapa + Leyenda + BarraTiempo + Ficha
│
├── features/
│   ├── mapa/                # mapa del Perú: 3D (three.js) y 2D (SVG)
│   │   ├── components/      # Mapa2D, Mapa3D, Leyenda
│   │   ├── escena/          # escena.ts, fauna.ts (three.js)
│   │   └── utils/           # suelo2d.ts
│   ├── ficha/               # informe de una zona
│   │   ├── components/      # Ficha, GraficoSerie, AntesDespues
│   │   └── data/            # caso2.ts (valles del Caso 2)
│   ├── tiempo/components/   # BarraTiempo (Play / año)
│   ├── portada/components/  # Portada
│   └── metodologia/components/  # Metodologia
│
├── components/              # UI compartida
│   ├── ui/                  # shadcn (Button, Alert, Skeleton)
│   ├── Cabecera.tsx, Errores.tsx, Esperas.tsx
├── hooks/                   # useZonas, useMeta (meta.ts), useRuta (ruta.ts)
├── lib/                     # librerías ya configuradas: busqueda.ts (Zod + router), utils.ts (cn)
├── utils/                   # funciones puras: color, direccion, formato, webgl
├── stores/                  # app.ts (Zustand global)
├── api/                     # cliente openapi-fetch, consultas, schema.d.ts, openapi.json
├── data/                    # copia local (plan B): datos.ts + json
├── i18n/                    # textos.ts (es/en)
└── testing/                 # render.tsx, setup.ts
```

Cada feature lleva **solo** las subcarpetas que necesita (`components/`, `hooks/`, `stores/`, `utils/`, `data/`…). No se crean vacías.

## 3. Reglas

1. **Una feature no importa de otra.** Si dos features se necesitan, se juntan en `app/rutas/` o se pasan por props (`Portada` recibe el mapa como prop `mapa`, no importa `Mapa3D`).
2. **Estado que usan 2+ features → `stores/`** (global). Estado de una sola feature → `features/<x>/stores/`. Hoy `Mapa`, `Ficha` y `BarraTiempo` se hablan por `stores/app.ts` y por la URL (`lib/busqueda.ts`); no se importan entre sí.
3. **Sin barrel files** (`index.ts` que re-exporta). Se importa el archivo directo: `@/features/mapa/components/Mapa3D`.
4. **Todo import entre archivos usa `@/`** (alias de `src/`). Nada de `./x` ni `../x`.
5. **Nombres de archivo se quedan como están** (`PascalCase.tsx` para componentes). No hay migración a kebab-case.
6. **Idioma de carpetas: español**, igual que el código. El idioma de la interfaz (es/en) no tiene que ver: eso lo resuelve `i18n/textos.ts` y no cambia con los nombres de carpetas.
7. **Tests junto al archivo** que prueban (`useZonas.test.ts` al lado de `useZonas.ts`). E2E sigue en `e2e/`.

## 4. ¿Dónde pongo X?

| Es… | Va en… |
|---|---|
| Componente que solo usa una pantalla | `features/<x>/components/` |
| Componente que usan 2+ features (y no sabe de negocio) | `components/` |
| Componente shadcn | `components/ui/` (`pnpm dlx shadcn@latest add …`) |
| Pantalla que junta 2+ features | `app/rutas/` |
| Hook que usan 2+ features | `hooks/` |
| Hook de una feature | `features/<x>/hooks/` |
| Función pura (formato, color) | `utils/` (compartida) o `features/<x>/utils/` |
| Config de librería (Zod, cn, cliente) | `lib/` o `api/` |
| Texto de interfaz | `i18n/textos.ts` |
| Estado global | `stores/` |
| Mock o helper de test | `testing/` |

## 5. Cómo se hace cumplir

`eslint.config.js` usa la regla **nativa** `no-restricted-imports` (sin plugin nuevo):

- Prohíbe imports relativos (`./`, `../`).
- Compartido no puede importar `@/features/**` ni `@/app/**`.
- Cada feature no puede importar `@/app/**` ni las otras features (la lista se arma leyendo `src/features/`, así una feature nueva queda protegida sola).
- `testing/` está exento (monta el router real).

`pnpm lint` falla si alguien rompe una regla. Imports dinámicos (`lazy(() => import(...))`) también se revisan; el plan lo verifica con una violación de prueba.

## 6. Qué cambia respecto a hoy

| Hoy | Después |
|---|---|
| `App.tsx`, `router.tsx` | `app/App.tsx`, `app/router.tsx` |
| `components/Explorador.tsx` | `app/rutas/Explorador.tsx` |
| (Portada con `Mapa3D` adentro) | `app/rutas/Inicio.tsx` pasa el mapa a `Portada` |
| `mapa/Mapa2D.tsx`, `Mapa3D.tsx` | `features/mapa/components/` |
| `components/Leyenda.tsx` | `features/mapa/components/Leyenda.tsx` |
| `mapa/escena.ts`, `fauna.ts` | `features/mapa/escena/` |
| `mapa/suelo2d.ts` | `features/mapa/utils/suelo2d.ts` |
| `components/Ficha.tsx`, `GraficoSerie.tsx`, `AntesDespues.tsx` | `features/ficha/components/` |
| `data/caso2.ts` | `features/ficha/data/caso2.ts` |
| `components/BarraTiempo.tsx` | `features/tiempo/components/` |
| `components/Portada.tsx` | `features/portada/components/` |
| `components/Metodologia.tsx` | `features/metodologia/components/` |
| `store.ts` | `stores/app.ts` |
| `lib/useZonas.ts` (+test), `lib/meta.ts`, `lib/ruta.ts` | `hooks/` |
| `lib/color.ts`, `direccion.ts`, `formato.ts`, `webgl.ts` | `utils/` |
| `test/` | `testing/` |
| Imports `./x` y `../x` | `@/x` |

**Se quedan igual:** `main.tsx`, `index.css`, `shadcn.css`, `api/`, `i18n/`, `data/datos.ts` y los json, `components/{ui,Cabecera,Errores,Esperas}`, `lib/busqueda.ts`, `lib/utils.ts` (shadcn lo exige en `@/lib/utils`), `e2e/`.

## 7. Fuera de alcance (a propósito)

- Partir `i18n/textos.ts` (740 líneas) por feature.
- Partir `features/mapa/escena/escena.ts` (1251 líneas).
- Renombrar archivos (kebab-case, `useMeta.ts`, `useRuta.ts`).
- Mover `api/` y `data/` dentro de features: los usan varias features.

## 8. Cómo agregar una feature nueva

1. `src/features/<nombre>/components/<Pantalla>.tsx` (solo las subcarpetas que hagan falta).
2. Importa solo de capas compartidas, con `@/`.
3. Si necesita datos de otra feature: sube ese dato a `stores/` o `hooks/`, o júntalas en `app/rutas/`.
4. Registra la ruta en `app/router.tsx`.
5. `pnpm lint && pnpm test && pnpm build`.

## 9. Para Claude

Este archivo se importa en `CLAUDE.md` del frontend con `@ARQUITECTURE.md`, así cada sesión conoce las carpetas y las reglas.
