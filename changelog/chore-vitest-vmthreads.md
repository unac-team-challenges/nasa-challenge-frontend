# chore/vitest-vmthreads

## Cambiado
- `vite.config.ts` (bloque `test`): `pool: 'vmThreads'`. Vitest recomendaba esto al terminar la suite: creaba jsdom 23 veces (una por archivo, ~23 s de CPU acumulada). Con `vmThreads` se crea una vez por worker y cada archivo sigue aislado.
- Medido en esta máquina, 3 corridas cada una: ~9,2 s (valor por defecto) → ~5,2 s (`vmThreads`); los mismos 148 tests pasan, 4 omitidos.

## Notas
- Vitest avisa que `vmThreads` puede crecer en memoria con suites grandes. La nuestra es chica (24 archivos). Si la memoria del CI sube, basta quitar la línea.
- Corrida del CI sin medir: solo se comprobó en local.
