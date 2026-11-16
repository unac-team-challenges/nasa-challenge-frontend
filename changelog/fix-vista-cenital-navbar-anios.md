# fix/vista-cenital-navbar-anios

## Corregido
- **Mapa de la portada visto desde arriba.** La cámara de inicio pasa de una vista baja y de costado (`pos [8, 19, 72]`) a una casi cenital (`pos [0, 85, 10]`, `tgt [0, 0, 0]`). El Perú entra completo con sus departamentos en 1440, 1000 y 390 px. El vuelo portada → explorador y la vuelta siguen funcionando con `setModo`. Se corrigieron los comentarios que hablaban de la «franja de cielo» de la vista de inicio.
- **Navbar: variables a la izquierda y perfiles a la derecha.** El grupo de perfiles (Farmer / Student) se pega a la derecha con `ml-auto`, también en la tira deslizable del celular. Va en rosado con los tokens del tema: `text-accent-text` si está inactivo y `bg-accent` + `text-accent-fg` si está activo. Así respeta el tema claro (`#a8285a`) y el oscuro (`#e0457b`).
- **Años en una sola línea.** En la barra de tiempo de escritorio, `2001–2024` ya no se parte en dos líneas (`whitespace-nowrap`). En tendencia la letra baja de 15 a 14 px para que el rango quepa centrado en los 78 px útiles de la barra, sin ensancharla.

## Agregado
- `data-guia="variables"`, `data-guia="perfil"` y `data-guia="tiempo"` para que la guía de uso se enganche a esos elementos.

## Notas
- Desde arriba ya no se ven el cielo, la luna ni su reflejo en el mar en la portada: era lo que pedía el cambio. Siguen apareciendo si el usuario inclina la cámara.
- El giro automático de la portada se mantiene: desde arriba, el Perú gira sobre sí mismo como un disco.
- Contraste del perfil (AA, 14 px): inactivo 5,41 (claro) y 5,22 (oscuro); activo 6,74 y 4,88.
- Entre 901 y ~1100 px la cabecera ya ocupaba 3 filas antes de este cambio. Sigue igual.

## Pendiente
- Capturas de antes y después en el PR.
