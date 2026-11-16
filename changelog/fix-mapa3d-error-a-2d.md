# fix/mapa3d-error-a-2d

## Corregido
- Si el navegador dice tener WebGL pero `new EscenaPeru(...)` falla (tarjeta o controlador roto, sin memoria), el error saltaba desde un `useEffect` hasta el `errorComponent` del router y la persona veía la pantalla de error en vez del mapa. Ahora `Mapa3D` lo atrapa, lo registra con `console.error` y pasa a `conWebgl: false` y `modoMapa: '2d'`: sigue el mapa 2D con los mismos datos.
- Si el contexto WebGL se pierde con la página abierta (típico en celular con poca memoria), la escena avisa con la nueva opción `alPerderContexto` (evento `webglcontextlost`) y se hace lo mismo. Antes el lienzo quedaba en blanco.

## Notas
- Nuevo `Mapa3D.test.tsx`: con una escena que lanza al crearse, el store pasa a 2D (la prueba falla sin el `try/catch`).
- La pérdida de contexto no tiene prueba automática (jsdom no tiene WebGL ni forma de simularla): solo se verificó que el e2e `recorrido`, con 3D real, sigue pasando. Tampoco se intenta restaurar el contexto: el 2D se queda hasta recargar.
- `pnpm lint`, `pnpm build` y `pnpm test` pasan.
