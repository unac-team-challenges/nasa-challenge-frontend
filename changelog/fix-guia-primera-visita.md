# fix/guia-primera-visita

La guía de uso solo arrancaba en el explorador (`/explorar`): quien entraba por la portada no la veía hasta tocar «Explorar».

- La portada monta la guía en modo `portada` (en `app/router.tsx`, porque una feature no importa otra). En la primera visita sale el paso 1 (tarjeta al centro, no señala nada).
- «Siguiente» lleva a `/explorar` (con el idioma y la búsqueda de la URL) y el tour sigue en el paso 2 sobre el mapa.
- «Saltar la guía» o Esc la cierran y se queda en la portada. Se marca como vista igual que antes (`guia-vista`).
- Pruebas: dos unitarias en `Guia.test.tsx` y una e2e por pantalla en `e2e/guia.spec.ts`.
