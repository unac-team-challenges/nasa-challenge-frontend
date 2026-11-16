# refactor/datos-locales-diferidos

## Cambiado
- `src/data/power.json` (90 KB, 23 KB gz) sale del código de la web y va en su propio chunk (`power-*.js`), con `import()` dinámico dentro de `cargarPower()` (`datos.ts`). El chunk `datos` baja de 159 KB (45 KB gz) a 71 KB (23 KB gz).
- `main.tsx` espera `cargarPower()` y recién entonces dibuja. Así `zonasDe`, `serie`, `anomaliasAnio`, etc. siguen siendo síncronas y no se toca ninguno de sus ~37 usos. `testing/setup.ts` hace lo mismo con `beforeAll`.
- `PERIODOS`, `ANIOS_NINO` y `GENERADO` pasan de constantes a `export let` (enlaces vivos de ES): valen cuando la carga termina. Si se leen antes, `datos()` lanza un error claro.

## Notas
- Ganancia real: el chunk de datos se guarda aparte y no cambia cuando cambia el código (power.json casi nunca cambia, así que se reutiliza entre despliegues). **No** mejora el primer dibujo: el total de bytes es el mismo y hay una petición más antes de dibujar.
- La copia local no se difiere «hasta que falle la API»: se usa también con la API activa (sin El Niño, máquina del tiempo, periodo largo, metodología).
- `pnpm lint`, `pnpm build`, `pnpm test` (144 pasan) y e2e `recorrido`, `enlaces`, `selector-zona` pasan.
