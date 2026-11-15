# fix/quitar-selector-departamento

Se quita la lista desplegable de departamentos (la flecha) de la ficha: cambiar de zona se hace tocando el mapa.

## Quitado
- **`SelectorZona`** (`features/ficha/components/`), con su prueba `e2e/selector-zona.spec.ts` y los textos `zonaLbl` / `zonaElegir` (es/en).
- Del informe con zona elegida: ya no hay lista a la derecha de «Departamento de la …»; queda solo el texto.
- Del informe sin zona elegida: ya no hay lista bajo «Toca un departamento».

## Notas
- Reemplaza lo añadido en `feat/selector-departamento` (su changelog se queda como historia).
- `pnpm lint`, `pnpm test` y `pnpm build` pasan.
