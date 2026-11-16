# fix/ocultar-perfil-inicio

En la portada había dos pares de botones con la misma acción: la tarjeta «¿Quién eres?» (Agricultor / Estudiante) y el grupo de perfil de la cabecera, arriba a la derecha.

- La cabecera esconde el grupo de perfil en el inicio, en español y en inglés (`src/components/Cabecera.tsx`). En `/explorar`, `/zona/:id` y `/metodologia` sigue igual.
- Al entrar al mapa, el grupo aparece en su sitio con una entrada breve (opacidad y un descenso de 6 px, 300 ms). Al volver al inicio con el logo, sale en 200 ms. Está al final de la fila, así que no mueve ni tapa otros controles.
- Solo CSS, sin JavaScript nuevo: transición de `opacity`, `translate` y `visibility`. Con `prefers-reduced-motion` cambia sin animación.
- Se oculta con `visibility: hidden` y no con `display: none`, para que guarde su sitio. Con `display: none`, entre 901 y unos 1150 px la cabecera tenía 1 fila en el inicio y 2 en el mapa (71 px contra 121 px), y las variables saltaban de fila al aparecer el perfil. Así la cabecera mide igual en todas las páginas y anchos, como antes de este cambio.
- Mientras está oculto lleva `inert`: no recibe foco ni lo anuncia el lector de pantalla. En la portada la guía solo muestra su primer paso, que no señala nada, así que nunca apunta al perfil oculto.
- Se usa el atributo `data-oculto` y no la variante `inert:` de Tailwind, porque esa también aplica a los hijos (`[inert] *`) y cambiaría los botones de golpe, sin la animación de salida.
- Pruebas: un e2e nuevo en `e2e/cabecera-perfil.spec.ts` (oculto en el inicio, visible tras «Explorar el mapa», oculto otra vez tras el logo).
