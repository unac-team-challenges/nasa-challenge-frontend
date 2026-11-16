# fix/guia-primera-visita

La guía de uso solo arrancaba en el explorador (`/explorar`): quien entraba por la portada no la veía hasta tocar «Explorar».

- La portada monta la guía en modo `portada` (en `app/router.tsx`, porque una feature no importa otra). En la primera visita sale el paso 1 (tarjeta al centro, no señala nada).
- «Siguiente» lleva a `/explorar` (con el idioma y la búsqueda de la URL) y el tour sigue en el paso 2 sobre el mapa.
- «Saltar la guía» o Esc la cierran y se queda en la portada. Se marca como vista igual que antes (`guia-vista`).
- Pruebas: dos unitarias en `Guia.test.tsx` y una e2e por pantalla en `e2e/guia.spec.ts`.
- Mapa 3D: el clic derecho ya no desplaza la cámara (podía atravesar el mapa) ni elige departamento. `OrbitControls` con `enablePan = false` (también cortaba Ctrl+arrastre, teclado y dos dedos sin límite) y solo el botón principal elige zona. Prueba: `e2e/mapa3d-clic-derecho.spec.ts`.
