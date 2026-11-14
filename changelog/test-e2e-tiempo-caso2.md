# test/e2e-tiempo-caso2

PR → `developer`. Amplía el e2e al recorrido completo ahora que están mezcladas #5 a #9.

## Añadido
- `e2e/tiempo-caso2.spec.ts`:
  - **Temperatura y máquina del tiempo**: elegir Temperatura, mover el año con el teclado (sale de la tendencia), Play avanza el año, Pausa lo detiene y "Tendencia" vuelve; sin errores en consola.
  - **Caso 2**: la ficha de La Libertad e Ica muestra "La costa que reverdece" con las imágenes de 2001 y 2024; la de Amazonas no.
- `pnpm e2e` en el README.

## Pendiente
- El cliente de la API y su prueba cuando el frontend consuma el backend.
